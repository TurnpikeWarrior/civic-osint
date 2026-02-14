# COSINT - Civic Open Source Intelligence Tool

COSINT is an AI-powered platform for tracking and researching US Congress representatives.

## Project Structure

- `backend/`: FastAPI server with LangChain agent and Congress API integration.
- `frontend/`: Next.js web application with a modern chat interface.

## Quick Start

### 1. Setup Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Ensure your .env file is set up with CONGRESS_API_KEY and OPENAI_API_KEY
python3 -m uvicorn app.main:app --reload
```

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:3000`.
