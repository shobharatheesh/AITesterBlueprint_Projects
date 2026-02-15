
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.jira_client import JiraClient
from app.services.llm_engine import LLMEngine

router = APIRouter()
jira = JiraClient()
llm = LLMEngine(provider="groq")

class FetchRequest(BaseModel):
    ticket_key: str

class GenerateRequest(BaseModel):
    ticket_data: dict
    template: str = ""

@router.post("/fetch")
def fetch_ticket(request: FetchRequest):
    result = jira.get_issue(request.ticket_key)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.post("/generate")
def generate_plan(request: GenerateRequest):
    plan = llm.generate_plan(request.ticket_data, request.template)
    return {"plan": plan}
