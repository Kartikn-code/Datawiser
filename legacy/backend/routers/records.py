from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
import pandas as pd
from database import get_db
import models, schemas
from insights_engine import calculate_metrics, filter_records, records_to_dataframe
from security import get_current_user

router = APIRouter(prefix="/api/records", tags=["Records"])

@router.get("/{upload_id}")
def get_records(
    upload_id: int,
    skip: int = 0,
    limit: int = 100,
    q: str | None = None,
    route: str | None = None,
    truck: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    db: Session = Depends(get_db),
    _user: models.User = Depends(get_current_user),
):
    query = db.query(models.Record).filter(models.Record.upload_id == upload_id).order_by(desc(models.Record.created_at))
    all_records = query.all()

    if q or route or truck or start_date or end_date:
        df = records_to_dataframe([r.data for r in all_records])
        df["__record_id"] = [r.id for r in all_records]
        filtered = filter_records(df, truck=truck, route=route, start_date=start_date, end_date=end_date, query=q)
        dataset = filtered.where(pd.notna(filtered), None).to_dict(orient="records")
        total = len(dataset)
        page = dataset[skip: skip + limit]
        records = [
            {
                "id": int(row.pop("__record_id")),
                "upload_id": upload_id,
                "data": row,
            }
            for row in page
        ]
        return {"total": total, "records": records}

    total = len(all_records)
    records = all_records[skip: skip + limit]
    
    return {"total": total, "records": records}


@router.post("/", response_model=schemas.RecordResponse)
def create_record(
    record: schemas.RecordCreate,
    upload_id: int,
    db: Session = Depends(get_db),
    _user: models.User = Depends(get_current_user),
):
    db_record = models.Record(upload_id=upload_id, data=record.data)
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    _refresh_metric(upload_id, db)
    return db_record

@router.put("/{record_id}", response_model=schemas.RecordResponse)
def update_record(
    record_id: int,
    record: schemas.RecordCreate,
    db: Session = Depends(get_db),
    _user: models.User = Depends(get_current_user),
):
    db_record = db.query(models.Record).filter(models.Record.id == record_id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="Record not found")
        
    db_record.data = record.data
    db.commit()
    db.refresh(db_record)
    _refresh_metric(db_record.upload_id, db)
    return db_record

@router.delete("/{record_id}")
def delete_record(
    record_id: int,
    db: Session = Depends(get_db),
    _user: models.User = Depends(get_current_user),
):
    db_record = db.query(models.Record).filter(models.Record.id == record_id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="Record not found")

    upload_id = db_record.upload_id
    db.delete(db_record)
    db.commit()
    if upload_id:
        _refresh_metric(upload_id, db)
    return {"message": "Record deleted successfully"}


def _refresh_metric(upload_id: int, db: Session) -> None:
    rows = db.query(models.Record).filter(models.Record.upload_id == upload_id).all()
    if not rows:
        db.query(models.Metric).filter(models.Metric.upload_id == upload_id).delete()
        db.commit()
        return

    df = records_to_dataframe([r.data for r in rows])
    metrics = calculate_metrics(df)
    metric = db.query(models.Metric).filter(models.Metric.upload_id == upload_id).first()
    if not metric:
        metric = models.Metric(upload_id=upload_id)
        db.add(metric)

    metric.total_revenue = metrics["total_revenue"]
    metric.total_trips = metrics["total_trips"]
    metric.profit_loss = metrics["profit_loss"]
    db.commit()
