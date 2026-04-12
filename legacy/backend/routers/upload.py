from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from cleaning_engine import process_file
from insights_engine import calculate_metrics
import pandas as pd
import io
import os
import shutil
import json
from security import get_current_user

router = APIRouter(prefix="/api", tags=["Upload"])

UPLOAD_DIR = "uploaded_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    try:
        # Create DB entry
        db_upload = models.Upload(
            user_id=user.id,
            file_name=file.filename,
            file_type=file.content_type,
            status="pending"
        )
        db.add(db_upload)
        db.commit()
        db.refresh(db_upload)

        # Save file to disk securely
        file_path = os.path.join(UPLOAD_DIR, f"{db_upload.id}_{file.filename}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return {"upload_id": db_upload.id, "message": "File uploaded successfully."}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/process/{upload_id}")
async def process_upload(
    upload_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    db_upload = db.query(models.Upload).filter(models.Upload.id == upload_id).first()
    if not db_upload:
        raise HTTPException(status_code=404, detail="Upload not found")

    if db_upload.user_id and db_upload.user_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Upload access denied")
        
    if db_upload.status == "processed":
        return {"message": "Already processed", "upload_id": upload_id}

    file_path = os.path.join(UPLOAD_DIR, f"{db_upload.id}_{db_upload.file_name}")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File missing on disk")
        
    try:
        with open(file_path, "rb") as f:
            contents = f.read()
            
        # 1. Process via AI/Pandas Engine
        result = process_file(contents, db_upload.file_name)

        processed_csv_path = os.path.join(UPLOAD_DIR, f"{upload_id}_processed.csv")
        with open(processed_csv_path, "w", encoding="utf-8") as processed_file:
            processed_file.write(result["csv_download"])

        schema_path = os.path.join(UPLOAD_DIR, f"{upload_id}_schema.json")
        with open(schema_path, "w", encoding="utf-8") as schema_file:
            json.dump({"columns": result["columns"], "stats": result["stats"]}, schema_file)
        
        # 2. Insert Records (Strictly JSONB style, keeping headers exact or cleaned)
        clean_df = pd.read_csv(io.StringIO(result["csv_download"]))
        clean_df = clean_df.where(pd.notnull(clean_df), None)
        
        records_to_insert = []
        
        for _, row in clean_df.iterrows():
            row_dict = dict(row)

            db_record = models.Record(
                upload_id=upload_id,
                data=row_dict
            )
            records_to_insert.append(db_record)
            
        db.add_all(records_to_insert)

        # Clean older metrics for this upload and recompute using the dynamic engine
        db.query(models.Metric).filter(models.Metric.upload_id == upload_id).delete()
        metrics = calculate_metrics(clean_df)
        
        # 3. Create Metrics
        db_metric = models.Metric(
            upload_id=upload_id,
            total_revenue=metrics["total_revenue"],
            total_trips=metrics["total_trips"],
            profit_loss=metrics["profit_loss"],
        )
        db.add(db_metric)
        
        # 4. Mark uploaded as processed
        db_upload.status = "processed"
        db.commit()
        
        return {
            "message": "Data cleaned and structured successfully.",
            "stats": result["stats"],
            "metrics": {
                "total_rows": len(records_to_insert),
                "total_revenue": metrics["total_revenue"],
                "profit_loss": metrics["profit_loss"],
            },
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))
