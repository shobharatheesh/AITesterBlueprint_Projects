
import os
from groq import Groq
from pydantic import BaseModel
from typing import List, Optional

class TestStep(BaseModel):
    step: str
    expected_result: str

class TestCase(BaseModel):
    title: str
    preconditions: List[str]
    steps: List[TestStep]
    priority: str

class TestPlan(BaseModel):
    test_cases: List[TestCase]

class LLMEngine:
    def __init__(self, provider="groq"):
        self.provider = provider
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.ollama_base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    
    def generate_plan(self, ticket_data: dict, template_text: str = "") -> str:
        prompt = self._construct_prompt(ticket_data, template_text)
        
        if self.provider == "groq" and self.groq_api_key:
            return self._call_groq(prompt)
        # Add Ollama support here if needed
        return "LLM Provider not configured or implemented."

    def _construct_prompt(self, ticket: dict, template: str) -> str:
        return f"""
        You are a QA Lead. Generate a detailed Test Plan for the following JIRA Ticket.
        
        TICKET DETAILS:
        Key: {ticket.get('key')}
        Summary: {ticket.get('summary')}
        Description: {ticket.get('description')}
        Priority: {ticket.get('priority')}

        INSTRUCTIONS:
        1. Analyze the requirements.
        2. Create comprehensive test cases (Positive, Negative, Edge Cases).
        3. Format the output in Markdown.
        
        {f"FOLLOW THIS TEMPLATE STRUCTURE: {template}" if template else ""}
        """

    def _call_groq(self, prompt: str) -> str:
        try:
            client = Groq(api_key=self.groq_api_key)
            completion = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama3-70b-8192",
            )
            return completion.choices[0].message.content
        except Exception as e:
            return f"Groq Error: {str(e)}"
