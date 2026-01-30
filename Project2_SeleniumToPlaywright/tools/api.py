from flask import Flask, request, jsonify, make_response
import os
import sys

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from converter_engine import run_conversion as run_regex_conversion
from converter_llm import run_llm_conversion

app = Flask(__name__)

# Manual CORS implementation to avoid missing dependency
@app.after_request
def add_cors_headers(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

OUTPUT_DIR = "D:\\SeleniumToPlaywright_Conversions"

@app.route('/convert', methods=['POST', 'OPTIONS'])
def convert():
    if request.method == 'OPTIONS':
        return make_response('', 200)
        
    data = request.json
    selenium_code = data.get('selenium_code')
    target_lang = data.get('target_language', 'typescript')
    mode = data.get('mode', 'llm') 
    
    if not selenium_code:
        return jsonify({"status": "error", "message": "No code provided"}), 400
    
    try:
        if not os.path.exists(OUTPUT_DIR):
            os.makedirs(OUTPUT_DIR)
            
        if mode == 'llm':
            try:
                playwright_code, file_path = run_llm_conversion(selenium_code, OUTPUT_DIR, target_lang)
                if "Error:" in playwright_code:
                    raise Exception(playwright_code)
            except Exception as e:
                print(f"LLM Conversion failed: {str(e)}. Falling back to regex.")
                playwright_code, file_path = run_regex_conversion(selenium_code, OUTPUT_DIR, target_lang)
        else:
            playwright_code, file_path = run_regex_conversion(selenium_code, OUTPUT_DIR, target_lang)
        
        return jsonify({
            "status": "success",
            "playwright_code": playwright_code,
            "file_path": file_path,
            "message": "Conversion completed successfully",
            "mode_used": mode if "Error:" not in playwright_code else "regex_fallback"
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5001, debug=True, threaded=True)
