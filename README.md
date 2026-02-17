# COSINT - Civic Open Source Intelligence Tool

COSINT (Civic Open Source Intelligence) is an AI-powered research tool for U.S. Congress. It gives everyday citizens the ability to look up their representatives track legislation, and undersatnd what's happening in Congress - all through a conversational chat interface. 

## What COSINT can do? 
- Find your representatives
- Research any member of Congress
- Read bills in Plain English 
- Track legislation 
- AI-powered chat
- Research notebook 

**API Data Sources**: Congress, Google Civic Information, Brave Search 

There are:  
U.S. Congress Total: 535  
U.S. Senate: 100  
U.S. House of Representatives: 535  
Federal Legislation Bills Introduced (2025): 11,800 - 12,400  
Federal Legislation Bills Enacted (2025): 274 - 308  
State Legislations Introduced (2025): 135,500+  

Do you know any of them? Stay Informed with COSINT! 

## Technical Stuff

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
