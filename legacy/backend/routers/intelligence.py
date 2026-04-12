from io import BytesIO

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database import get_db
import models
from insights_engine import (
    build_report,
    calculate_metrics,
    filter_records,
    generate_alerts,
    generate_prediction,
    records_to_dataframe,
)
from security import get_current_user, require_admin

router = APIRouter(prefix="/api/intelligence", tags=["Intelligence"])


def _load_df(db: Session, upload_id: int) -> pd.DataFrame:
    rows = db.query(models.Record).filter(models.Record.upload_id == upload_id).all()
    if not rows:
        raise HTTPException(status_code=404, detail="No records found for upload")
    return records_to_dataframe([r.data for r in rows])


@router.get("/summary/{upload_id}")
def summary(upload_id: int, db: Session = Depends(get_db), _user=Depends(get_current_user)):
    df = _load_df(db, upload_id)
    return calculate_metrics(df)


@router.get("/alerts/{upload_id}")
def alerts(upload_id: int, db: Session = Depends(get_db), _user=Depends(get_current_user)):
    df = _load_df(db, upload_id)
    metrics = calculate_metrics(df)
    return {"alerts": generate_alerts(metrics)}


@router.get("/reports/{upload_id}")
def reports(
    upload_id: int,
    period: str = Query(default="monthly", pattern="^(daily|weekly|monthly)$"),
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    df = _load_df(db, upload_id)
    metrics = calculate_metrics(df)
    return build_report(metrics, period)


@router.get("/predictions/{upload_id}")
def predictions(upload_id: int, db: Session = Depends(get_db), _user=Depends(get_current_user)):
    df = _load_df(db, upload_id)
    metrics = calculate_metrics(df)
    return generate_prediction(metrics)


@router.get("/search/{upload_id}")
def search(
    upload_id: int,
    truck: str | None = None,
    route: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    q: str | None = None,
    limit: int = Query(default=200, ge=1, le=1000),
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    df = _load_df(db, upload_id)
    filtered = filter_records(df, truck=truck, route=route, start_date=start_date, end_date=end_date, query=q)
    total = len(filtered)
    return {
        "total": total,
        "records": filtered.head(limit).where(pd.notna(filtered), None).to_dict(orient="records"),
    }


@router.get("/invoice/{upload_id}/{record_id}")
def generate_invoice(
    upload_id: int,
    record_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    rec = (
        db.query(models.Record)
        .filter(models.Record.upload_id == upload_id, models.Record.id == record_id)
        .first()
    )
    if not rec:
        raise HTTPException(status_code=404, detail="Record not found")

    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas
    except ImportError as exc:
        raise HTTPException(status_code=500, detail="Install reportlab for PDF invoice support") from exc

    payload = rec.data or {}
    freight = 0.0
    for key, val in payload.items():
        if "freight" in str(key).lower() or "amount" in str(key).lower():
            try:
                freight = float(str(val).replace(",", ""))
                break
            except Exception:
                continue

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawString(40, height - 50, "Transport Invoice")
    pdf.setFont("Helvetica", 11)
    pdf.drawString(40, height - 80, f"Upload ID: {upload_id}")
    pdf.drawString(220, height - 80, f"Record ID: {record_id}")

    y = height - 120
    for key, value in payload.items():
        pdf.drawString(40, y, f"{key}: {value}")
        y -= 18
        if y < 80:
            pdf.showPage()
            y = height - 60

    pdf.setFont("Helvetica-Bold", 13)
    pdf.drawString(40, 50, f"Total Freight: INR {freight:,.2f}")

    pdf.save()
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=invoice_{upload_id}_{record_id}.pdf"},
    )
