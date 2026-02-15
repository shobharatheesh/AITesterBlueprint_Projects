
import os
from groq import Groq
from dotenv import load_dotenv
import requests

# Load .env
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

def check_groq():
    print("\n--- Testing Groq ---")
    if not GROQ_API_KEY:
        print("⚠️ SKIPPED: GROQ_API_KEY not found in .env")
        return

    try:
        client = Groq(api_key=GROQ_API_KEY)
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": "Say 'Hello from Groq!'",
                }
            ],
            model="llama3-8b-8192", # Using a small fast model
        )
        print(f"✅ SUCCESS: {chat_completion.choices[0].message.content}")
    except Exception as e:
        print(f"❌ FAILED Groq: {e}")

def check_ollama():
    print("\n--- Testing Ollama ---")
    url = f"{OLLAMA_BASE_URL}/api/tags"
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            models = response.json().get('models', [])
            model_names = [m['name'] for m in models]
            print(f"✅ SUCCESS: Connected to Ollama. Available models: {model_names}")
        else:
             print(f"❌ FAILED: Ollama responded with {response.status_code}")
    except Exception as e:
         print(f"❌ FAILED: Could not connect to Ollama at {OLLAMA_BASE_URL}. Is it running?")

if __name__ == "__main__":
    check_groq()
    check_ollama()
