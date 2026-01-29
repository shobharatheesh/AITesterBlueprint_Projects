import requests
import json
import sys

def check_ollama_connection():
    url = "http://localhost:11434/api/tags"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            models = response.json().get('models', [])
            print(f"✅ Ollama is reachable. Found {len(models)} models.")
            for m in models:
                print(f"   - {m['name']}")
            return models
        else:
            print(f"❌ Ollama reachable but returned status {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Failed to connect to Ollama: {e}")
        return []

def test_inference(model_name):
    url = "http://localhost:11434/api/generate"
    payload = {
        "model": model_name,
        "prompt": "Say 'System Online' and nothing else.",
        "stream": False
    }
    try:
        print(f"Testing inference with {model_name}...")
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            result = response.json().get('response', '').strip()
            print(f"✅ Inference Successful! Response: '{result}'")
            return True
        else:
            print(f"❌ Inference failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Inference error: {e}")
        return False

if __name__ == "__main__":
    print("--- 📡 B.L.A.S.T. Link Verification ---")
    models = check_ollama_connection()
    target_model = "gemma3:1b"
    
    # Check if target model exists (partial match)
    model_exists = any(target_model.split(':')[0] in m['name'] for m in models)
    
    if model_exists:
        test_inference(target_model)
    else:
        print(f"⚠️ Target model '{target_model}' not found in list. Please wait for pull to complete.")
