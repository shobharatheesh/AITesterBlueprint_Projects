import os
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

def test_groq():
    api_key = os.getenv('GROQ_API_KEY')
    if not api_key or "your-groq" in api_key:
        print("⏭️ Groq API Key not configured. Skipping.")
        return

    url = "https://api.groq.com/openai/v1/models"
    headers = {"Authorization": f"Bearer {api_key}"}

    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            print("✅ Success! Groq API is reachable and key is valid.")
        else:
            print(f"❌ Groq Connection Failed. Status: {response.status_code}")
    except Exception as e:
        print(f"❌ Groq Error: {str(e)}")

def test_ollama():
    base_url = os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434')
    url = f"{base_url.rstrip('/')}/api/tags"

    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            models = response.json().get('models', [])
            model_names = [m['name'] for m in models]
            print(f"✅ Success! Ollama is running. Available models: {', '.join(model_names)}")
        else:
            print(f"❌ Ollama returned status {response.status_code}")
    except Exception as e:
        print(f"⏭️ Ollama is likely not running or unreachable: {str(e)}")

if __name__ == "__main__":
    print("--- Testing LLM Connectivity ---")
    test_groq()
    test_ollama()
