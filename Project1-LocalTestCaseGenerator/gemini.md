# Project Constitution (gemini.md)

## Data Schemas

### 1. Chat Interaction (Input)
```json
{
  "user_message": "string (The requirements or code snippet from the user)",
  "model": "llama3.2"
}
```

### 2. Template Structure (Internal)
*The system will wrap the user input in this structure before sending to Ollama:*
```text
SYSTEM: You are a QA Automation Expert.
CONTEXT: [User Input]
INSTRUCTION: Generate comprehensive test cases following this format: [Format Instructions]
```

### 3. Generation Response (Output)
```json
{
  "response": "string (Markdown formatted test cases)",
  "status": "success | error",
  "meta": {
    "model": "llama3.2",
    "duration": "number (seconds)"
  }
}
```

## Behavioral Rules
1. Prioritize reliability over speed.
2. Never guess at business logic.
3. Follow B.L.A.S.T. and A.N.T. architecture.

## Architectural Invariants
- **B.L.A.S.T.** (Blueprint, Link, Architect, Stylize, Trigger)
- **A.N.T.** 3-layer architecture
