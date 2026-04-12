from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, Dict, Any, List

class UploadBase(BaseModel):
    file_name: str
    file_type: str
    status: str = "pending"

class UploadCreate(UploadBase):
    pass

class UploadResponse(UploadBase):
    id: int
    user_id: Optional[int]
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class RecordCreate(BaseModel):
    data: Dict[str, Any]

class RecordResponse(RecordCreate):
    id: int
    upload_id: Optional[int]
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class PaginatedRecords(BaseModel):
    total: int
    records: List[RecordResponse]

class MetricResponse(BaseModel):
    id: int
    upload_id: int
    total_revenue: float
    total_trips: int
    profit_loss: float
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# User Schemas
class UserLogin(BaseModel):
    email: str
    password: str


class UserSignup(BaseModel):
    name: str
    email: str
    password: str
    role: str = "admin"


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str


class AuthResponse(BaseModel):
    token: str
    user: UserResponse

class ChatPayload(BaseModel):
    question: Optional[str] = None
    messages: Optional[List[Dict[str, Any]]] = None
    context: Optional[Dict[str, Any]] = None
    upload_id: Optional[int] = None
