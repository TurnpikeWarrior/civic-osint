from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Tuple
from fastapi.middleware.cors import CORSMiddleware
from .services.cosint.agent import get_cosint_agent

app = FastAPI(title="COSINT API")

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[Tuple[str, str]] = []

class ChatResponse(BaseModel):
    response: str
    history: List[Tuple[str, str]]

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        agent_executor = get_cosint_agent()
        
        # Invoke the agent with chat history
        result = agent_executor.invoke({
            "input": request.message,
            "chat_history": request.history
        })
        
        # Update history
        updated_history = request.history + [
            ("human", request.message),
            ("assistant", result["output"])
        ]
        
        # Keep history manageable
        if len(updated_history) > 20:
            updated_history = updated_history[-20:]
            
        return ChatResponse(
            response=result["output"],
            history=updated_history
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
