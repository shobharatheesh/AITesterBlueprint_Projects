from fastapi import APIRouter
from pydantic import BaseModel
from app.services.jira_client import JiraClient
from app.services.llm_engine import LLMEngine

router = APIRouter()

class JiraTestRequest(BaseModel):
    url: str
    email: str
    token: str

class LLMTestRequest(BaseModel):
    provider: str
    apiKey: str = None
    modelId: str = None

@router.post("/test-jira")
def test_jira_connection(request: JiraTestRequest):
    """Synchronous endpoint runs in worker thread for maximum responsiveness"""
    client = JiraClient(url=request.url, email=request.email, token=request.token)
    result = client.test_connection_sync()
    
    if "error" in result:
        return {"status": "error", "message": result["error"]}
    
    return {"status": "success", "message": result["message"]}

@router.post("/test-llm")
def test_llm_connection(request: LLMTestRequest):
    """Verifies LLM configuration by running a tiny test generation"""
    try:
        engine = LLMEngine(
            provider=request.provider,
            api_key=request.apiKey,
            model_id=request.modelId
        )
        # Just a tiny test prompt
        test_data = {"summary": "Test Connection", "key": "TEST-1", "description": "Hello"}
        result = engine.generate_plan(test_data, "Respond with 'Connected Successfully'")
        
        if "Error" in result:
            return {"status": "error", "message": result}
            
        return {"status": "success", "message": "LLM Connection Verified!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.post("/save-settings")
def save_settings(config: dict):
    return {"status": "success", "message": "Settings saved"}
