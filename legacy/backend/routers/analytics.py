from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
from insights_engine import calculate_metrics, records_to_dataframe
from security import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/{upload_id}")
def get_analytics(
    upload_id: int,
    db: Session = Depends(get_db),
    _user: models.User = Depends(get_current_user),
):
    rows = db.query(models.Record).filter(models.Record.upload_id == upload_id).all()
    if not rows:
        return {
            "total_revenue": 0,
            "total_expense": 0,
            "total_trips": 0,
            "profit_loss": 0,
            "pending_deliveries": 0,
            "route_stats": [],
            "truck_stats": [],
            "monthly_trend": [],
            "schema": [],
        }

    df = records_to_dataframe([r.data for r in rows])
    return calculate_metrics(df)
