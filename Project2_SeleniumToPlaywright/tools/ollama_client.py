import requests
import json

class OllamaClient:
    def __init__(self, base_url="http://localhost:11434", model="gemma3:1b"):
        self.base_url = base_url
        self.model = model

    def check_connection(self):
        try:
            response = requests.get(f"{self.base_url}/api/tags")
            if response.status_code == 200:
                models = [m['name'] for m in response.json().get('models', [])]
                return True, models
            return False, []
        except Exception as e:
            return False, str(e)

    def generate(self, prompt, system_prompt=None):
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.1
            }
        }
        if system_prompt:
            payload["system"] = system_prompt

        try:
            response = requests.post(f"{self.base_url}/api/generate", json=payload)
            if response.status_code == 200:
                return response.json().get('response', '')
            else:
                return f"Error: API returned {response.status_code} - {response.text}"
        except Exception as e:
            return f"Error: {str(e)}"

if __name__ == "__main__":
    client = OllamaClient()
    connected, models = client.check_connection()
    print(f"Connected: {connected}")
    print(f"Models: {models}")
    
    if connected and "codellama:latest" in models or "codellama" in models:
        print("Testing prompt...")
        print(client.generate("Write a 'Hello World' in TypeScript"))
    else:
        print("CodeLlama not found. Please run 'ollama pull codellama'")
