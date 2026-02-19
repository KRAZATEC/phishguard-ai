# PhishGuard AI 🛡️

**AI-Powered Phishing Detection Platform** — Full-stack SaaS application for detecting phishing URLs and emails using Machine Learning.

![Tech Stack](https://img.shields.io/badge/FastAPI-0.110-green) ![React](https://img.shields.io/badge/React-18-blue) ![scikit--learn](https://img.shields.io/badge/scikit--learn-1.4-orange) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)

---

## 🚀 Features

- **URL Phishing Detection** — Random Forest classifier with 18+ URL features
- **Email Phishing Detection** — TF-IDF + Random Forest NLP model
- **Explainable AI** — Human-readable reasons for every detection
- **Confidence Scores** — `predict_proba` based scoring (0-100%)
- **Risk Levels** — Low / Medium / High classification
- **JWT Authentication** — Secure login/register with bcrypt hashing
- **Dashboard** — Charts, stats, scan history
- **Dark Mode UI** — Glassmorphism + gradient SaaS design

---

## 📁 Project Structure

```
phishguard-ai/
├── backend/
│   ├── main.py              # FastAPI app + all routes
│   ├── auth.py              # JWT + bcrypt authentication
│   ├── database.py          # MongoDB Motor connection
│   ├── models.py            # Pydantic schemas
│   ├── ml/
│   │   ├── url_model.py     # URL feature extraction + prediction
│   │   ├── email_model.py   # Email TF-IDF + prediction
│   │   ├── train_url.py     # URL model training
│   │   └── train_email.py   # Email model training
│   ├── models_pkl/          # Saved .pkl model files (auto-generated)
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── pages/           # Landing, Login, Register, Dashboard, UrlDetect, EmailDetect
│   │   ├── components/      # Sidebar
│   │   ├── context/         # AuthContext (JWT + localStorage)
│   │   └── services/        # api.js (Axios)
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── .env.example
│
└── README.md
```

---

## ⚙️ Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

---

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env with your MongoDB URL and secret key

# Train ML models (generates models_pkl/*.pkl files)
python ml/train_url.py
python ml/train_email.py

# Start the server
uvicorn main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

---

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
copy .env.example .env
# Edit VITE_API_URL=http://localhost:8000

# Start dev server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🌐 Deployment

### Frontend → Vercel

1. Push `frontend/` to a GitHub repository
2. Import the repo in [Vercel](https://vercel.com/)
3. Set build settings:
   - **Framework**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Set environment variable:
   - `VITE_API_URL` = `https://your-backend.onrender.com`
5. Deploy!

---

### Backend → Render

1. Push `backend/` to a GitHub repository
2. Create a new **Web Service** on [Render](https://render.com/)
3. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt && python ml/train_url.py && python ml/train_email.py`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Set environment variables:
   - `MONGODB_URL` = your MongoDB Atlas connection string
   - `SECRET_KEY` = a long random secret
   - `ALLOWED_ORIGINS` = `https://your-app.vercel.app`
5. Deploy!

---

### Database → MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster
3. Create a database user
4. Get the connection string:
   `mongodb+srv://<user>:<password>@cluster0.mongodb.net/phishguard`
5. Add to your `.env` file as `MONGODB_URL`
6. Whitelist your IP (or use `0.0.0.0/0` for Render)

---

## 🔌 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | No | Create account |
| POST | `/login` | No | Login + get JWT |
| GET | `/me` | Yes | Current user info |
| POST | `/predict-url` | Yes | Analyze a URL |
| POST | `/predict-email` | Yes | Analyze email content |
| GET | `/history` | Yes | Scan history |
| GET | `/stats` | Yes | Dashboard statistics |

---

## 🤖 ML Model Details

### URL Detection (Random Forest)
**Features extracted:**
- URL length, dot count, hyphen count
- HTTPS presence, IP address detection
- Suspicious keyword count (30+ keywords)
- Subdomain depth, TLD, path length
- Special character count

### Email Detection (TF-IDF + Random Forest)
- Preprocesses email (strips HTML, normalizes URLs/emails/numbers)
- TF-IDF vectorizer with 5,000 features, bigrams
- Random Forest with 200 trees, balanced class weights
- Top TF-IDF terms used for explainability

---

## 🔒 Security

- Passwords hashed with **bcrypt**
- JWT tokens with configurable expiry (default: 24h)
- **CORS** restricted to specified origins in production
- MongoDB connection via secure Atlas string
- All sensitive config in environment variables

---

## 📸 Pages

- `/` — Landing page with hero + features
- `/login` — Sign in
- `/register` — Create account
- `/dashboard` — Stats + charts + history
- `/detect/url` — URL scanner
- `/detect/email` — Email scanner
