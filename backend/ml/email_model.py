import os
import pickle
import re
from typing import List

import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models_pkl", "email_model.pkl")
VECTORIZER_PATH = os.path.join(os.path.dirname(__file__), "..", "models_pkl", "email_vectorizer.pkl")

PHISHING_KEYWORDS = [
    "verify", "account", "suspended", "update", "confirm", "click here",
    "urgent", "immediately", "login", "password", "credential", "bank",
    "social security", "credit card", "debit card", "winner", "prize",
    "claim", "limited time", "expire", "act now", "free", "congratulations",
    "selected", "lucky", "reward", "gift", "transfer", "millions",
    "inheritance", "lottery", "investment", "offer", "discount", "unsubscribe",
    "dear customer", "dear user", "valued member", "attention required",
    "unusual activity", "security alert", "phishing", "malware",
]


def preprocess_email(subject: str, body: str) -> str:
    text = f"{subject} {body}".lower()
    text = re.sub(r'<[^>]+>', ' ', text)       # strip HTML
    text = re.sub(r'http\S+', ' urltoken ', text)  # replace URLs
    text = re.sub(r'\S+@\S+', ' emailtoken ', text)  # replace emails
    text = re.sub(r'\d+', ' numtoken ', text)   # replace numbers
    text = re.sub(r'[^\w\s]', ' ', text)        # remove punctuation
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def get_email_reasons(subject: str, body: str, prediction: str, top_features: List[str]) -> List[str]:
    reasons = []
    combined = (subject + " " + body).lower()

    found_kw = [kw for kw in PHISHING_KEYWORDS if kw in combined]
    if found_kw:
        reasons.append(f"🚨 High-risk phishing keywords found: {', '.join(found_kw[:5])}")

    url_count = len(re.findall(r'http\S+', combined))
    if url_count > 3:
        reasons.append(f"🔗 Contains {url_count} URLs — excessive links is a phishing signal")
    elif url_count > 0:
        reasons.append(f"🔗 Email contains {url_count} URL(s) — review before clicking")

    if re.search(r'<[^>]+>', body):
        reasons.append("📧 Email contains HTML content — may be used to disguise malicious links")

    urgent_words = ["urgent", "immediately", "expire", "act now", "limited", "asap"]
    found_urgent = [w for w in urgent_words if w in combined]
    if found_urgent:
        reasons.append(f"⏰ Urgency language detected: {', '.join(found_urgent)} — pressure tactic")

    if any(phrase in combined for phrase in ["dear customer", "dear user", "valued member"]):
        reasons.append("📩 Generic greeting used — legitimate companies use your real name")

    if top_features:
        reasons.append(f"🔍 Key suspicious terms identified by AI: {', '.join(top_features[:6])}")

    if not reasons and prediction == "Safe":
        reasons.append("✅ No suspicious keywords or phishing patterns detected")
        reasons.append("✅ Email structure appears legitimate")
        reasons.append("✅ No excessive urgency or credential-requesting language found")

    return reasons


def predict_email(subject: str, body: str) -> dict:
    processed = preprocess_email(subject, body)
    top_features = []

    try:
        with open(VECTORIZER_PATH, "rb") as f:
            vectorizer = pickle.load(f)
        with open(MODEL_PATH, "rb") as f:
            model = pickle.load(f)

        X = vectorizer.transform([processed])
        pred = model.predict(X)[0]
        proba = model.predict_proba(X)[0]
        confidence = round(float(max(proba)) * 100, 2)
        prediction = "Phishing" if pred == 1 else "Safe"

        # Extract top TF-IDF features for explainability
        feature_names = vectorizer.get_feature_names_out()
        tfidf_scores = X.toarray()[0]
        top_idx = np.argsort(tfidf_scores)[-8:][::-1]
        top_features = [feature_names[i] for i in top_idx if tfidf_scores[i] > 0]

    except FileNotFoundError:
        prediction, confidence = _heuristic_email(subject, body)

    if prediction == "Phishing":
        risk_level = "High" if confidence >= 75 else "Medium"
    else:
        risk_level = "Low" if confidence >= 70 else "Medium"

    reasons = get_email_reasons(subject, body, prediction, top_features)

    return {
        "prediction": prediction,
        "confidence": confidence,
        "risk_level": risk_level,
        "reasons": reasons
    }


def _heuristic_email(subject: str, body: str):
    combined = (subject + " " + body).lower()
    score = 0
    for kw in PHISHING_KEYWORDS:
        if kw in combined:
            score += 6
    url_count = len(re.findall(r'http\S+', combined))
    if url_count > 3:
        score += 20
    urgent_words = ["urgent", "immediately", "expire", "act now", "asap"]
    score += sum(8 for w in urgent_words if w in combined)
    if any(p in combined for p in ["dear customer", "dear user"]):
        score += 15

    if score >= 35:
        return "Phishing", min(50 + score * 0.7, 97.0)
    else:
        return "Safe", max(90 - score, 55.0)
