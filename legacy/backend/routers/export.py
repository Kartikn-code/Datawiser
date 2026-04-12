import io

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database import get_db
import models
from security import get_current_user

router = APIRouter(prefix="/api/export", tags=["Export"])


@router.get("/{upload_id}/csv")
def export_csv(upload_id: int, db: Session = Depends(get_db), _user=Depends(get_current_user)):
    rows = db.query(models.Record).filter(models.Record.upload_id == upload_id).all()
    if not rows:
        raise HTTPException(status_code=404, detail="No records available")

    df = pd.DataFrame([r.data for r in rows])
    content = df.to_csv(index=False)
    return StreamingResponse(
        io.StringIO(content),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=upload_{upload_id}_cleaned.csv"},
    )


@router.get("/{upload_id}/xlsx")
def export_xlsx(upload_id: int, db: Session = Depends(get_db), _user=Depends(get_current_user)):
    rows = db.query(models.Record).filter(models.Record.upload_id == upload_id).all()
    if not rows:
        raise HTTPException(status_code=404, detail="No records available")

    df = pd.DataFrame([r.data for r in rows])
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="CleanedData")
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=upload_{upload_id}_cleaned.xlsx"},
    )
