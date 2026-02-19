"""
URL Phishing Detection Model Training Script
Trains a Random Forest classifier on URL features and saves it as a .pkl file.
"""

import os
import pickle
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

# Import feature extractor from our model module
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from ml.url_model import extract_url_features

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "..", "models_pkl", "url_model.pkl")
os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

# ─── Synthetic Training Dataset ───────────────────────────────────────────────
PHISHING_URLS = [
    "http://paypal-secure-login.tk/verify/account?id=12345",
    "http://192.168.1.1/login/banking/confirm",
    "http://amazon-account-verify.ml/update-password",
    "http://secure-ebay-login.xyz/signin?redirect=true",
    "http://microsoft-support-alert.cf/claim-prize",
    "http://apple-id.suspended-unlock.ga/verify",
    "http://bankofamerica-secure.xyz/login/confirm",
    "http://login-paypal.com.phishing-site.tk/verify",
    "http://update-your-credentials-now.ml/account",
    "http://192.0.2.99/banking/login?session=abc123",
    "http://free-gift-winner.club/claim?user=victim",
    "http://secure-login-amazon.work/password/reset",
    "http://ebay-account-suspended.tk/activate",
    "http://google-security-alert.xyz/verify-now",
    "http://facebook-login-confirm.ml/account/update",
    "http://netflix-billing-update.ga/payment/confirm",
    "http://chase-bank-secure.cf/online/login",
    "http://irs-tax-refund-alert.xyz/claim-refund",
    "http://instagram-account-verify.tk/login?token=xyz",
    "http://twitter-suspended-account.ml/restore",
    "http://dropbox-secure-share.xyz/file?id=victim123",
    "http://linkedin-account-alert.tk/verify-email",
    "http://wellsfargo-secure.ml/banking/login",
    "http://citibank-login-verify.xyz/account/update",
    "http://usbank-secure-login.ga/credentials/confirm",
    "http://capitalone-account.tk/login?update=true",
    "http://steam-account-hack-alert.xyz/verify",
    "http://epic-games-free-vbucks.ml/claim",
    "http://crypto-investment-profit.xyz/login",
    "http://covid-relief-fund-gov.tk/apply?id=1234",
    "http://ssa-gov-benefit-alert.ml/claim",
    "http://fedex-parcel-confirm.xyz/delivery?id=usr",
    "http://dhl-package-verify.ga/track?user=victim",
    "http://usps-delivery-alert.tk/confirm-address",
    "http://docusign-secure-sign.ml/document?id=abc",
    "http://login.secure-account.xyz/password?reset=1",
    "http://account-verify.secure-login.tk/update",
    "http://confirm-identity.banking.ml/verify",
    "http://123.45.67.89/phishing/login.php",
    "http://10.0.0.1/banking/login",
]

SAFE_URLS = [
    "https://www.google.com/search?q=phishing+detection",
    "https://github.com/openai/openai-python",
    "https://stackoverflow.com/questions/tagged/python",
    "https://www.wikipedia.org/wiki/Machine_learning",
    "https://docs.python.org/3/library/os.html",
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://www.amazon.com/dp/B09G3HRMVB",
    "https://www.linkedin.com/in/username",
    "https://twitter.com/home",
    "https://www.reddit.com/r/MachineLearning",
    "https://medium.com/towards-data-science",
    "https://www.bbc.com/news/technology",
    "https://techcrunch.com/2024/01/15/ai-trends",
    "https://www.nytimes.com/section/technology",
    "https://www.apple.com/iphone",
    "https://www.microsoft.com/en-us/windows",
    "https://www.netflix.com/browse",
    "https://www.spotify.com/us/premium",
    "https://www.airbnb.com/rooms/12345",
    "https://www.booking.com/hotel",
    "https://www.coursera.org/learn/machine-learning",
    "https://www.udemy.com/course/python-bootcamp",
    "https://www.kaggle.com/competitions",
    "https://huggingface.co/models",
    "https://pytorch.org/tutorials/beginner",
    "https://www.tensorflow.org/tutorials",
    "https://scikit-learn.org/stable/user_guide.html",
    "https://fastapi.tiangolo.com/tutorial",
    "https://reactjs.org/docs/getting-started.html",
    "https://tailwindcss.com/docs/installation",
    "https://www.mongodb.com/docs/manual",
    "https://firebase.google.com/docs",
    "https://vercel.com/docs",
    "https://render.com/docs/web-services",
    "https://www.cloudflare.com/learning",
    "https://developer.mozilla.org/en-US/docs/Web",
    "https://www.w3schools.com/python",
    "https://realpython.com/python-f-strings",
    "https://www.python.org/downloads",
    "https://pip.pypa.io/en/stable/installation",
]


def main():
    print("🚀 Training URL Phishing Detection Model...")
    
    all_urls = PHISHING_URLS + SAFE_URLS
    labels = [1] * len(PHISHING_URLS) + [0] * len(SAFE_URLS)
    
    X = np.vstack([extract_url_features(url) for url in all_urls])
    y = np.array(labels)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=15,
        min_samples_split=2,
        random_state=42,
        class_weight="balanced"
    )
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    print(f"\n✅ Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print("\n📊 Classification Report:")
    print(classification_report(y_test, y_pred, target_names=["Safe", "Phishing"]))
    
    with open(OUTPUT_PATH, "wb") as f:
        pickle.dump(model, f)
    
    print(f"\n💾 Model saved to: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
