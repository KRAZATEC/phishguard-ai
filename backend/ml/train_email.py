"""
Email Phishing Detection Model Training Script
Trains a TF-IDF + Random Forest classifier on email text and saves .pkl files.
"""

import os
import pickle
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models_pkl", "email_model.pkl")
VECTORIZER_PATH = os.path.join(os.path.dirname(__file__), "..", "models_pkl", "email_vectorizer.pkl")
os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)

# ─── Synthetic Training Dataset ───────────────────────────────────────────────
PHISHING_EMAILS = [
    ("Urgent: Account Suspended", "Dear customer, your account has been suspended. Click here immediately to verify your credentials and restore access before it expires. Do not ignore this alert."),
    ("Your PayPal account needs verification", "We detected unusual activity on your PayPal account. Please confirm your password and credit card details at the link below to restore access."),
    ("Congratulations! You've won a prize", "Dear valued member, you have been selected as the lucky winner of our monthly prize draw. Claim your gift of $5000 now before the offer expires."),
    ("Important: Update your banking details", "Your bank account information needs to be updated immediately. Failure to confirm within 24 hours will result in account suspension."),
    ("Security Alert: Unauthorized login attempt", "We detected a login from an unknown device. Verify your identity now by providing your credentials at the link below. Act now."),
    ("IRS Tax Refund Notification", "You are eligible for a tax refund of $3,241. To process your refund, please provide your social security number and bank account information."),
    ("Your Apple ID has been locked", "Dear user, your Apple ID was locked due to security reasons. Confirm your payment information and password to unlock your account immediately."),
    ("Free iPhone 15 - Limited Time Offer", "Congratulations! You have been selected to receive a free iPhone 15. Click immediately to claim your prize before it expires. Act now!"),
    ("Microsoft: Your account will be deleted", "Dear Microsoft user, your account is scheduled for deletion due to inactivity. Click the link below and verify your credentials to keep your account active."),
    ("Netflix Payment Failed - Update Now", "Your Netflix subscription payment has failed. Update your credit card information immediately to avoid losing access to your account."),
    ("DHL Parcel Delivery Notification", "Your parcel could not be delivered. Please confirm your home address and pay a $2.99 delivery fee to reschedule. Click here now."),
    ("Lottery Winner Notification", "You have won $1,000,000 in the international lottery. To claim your winnings, provide your bank details and a processing fee of $500."),
    ("COVID-19 Relief Fund Available", "You qualify for a $1,200 COVID relief payment. Enter your bank account and social security number to receive your funds within 24 hours."),
    ("Job Offer - Work from Home $5000/week", "You have been selected for a remote position paying $5000 per week. No experience needed. Click here to apply and provide your details."),
    ("Amazon: Verify Your Account", "Dear customer, we noticed suspicious activity on your Amazon account. Verify your credit card and password to prevent account suspension."),
    ("Inheritance Transfer - $4.5 Million", "I am a lawyer writing on behalf of my deceased client who shares your surname. You are the beneficiary of $4.5 million. Please respond with your bank details."),
    ("Google Account Security Notice", "Someone tried to sign in to your Google Account. If this was not you, click the link below and change your password immediately."),
    ("Chase Bank Account Alert", "Your Chase Online banking access has been restricted. Please confirm your login details and account number at the secure link below."),
    ("Docusign: Action Required", "A document has been shared with you. Click here to review and sign. You must provide your credentials to access the document."),
    ("Bitcoin Investment Opportunity", "Double your Bitcoin in 24 hours! Our AI trading bot guarantees 200% returns. Send 0.1 BTC and receive 0.2 BTC back instantly."),
    ("Your subscription will expire", "Dear valued customer, your premium subscription expires today. Click to renew now and provide your payment details to avoid interruption."),
    ("Office 365 Storage Full", "Dear user, your Office 365 mailbox is 95% full. Click here to increase your storage and verify your Microsoft credentials immediately."),
    ("Dropbox: Shared file waiting", "Someone shared an important document with you on Dropbox. Click the link and enter your credentials to view the file before it expires."),
    ("Steam Account Hack Alert", "Your Steam account was accessed from a new location. Click immediately to secure your account and verify your login credentials."),
    ("Student Loan Forgiveness", "Under the new Biden relief plan, your student loans are eligible for immediate forgiveness. Submit your SSN and bank details to apply today."),
]

