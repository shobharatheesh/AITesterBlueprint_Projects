# Gemini - Project Constitution

## API Endpoints (Backend)
- `GET /api/settings` → Fetch all persistent settings.
- `POST /api/settings/save` → Save key-value settings.
- `POST /api/jira/test` → Validate JIRA credentials.
- `POST /api/jira/fetch` → Fetch structured ticket data.
- `POST /api/llm/test-groq` → Validate Groq Cloud API.
- `POST /api/llm/test-ollama` → Validate Ollama Local API.
- `POST /api/testplan/generate` → Main strategy generation endpoint.

## Maintenance Log

### 1. JiraTicketData
```json
{
  "key": "string",
  "summary": "string",
  "description": "string (markdown/formatted)",
  "priority": "string",
  "status": "string",
  "assignee": "string",
  "labels": ["string"],
  "acceptance_criteria": ["string"]
}
```

### 2. TemplateContext
```json
{
  "id": "string",
  "name": "string",
  "sections": [
    {
      "heading": "string",
      "content_placeholder": "string"
    }
  ]
}
```

### 3. TestPlanPayload (Final Output)
```json
{
  "ticket_key": "string",
  "template_id": "string",
  "generated_at": "timestamp",
  "status": "draft | final",
  "content": {
    "sections": [
      {
        "heading": "string",
        "generated_content": "string"
      }
    ]
  }
}
```

## Behavioral Rules
1. **Deterministic Logic**: High-level reasoning is handled by the System Pilot; execution logic must be deterministic Python scripts in `tools/`.
2. **SOP First**: Update Architecture SOPs before modifying tool code.
3. **No Placeholders**: Never use placeholder data; always generate or fetch real assets.
4. **Self-Healing**: Follow the analyze-patch-test-update loop for all errors.
5. **TS Strictness**: Use strict TypeScript configurations for both backend and frontend to ensure type safety for JSON payloads.
6. **API Security**: No keys in client-side code; proxy all external requests through the Node.js backend.

## Architectural Invariants
- 3-Layer Architecture: Architecture (SOPs), Navigation (Reasoning), Tools (Execution).
- All intermediate files stored in `.tmp/`.
- Environment variables in `.env`.

## Maintenance Log
*(To be populated during Phase 5)*
