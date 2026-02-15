# Project Constitution: Test Plan AI Agents

## 🌟 North Star
**Objective:** Build a **Full-Stack Intelligent Test Plan Generator** that automates test plan creation by integrating **JIRA ticket data** with **LLM-powered analysis** (Groq/Ollama) using **customizable PDF templates**.

## 🔌 Integrations
**Required:**
- **JIRA:** Source (REST API v3) - Fetch Tickets.
- **LLM Provider:**
    - **Cloud:** Groq API (SDK)
    - **Local:** Ollama (REST API)
- **Storage:** SQLite (Settings/History) + File System (Templates)
- **Frontend:** React + Vite + Tailwind (User Interface)
- **Backend:** Python (FastAPI) (API Logic)

**Deprecated/Optional (from initial draft):**
- Slack/Notion (Secondary priority, focus on Web App first)

## 🧠 Data Schemas (The Law)

### 1. Unified Input Schema
All requests to the Agent must provide:
```json
{
  "ticket_data": {
    "key": "VWO-123",
    "summary": "string",
    "description": "string",
    "acceptance_criteria": "string",
    "priority": "string",
    "status": "string",
    "assignee": "string"
  },
  "template_data": {
    "id": "string",
    "sections": ["string (extracted from PDF)"]
  },
  "config": {
    "provider": "groq | ollama",
    "model": "string"
  }
}
```

### 2. Core Intelligent Model (The Test Plan)
The LLM must output exactly this JSON structure:
```json
{
  "test_plan_id": "string (UUID)",
  "generated_at": "ISO8601",
  "test_cases": [
    {
      "title": "string (Action-Result format)",
      "description": "string",
      "preconditions": ["string"],
      "steps": ["string"],
      "expected_result": "string",
      "priority": "High | Medium | Low",
      "tags": ["string"]
    }
  ]
}
```

### 3. Delivery Config
```json
{
  "create_jira_subtasks": boolean,
  "export_csv": boolean,
  "webhook_url": "string | null",
  "csv_path": "string | null"
}
```

## 📏 Behavioral Rules
1.  **Security First:** API Keys must NEVER be stored in Frontend `localStorage`. Use backend/OS secure storage.
2.  **Error Handling & Resilience:**
    - **Timeouts:** 30s for Groq, 120s for Ollama.
    - **Retry Logic:** 3 attempts with exponential backoff.
    - **Fallback:** Structured error messages if LLM fails.
3.  **Determinism:** Identical input + Template must yield consistent structure.
4.  **Aesthetic:** Clean, professional QA/Testing tone.
5.  **Validation:** Sanitize JIRA IDs (Regex: `[A-Z]+-\d+`). Do not process malicious PDF uploads.

## Architectural Invariants
1.  **Layered approach:** Source connectors -> Normalizer -> LLM Processor -> Destination adapters.
2.  **Statelessness:** The agent processes one "Job" at a time. It does not maintain long-term state between runs other than logs.

## Maintenance Log