SAFE_EMAILS = [
    ("Weekly Python Newsletter", "Hello! Here are this week's top Python tutorials, library updates, and community news. Check out the new FastAPI release and scikit-learn improvements."),
    ("Your order has shipped", "Hi John, your order #12345 from Amazon has shipped and will arrive tomorrow. Track your package using the link in your account dashboard."),
    ("Meeting scheduled for tomorrow", "Hi team, just a reminder that our weekly standup is scheduled for tomorrow at 10am EST. Please add it to your calendar if you haven't already."),
    ("GitHub: New pull request", "A new pull request has been opened in your repository 'phishguard'. Review the changes and merge when ready. No action required if you're not the maintainer."),
    ("Your flight confirmation", "Hi Sarah, your flight from New York to London has been confirmed. Check-in opens 24 hours before departure. Have a great trip!"),
    ("Monthly bank statement", "Your statement for January 2024 is now available. Log in to your account using the app or website to view your transactions."),
    ("Coursera course completion", "Congratulations! You've completed the Machine Learning Specialization by Andrew Ng. Download your certificate from your Coursera dashboard."),
    ("Team lunch tomorrow", "Hey everyone! We're planning a team lunch at the Italian place on Main Street tomorrow at 1pm. Let me know if you can make it!"),
    ("Software update available", "A new version of our development tools is available. Update at your convenience to get the latest features and security patches."),
    ("Conference registration confirmed", "Thank you for registering for PyCon 2024. Your badge will be ready for pickup at the registration desk starting April 10."),
    ("Newsletter: Tech Trends 2024", "This month we cover AI advancements, cloud computing trends, and cybersecurity best practices. Read the full issue at our website."),
    ("Doctor appointment reminder", "This is a reminder that you have an appointment with Dr. Smith tomorrow at 3pm. Please call us if you need to reschedule."),
    ("Code review request", "Hi, I've pushed the latest changes to the authentication module. Could you please review the JWT implementation before we merge to main?"),
    ("Welcome to our platform", "Welcome aboard! Your account has been created successfully. You can now access all features of the platform. Here's your getting started guide."),
    ("Invoice from Vercel", "Your invoice for the Pro plan subscription is ready. Amount due: $20.00 for February 2024. View your invoice in the billing section."),
    ("Package delivered", "Great news! Your package was delivered today at 2:35pm and left at your front door. Thanks for shopping with us."),
    ("Event reminder: Webinar", "Don't forget! Our webinar on Cybersecurity Best Practices starts in 1 hour. Join the Zoom call using the link in your calendar invite."),
    ("Password changed successfully", "You recently changed your password. If you made this change, no further action is needed. If not, contact support immediately."),
    ("Performance review scheduled", "Your annual performance review has been scheduled for March 15 at 2pm with your manager. Please prepare your self-assessment form."),
    ("Learning path recommendation", "Based on your interests in data science, we recommend: Python for Data Analysis, Deep Learning Fundamentals, and MLOps Engineering."),
    ("Staff meeting notes", "Attached are the notes from Tuesday's all-hands meeting. Key decisions: Q2 roadmap approved, hiring for 3 senior engineers, office renovation planned."),
    ("Subscription renewal notice", "Your subscription renews automatically on March 1, 2024. No action needed unless you want to change your plan. Visit settings to manage."),
    ("Welcome to Slack workspace", "You've been added to the Engineering team workspace. Say hello in #general and check the #resources channel for onboarding docs."),
    ("Database backup complete", "Your scheduled database backup completed successfully at 3:00 AM. All 847 records were backed up. Next backup scheduled for tomorrow."),
    ("Project status update", "The Q1 feature development is 80% complete. We're on track for the March 31 release date. Outstanding items: testing, documentation, and deployment."),
]


def main():
    print("🚀 Training Email Phishing Detection Model (TF-IDF + Random Forest)...")

    texts = []
    labels = []

    for subject, body in PHISHING_EMAILS:
        texts.append(f"{subject} {body}")
        labels.append(1)

    for subject, body in SAFE_EMAILS:
        texts.append(f"{subject} {body}")
        labels.append(0)

    vectorizer = TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),
        stop_words="english",
        sublinear_tf=True
    )
    X = vectorizer.fit_transform(texts)

    X_train, X_test, y_train, y_test = train_test_split(
        X, labels, test_size=0.2, random_state=42, stratify=labels
    )

    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=20,
        random_state=42,
        class_weight="balanced"
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    print(f"\n✅ Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print("\n📊 Classification Report:")
    print(classification_report(y_test, y_pred, target_names=["Safe", "Phishing"]))

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    with open(VECTORIZER_PATH, "wb") as f:
        pickle.dump(vectorizer, f)

    print(f"\n💾 Email model saved to:      {MODEL_PATH}")
    print(f"💾 TF-IDF vectorizer saved to: {VECTORIZER_PATH}")


if __name__ == "__main__":
    main()
