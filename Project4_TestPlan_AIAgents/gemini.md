# Project Constitution: Test Plan AI Agents

## 🌟 North Star
**Objective:** Automatically generate test cases from JIRA tickets, Confluence pages, or local files, and deliver them as JIRA sub-tasks, CSV exports, or Webhook payloads.

## 🔌 Integrations
**Required:**
- **JIRA:** Source (Issues) & Destination (Sub-tasks)
- **LLM Provider:** [Pending User Confirmation - assuming OpenAI/Anthropic/Ollama standard format]

**Optional/Flexible:**
- **Confluence:** Source (Pages)
- **Local Files:** Source (Markdown/Text)
- **Slack:** Destination (Notifications - Optional)
- **Notion:** Destination (Docs - Optional)
- **Webhook:** Destination (Payload Delivery)

## 🧠 Data Schemas (The Law)

### 1. Unified Input Schema
All sources (JIRA, Confluence, File) must be normalized to this structure before processing:
```json
{
  "source_type": "jira | confluence | file",
  "source_id": "string (Key-123 | URL | filepath)",
  "title": "string",
  "raw_content": "string (The full requirement text)",
  "metadata": {
    "priority": "string",
    "reporter": "string",
    "labels": ["string"]
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
1.  **Tone:** Configurable (Default: Formal/Professional).
2.  **Determinism:** Identical input must yield identical test cases (set Temperature to 0).
3.  **Traceability:** Every test case must implicitly map back to the Source ID.
4.  **"Do Not":**
    *   Do not invent credentials or data not present in the source.
    *   Do not fail silently; log all parsing errors.
    *   Do not create JIRA sub-tasks without explicit confirmation flag (safety catch).

## Architectural Invariants
1.  **Layered approach:** Source connectors -> Normalizer -> LLM Processor -> Destination adapters.
2.  **Statelessness:** The agent processes one "Job" at a time. It does not maintain long-term state between runs other than logs.

## Maintenance Log
