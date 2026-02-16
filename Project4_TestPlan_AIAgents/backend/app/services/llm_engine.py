import os
import requests
from groq import Groq
from pydantic import BaseModel
from typing import List, Optional

class LLMEngine:
    def __init__(self, provider="groq", api_key=None, model_id=None):
        self.provider = provider.lower()
        self.api_key = api_key or os.getenv("GROQ_API_KEY")
        self.model_id = model_id or "llama-3.3-70b-versatile"
        self.ollama_base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    
    def generate_plan(self, ticket_data: dict, template_text: str = "") -> str:
        prompt = self._construct_prompt(ticket_data, template_text)
        
        if "groq" in self.provider:
            if not self.api_key:
                return "Error: Groq API Key is missing. Please configure it in Settings."
            return self._call_groq(prompt)
        
        if "ollama" in self.provider:
            return self._call_ollama(prompt)
            
        if "openai" in self.provider:
            # Placeholder for OpenAI
            return "OpenAI support is coming soon! Please use Groq or Ollama for now."

        return f"LLM Provider '{self.provider}' not configured or implemented."

    def _construct_prompt(self, ticket: dict, template: str) -> str:
        return f"""
        You are a Senior QA Automation Lead. Your task is to generate a professional, high-quality Test Plan.
        
        TICKET CONTEXT:
        Key: {ticket.get('key')}
        Summary: {ticket.get('summary')}
        Description: {ticket.get('description')}
        Priority: {ticket.get('priority')}
        Status: {ticket.get('status')}

        STRICT OUTPUT FORMAT REQUIREMENT:
        You MUST provide the test cases in a CLEAR MARKDOWN TABLE with the following columns:
        | Test ID | Test Case Scenario | Summary | Steps to Reproduce | Expected Result | Test Data |
        |---------|---------------------|---------|--------------------|-----------------|-----------|

        INSTRUCTIONS:
        1. Generate at least 5-8 comprehensive test cases (Positive, Negative, and Edge cases).
        2. "Steps to Reproduce" should be bulleted within the table cell (use <br> for new lines if needed).
        3. "Test Data" should include specific examples (emails, passwords, strings).
        4. Use professional technical language.
        5. Ensure the markdown table is perfectly aligned.
        
        {f"STRICT TEMPLATE REQUIREMENT: {template}" if template else ""}
        """

    def _call_groq(self, prompt: str) -> str:
        try:
            client = Groq(api_key=self.api_key)
            completion = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=self.model_id or "llama3-70b-8192",
                temperature=0.7
            )
            return completion.choices[0].message.content
        except Exception as e:
            return f"Groq Error: {str(e)}"

    def _call_ollama(self, prompt: str) -> str:
        try:
            url = f"{self.ollama_base_url}/api/generate"
            payload = {
                "model": self.model_id or "llama3",
                "prompt": prompt,
                "stream": False
            }
            response = requests.post(url, json=payload, timeout=60)
            if response.status_code == 200:
                return response.json().get("response", "No response from Ollama")
            return f"Ollama Error: Status {response.status_code}"
        except Exception as e:
            return f"Ollama Connection Failed: {str(e)}. Is Ollama running locally on port 11434?"
