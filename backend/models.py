from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class URLInput(BaseModel):
    url: str = Field(..., min_length=1, max_length=2000)


class EmailInput(BaseModel):
    subject: Optional[str] = ""
    body: str = Field(..., min_length=1, max_length=50000)


class ScanResult(BaseModel):
    prediction: str          # "Phishing" | "Safe"
    confidence: float        # 0-100
    risk_level: str          # "Low" | "Medium" | "High"
    reasons: List[str]
    scan_type: str           # "url" | "email"
    input_data: str
    timestamp: datetime


class ScanHistoryItem(BaseModel):
    id: str
    scan_type: str
    input_data: str
    prediction: str
    confidence: float
    risk_level: str
    timestamp: datetime


class PhishingReport(BaseModel):
    url: str = Field(..., min_length=1)
    description: Optional[str] = None


class BreachRequest(BaseModel):
    email: EmailStr
