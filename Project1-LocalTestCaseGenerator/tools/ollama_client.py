import requests
import json

# Configuration
OLLAMA_API_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "gemma3:1b"

def generate_test_cases(user_input, context=""):
    """
    Calls Ollama to generate test cases based on the SOP defined in architecture/prompt_sop.md.
    """
    
    # Construct the Prompt based on SOP
    system_prompt = (
        "You are an expert QA Automation Engineer. "
        "Your task is to analyze the following Input and generate a JSON response containing test cases. "
        "Output MUST be strict JSON in the following format: "
        "{ 'test_cases': [ { 'id': 'TC_001', 'title': '...', 'preconditions': '...', 'steps': [], 'expected_result': '...', 'type': 'Positive/Negative' } ] }. "
        "Do NOT return Python code. Return ONLY validity JSON."
    )
    
    full_prompt = f"{system_prompt}\n\nCONTEXT: {context}\n\nINPUT:\n{user_input}\n\nRESPONSE:"

    payload = {
        "model": MODEL_NAME,
        "prompt": full_prompt,
        "stream": False,
        "options": {
            "temperature": 0.2,
            "num_predict": 1024
        }
    }

    try:
        response = requests.post(OLLAMA_API_URL, json=payload, timeout=120)
        response.raise_for_status()
        result = response.json().get('response', '')
        return {"status": "success", "data": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    # Tiny test
    print("Testing Generation...")
    res = generate_test_cases("def add(a, b): return a + b")
    print(res)
