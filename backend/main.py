from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import os
from dotenv import load_dotenv

from auth import (
    hash_password, verify_password, create_access_token, get_current_user
)
from database import users_collection, scans_collection, reports_collection
from models import UserCreate, UserLogin, URLInput, EmailInput, PhishingReport, BreachRequest
from ml.url_model import predict_url
from ml.email_model import predict_email

load_dotenv()

app = FastAPI(
    title="PhishGuard AI API",
    description="AI-Powered Phishing Detection Platform",
    version="1.0.0"
)

# CORS
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def serialize_doc(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc


# ─── Auth Routes ──────────────────────────────────────────────────────────────

@app.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    existing = await users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    existing_username = await users_collection.find_one({"username": user.username})
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")

    user_doc = {
        "username": user.username,
        "email": user.email,
        "password": hash_password(user.password),
        "created_at": datetime.utcnow(),
    }
    result = await users_collection.insert_one(user_doc)
    token = create_access_token({"sub": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(result.inserted_id),
            "username": user.username,
            "email": user.email
        }
    }


@app.post("/login")
async def login(credentials: UserLogin):
    user = await users_collection.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    token = create_access_token({"sub": user["email"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "username": user["username"],
            "email": user["email"]
        }
    }


@app.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": str(current_user["_id"]),
        "username": current_user["username"],
        "email": current_user["email"],
        "created_at": current_user.get("created_at", "")
    }


# ─── Detection Routes ─────────────────────────────────────────────────────────

@app.post("/predict-url")
async def predict_url_endpoint(
    data: URLInput,
    current_user: dict = Depends(get_current_user)
):
    result = predict_url(data.url)

    scan_doc = {
        "user_id": str(current_user["_id"]),
        "scan_type": "url",
        "input_data": data.url,
        "prediction": result["prediction"],
        "confidence": result["confidence"],
        "risk_level": result["risk_level"],
        "reasons": result["reasons"],
        "timestamp": datetime.utcnow(),
    }
    await scans_collection.insert_one(scan_doc)

    return result


@app.post("/predict-email")
async def predict_email_endpoint(
    data: EmailInput,
    current_user: dict = Depends(get_current_user)
):
    result = predict_email(data.subject or "", data.body)

    scan_doc = {
        "user_id": str(current_user["_id"]),
        "scan_type": "email",
        "input_data": f"[Subject: {data.subject}] {data.body[:200]}",
        "prediction": result["prediction"],
        "confidence": result["confidence"],
        "risk_level": result["risk_level"],
        "reasons": result["reasons"],
        "timestamp": datetime.utcnow(),
    }
    await scans_collection.insert_one(scan_doc)

    return result


# ─── History & Stats ──────────────────────────────────────────────────────────

@app.get("/history")
async def get_history(
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    cursor = scans_collection.find(
        {"user_id": str(current_user["_id"])}
    ).sort("timestamp", -1).limit(limit)

    scans = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        scans.append(doc)
    return {"scans": scans, "total": len(scans)}


@app.get("/stats")
async def get_stats(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])

    total = await scans_collection.count_documents({"user_id": user_id})
    phishing = await scans_collection.count_documents({"user_id": user_id, "prediction": "Phishing"})
    safe = await scans_collection.count_documents({"user_id": user_id, "prediction": "Safe"})
    url_scans = await scans_collection.count_documents({"user_id": user_id, "scan_type": "url"})
    email_scans = await scans_collection.count_documents({"user_id": user_id, "scan_type": "email"})

    # Trend data: last 7 days
    from datetime import timedelta
    trend = []
    for i in range(6, -1, -1):
        day = datetime.utcnow() - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        count = await scans_collection.count_documents({
            "user_id": user_id,
            "timestamp": {"$gte": day_start, "$lt": day_end}
        })
        trend.append({"date": day_start.strftime("%m/%d"), "scans": count})

    return {
        "total_scans": total,
        "phishing_detected": phishing,
        "safe_detected": safe,
        "url_scans": url_scans,
        "email_scans": email_scans,
        "trend": trend,
        "detection_rate": round(phishing / total * 100, 1) if total > 0 else 0
    }


@app.get("/")
async def root():
    return {"message": "PhishGuard AI API is running", "version": "1.0.0"}


# ─── New Features (Phase 2) ───────────────────────────────────────────────────

@app.post("/report-phishing", status_code=status.HTTP_201_CREATED)
async def report_phishing(
    report: PhishingReport,
    current_user: dict = Depends(get_current_user)
):
    """Allow users to report a suspicious URL."""
    doc = {
        "user_id": str(current_user["_id"]),
        "url": report.url,
        "description": report.description,
        "timestamp": datetime.utcnow()
    }
    await reports_collection.insert_one(doc)
    return {"message": "Report submitted successfully. Thank you for making the internet safer!"}


@app.post("/check-breach")
async def check_breach(data: BreachRequest):
    """Check if email appeared in data breaches (Integration with HaveIBeenPwned)."""
    email = data.email
    api_key = os.getenv("HIBP_API_KEY")

    if api_key:
        # Real API check
        import httpx
        url = f"https://haveibeenpwned.com/api/v3/breachedaccount/{email}"
        headers = {
            "hibp-api-key": api_key,
            "user-agent": "PhishGuard-AI"
        }
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 200:
                return {"breached": True, "breaches": resp.json()}
            elif resp.status_code == 404:
                return {"breached": False, "breaches": []}
            else:
                # Fallback on error
                pass

    # Mock Mode (Demo)
    if email.lower() == "test@example.com":
        return {
            "breached": True,
            "breaches": [
                {
                    "Name": "LinkedIn",
                    "Domain": "linkedin.com",
                    "BreachDate": "2012-05-05",
                    "Description": "In May 2016, 164 million email addresses and passwords were exposed."
                },
                {
                    "Name": "Adobe",
                    "Domain": "adobe.com",
                    "BreachDate": "2013-10-04",
                    "Description": "Adobe Systems was hacked, exposing 153 million user records."
                }
            ]
        }
    
    return {"breached": False, "breaches": []}
