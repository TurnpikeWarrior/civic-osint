from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import init_db
from .routers import chat, intelligence, notebook
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="COSINT API")

# Initialize database tables on startup
@app.on_event("startup")
def startup_event():
    init_db()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Conversation-Id"],
)

# Include Routers
app.include_router(chat.router)
app.include_router(intelligence.router)
app.include_router(notebook.router)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/system/model")
async def get_model_info():
    from .services.cosint.agent import COSINT_AGENT_MODEL
    return {"model": COSINT_AGENT_MODEL}

@app.post("/system/clear-cache")
async def clear_cache():
    from .services.cache_service import cache
    cache.clear()
    return {"status": "cache cleared"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
