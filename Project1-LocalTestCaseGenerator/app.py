from flask import Flask, render_template, request, jsonify
from tools.ollama_client import generate_test_cases

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    data = request.json
    user_input = data.get('code')
    
    if not user_input:
        return jsonify({"status": "error", "message": "No code provided"}), 400

    result = generate_test_cases(user_input)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
