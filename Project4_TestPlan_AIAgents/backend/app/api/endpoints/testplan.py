from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.jira_client import JiraClient
from app.services.llm_engine import LLMEngine

router = APIRouter()
jira = JiraClient()

class FetchRequest(BaseModel):
    ticket_key: str
    config: dict = None

class GenerateRequest(BaseModel):
    ticket_data: dict
    template: str = ""
    config: dict = None

@router.post("/fetch")
def fetch_ticket(request: FetchRequest):
    """Synchronous fetch for speed and reliability"""
    if request.config:
        local_jira = JiraClient(
            url=request.config.get("url"),
            email=request.config.get("email"),
            token=request.config.get("token")
        )
        result = local_jira.get_issue(request.ticket_key)
    else:
        result = jira.get_issue(request.ticket_key)
        
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.post("/generate")
def generate_plan(request: GenerateRequest):
    """Dynamically initializes LLM based on user settings"""
    provider = "groq"
    api_key = None
    model_id = None
    
    if request.config:
        provider = request.config.get("provider", "groq").lower()
        api_key = request.config.get("apiKey")
        model_id = request.config.get("modelId")

    # Initialize engine with session-specific config
    engine = LLMEngine(provider=provider, api_key=api_key, model_id=model_id)
    plan = engine.generate_plan(request.ticket_data, request.template)
    
    return {"plan": plan}
