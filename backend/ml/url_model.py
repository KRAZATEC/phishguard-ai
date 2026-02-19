import re
import os
import pickle
import numpy as np
from urllib.parse import urlparse
from typing import List, Tuple

# Load model on import
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models_pkl", "url_model.pkl")

SUSPICIOUS_KEYWORDS = [
    "login", "verify", "secure", "account", "update", "banking", "confirm",
    "password", "credential", "paypal", "ebay", "amazon", "apple", "microsoft",
    "support", "helpdesk", "alert", "suspended", "unlock", "validate", "click",
    "free", "bonus", "winner", "prize", "offer", "limited", "urgent", "immediate"
]

SUSPICIOUS_TLDS = [".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".club", ".work"]


def extract_url_features(url: str) -> np.ndarray:
    """Extract numerical features from a URL for ML prediction."""
    features = []

    # 1. URL length
    features.append(len(url))

    # 2. Number of dots
    features.append(url.count("."))

    # 3. Number of hyphens
    features.append(url.count("-"))

    # 4. Number of underscores
    features.append(url.count("_"))

    # 5. Number of slashes
    features.append(url.count("/"))

    # 6. Number of @ symbols
    features.append(url.count("@"))

    # 7. Number of ? (query params)
    features.append(url.count("?"))

    # 8. Number of = signs
    features.append(url.count("="))

    # 9. Number of & ampersands
    features.append(url.count("&"))

    # 10. Number of digits
    features.append(sum(c.isdigit() for c in url))

    # 11. HTTPS presence
    features.append(1 if url.startswith("https://") else 0)

    # 12. IP address in URL
    ip_pattern = re.compile(r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b')
    features.append(1 if ip_pattern.search(url) else 0)

    # 13. Suspicious keyword count
    url_lower = url.lower()
    suspicious_count = sum(1 for kw in SUSPICIOUS_KEYWORDS if kw in url_lower)
    features.append(suspicious_count)

    # 14. Domain length
    try:
        parsed = urlparse(url if url.startswith("http") else "http://" + url)
        domain = parsed.netloc
        features.append(len(domain))
    except Exception:
        features.append(0)

    # 15. Subdomain count (dots in domain)
    try:
        features.append(len(domain.split(".")) - 2)
    except Exception:
        features.append(0)

    # 16. Suspicious TLD
    features.append(1 if any(url_lower.endswith(tld) or tld + "/" in url_lower for tld in SUSPICIOUS_TLDS) else 0)

    # 17. Path length
    try:
        features.append(len(parsed.path))
    except Exception:
        features.append(0)

    # 18. Number of special characters total
    special_chars = sum(1 for c in url if c in "!#$%^*(){}[]|\\<>,;:'\"~`")
    features.append(special_chars)

    return np.array(features).reshape(1, -1)


def get_url_reasons(url: str, prediction: str, confidence: float) -> List[str]:
    """Generate human-readable explanation for the prediction."""
    reasons = []
    url_lower = url.lower()

    if not url.startswith("https://"):
        reasons.append("⚠️ URL does not use HTTPS — connection may be insecure")

    ip_pattern = re.compile(r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b')
    if ip_pattern.search(url):
        reasons.append("🚨 URL contains a raw IP address instead of a domain name")

    if len(url) > 75:
        reasons.append(f"📏 Unusually long URL ({len(url)} characters) — common in phishing")

    found_kw = [kw for kw in SUSPICIOUS_KEYWORDS if kw in url_lower]
    if found_kw:
        reasons.append(f"🔑 Suspicious keywords detected: {', '.join(found_kw[:5])}")

    if url.count("-") > 3:
        reasons.append(f"➖ Excessive hyphens ({url.count('-')}) — often used to mimic legitimate domains")

    if url.count(".") > 4:
        reasons.append(f"🔵 Multiple subdomains detected ({url.count('.')} dots) — common in spoofing")

    if url.count("@") > 0:
        reasons.append("⚡ '@' symbol in URL — can redirect to a completely different host")

    if any(url_lower.endswith(tld) or tld + "/" in url_lower for tld in SUSPICIOUS_TLDS):
        reasons.append("🌐 Suspicious top-level domain (e.g. .tk, .ml, .xyz) — often used for spam")

    if url.count("?") > 0 and url.count("=") > 2:
        reasons.append("🔗 Complex query string with multiple parameters — common in redirect attacks")

    if not reasons and prediction == "Safe":
        reasons.append("✅ URL structure appears legitimate")
        reasons.append("✅ Uses HTTPS encryption")
        reasons.append("✅ No suspicious keywords or patterns detected")

    return reasons


def predict_url(url: str) -> dict:
    try:
        with open(MODEL_PATH, "rb") as f:
            model = pickle.load(f)
        features = extract_url_features(url)
        pred = model.predict(features)[0]
        proba = model.predict_proba(features)[0]
        confidence = round(float(max(proba)) * 100, 2)
        prediction = "Phishing" if pred == 1 else "Safe"
    except FileNotFoundError:
        # Fallback heuristic if model not found
        prediction, confidence = _heuristic_url(url)

    if confidence >= 80:
        risk_level = "High" if prediction == "Phishing" else "Low"
    elif confidence >= 60:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    reasons = get_url_reasons(url, prediction, confidence)

    return {
        "prediction": prediction,
        "confidence": confidence,
        "risk_level": risk_level,
        "reasons": reasons
    }


def _heuristic_url(url: str) -> Tuple[str, float]:
    """Fallback rule-based detection when model file is not available."""
    score = 0
    url_lower = url.lower()

    if not url.startswith("https://"):
        score += 20
    ip_pattern = re.compile(r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b')
    if ip_pattern.search(url):
        score += 35
    kw_hits = sum(1 for kw in SUSPICIOUS_KEYWORDS if kw in url_lower)
    score += kw_hits * 8
    if url.count("@") > 0:
        score += 25
    if any(url_lower.endswith(tld) or tld + "/" in url_lower for tld in SUSPICIOUS_TLDS):
        score += 20
    if len(url) > 75:
        score += 10

    if score >= 40:
        return "Phishing", min(50 + score, 98.0)
    else:
        return "Safe", max(95 - score, 55.0)
