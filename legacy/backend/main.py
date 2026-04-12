from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
import traceback
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

# Import database and create tables
import models
from database import engine, get_db
models.Base.metadata.create_all(bind=engine)

# Import routers
from routers import analytics, auth, export, intelligence, records, upload
from insights_engine import calculate_metrics, records_to_dataframe
from security import get_current_user

app = FastAPI(title="Transport Intelligence API")

# Allow all origins for MVP simplicity
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(upload.router)
app.include_router(records.router)
app.include_router(analytics.router)
app.include_router(export.router)
app.include_router(intelligence.router)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Transport Intelligence API is running"}

# Chat logic kept here temporarily 
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from chat_engine import generate_insights

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatPayload(BaseModel):
    messages: Optional[List[ChatMessage]] = None
    context: Optional[Dict[str, Any]] = None
    question: Optional[str] = None
    upload_id: Optional[int] = None

@app.post("/api/chat")
async def chat_with_data(
    payload: ChatPayload,
    db: Session = Depends(get_db),
    _user: models.User = Depends(get_current_user),
):
    try:
        context = payload.context or {}

        messages = payload.messages or []
        if payload.question and not messages:
            messages = [ChatMessage(role="user", content=payload.question)]

        if payload.upload_id:
            rows = db.query(models.Record).filter(models.Record.upload_id == payload.upload_id).all()
            df = records_to_dataframe([r.data for r in rows])
            metrics = calculate_metrics(df)
            preview = df.head(5).where(df.notna(), None).to_dict(orient="records") if not df.empty else []
            context = {
                "stats": {
                    "total_rows": metrics.get("total_trips", 0),
                    "total_revenue": metrics.get("total_revenue", 0),
                    "profit_loss": metrics.get("profit_loss", 0),
                },
                "columns": metrics.get("schema", []),
                "preview": preview,
                "analytics": metrics,
            }

        if not messages:
            return JSONResponse(content={"error": "Missing question or messages"}, status_code=400)

        dict_messages = [{"role": msg.role, "content": msg.content} for msg in messages]
        reply = generate_insights(dict_messages, context)
        return {"reply": reply}
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)
