# PhishGuard AI 🛡️

**AI-Powered Phishing Detection Platform** — A full-stack security application using Machine Learning to detect phishing URLs and malicious emails in real-time.

![Tech Stack](https://img.shields.io/badge/FastAPI-0.110-green) ![React](https://img.shields.io/badge/React-18-blue) ![Docker](https://img.shields.io/badge/Docker-20.10-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen) ![scikit--learn](https://img.shields.io/badge/scikit--learn-1.4-orange)

---

## 🏗️ System Architecture

```mermaid
graph TD
    User[👤 User] -->|HTTPS| Frontend[💻 Frontend (React + Nginx)]
    Frontend -->|REST API| Backend[🧠 Backend (FastAPI)]
    
    subgraph "Backend Services"
        Backend -->|Auth| Auth[🔐 JWT Authentication]
        Backend -->|Store| DB[(🍃 MongoDB Atlas)]
        Backend -->|Predict| ML[🤖 ML Models]
        Backend -->|Check| HIBP[🔍 HaveIBeenPwned API]
    end
    
    ML -->|Load| PKL[📦 Pickle Models (URL/Email)]
```

---

## 🚀 Features

### 🔍 Phishing Detection
- **URL Scanning**: Analyzes URLs using a Random Forest classifier (18+ features extracted).
- **Email Analysis**: Uses NLP (TF-IDF) to detect malicious patterns in email subject and body.
- **Explainable AI**: Provides human-readable reasons for every "Phishing" or "Safe" verdict.

### 🛡️ Security & Privacy
- **Data Breach Scanner**: Integrates with *Have I Been Pwned* to check if your email has been compromised.
- **Community Reporting**: Users can report suspicious URLs to help improve the system.
- **Secure Auth**: JWT-based session management with Bcrypt password hashing.

### 📊 Dashboard
- **Interactive Charts**: Visual breakdown of scan history and threats detected.
- **Scan History**: Detailed log of all user activity.
- **Dark Mode**: Sleek, modern glassmorphism UI.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
|-----------|------------|-------------|
| **Frontend** | React + Vite | Fast, modern UI with TailwindCSS for styling. |
| **Backend** | FastAPI | High-performance Python API framework. |
| **Database** | MongoDB Motor | Async database driver for MongoDB Atlas. |
| **ML Engine** | Scikit-Learn | Random Forest & TF-IDF models for classification. |
| **DevOps** | Docker | Containerized deployment for consistency. |
| **Hosting** | Railway | PaaS provider for hosting Docker containers. |

---

## ⚙️ Installation (Local)

### Option A: Docker (Recommended) 🐳
The easiest way to run PhishGuard AI is using Docker Compose.

1.  **Clone the repository**
    ```bash
    git clone https://github.com/YOUR_USERNAME/phishguard-ai.git
    cd phishguard-ai
    ```

2.  **Configure Environment**
    Create a `.env` file in `backend/`:
    ```ini
    MONGODB_URL=your_mongodb_connection_string
    SECRET_KEY=your_secret_key
    ALLOWED_ORIGINS=*
    ```

3.  **Run with Docker Compose**
    ```bash
    docker-compose up --build
    ```

4.  **Access the App**
    - Frontend: `http://localhost:3000`
    - Backend: `http://localhost:8000`

---

### Option B: Manual Setup

#### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Activate venv (Windows: venv\Scripts\activate, Mac/Linux: source venv/bin/activate)
pip install -r requirements.txt
python ml/train_url.py    # Train models
python ml/train_email.py
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Deployment (Railway)

This project is configured for seamless deployment on **Railway** using Docker.

1.  **Fork/Clone** this repo to your GitHub.
2.  **Login to Railway** and create a new project from your GitHub repo.
3.  **Deploy Backend**:
    - Root Directory: `/backend`
    - Variables: `MONGODB_URL`, `SECRET_KEY`, `ALLOWED_ORIGINS`
4.  **Deploy Frontend**:
    - Root Directory: `/frontend`
    - Variables: `VITE_API_URL` (Set this to your Railway Backend URL, e.g., `https://web-production.up.railway.app`)
    - *Note: The frontend Dockerfile builds the React app, so `VITE_API_URL` is needed at build time.*

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login and get JWT token |
| `POST` | `/predict-url` | Scan a URL for phishing |
| `POST` | `/predict-email` | Scan email content |
| `POST` | `/check-breach` | Check if email is in a breach |
| `GET` | `/stats` | Get user dashboard statistics |

---

## 📸 Screenshots

| Landing Page | Dashboard |
|--------------|-----------|
| ![Landing](https://placehold.co/600x400?text=Landing+Page+Screenshot) | ![Dashboard](https://placehold.co/600x400?text=Dashboard+Screenshot) |

| URL Detection | Email Scanner |
|---------------|---------------|
| ![URL Scan](https://placehold.co/600x400?text=URL+Detection+Screenshot) | ![Email Scan](https://placehold.co/600x400?text=Email+Scanner+Screenshot) |

---

Made with ❤️ by [Your Name]
