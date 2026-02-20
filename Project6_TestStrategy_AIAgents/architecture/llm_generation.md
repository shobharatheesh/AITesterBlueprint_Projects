# SOP: LLM Test Plan Generation

## Objective
To generate a comprehensive test plan by mapping JIRA ticket data to a template structure using LLMs.

## Inputs
- `ticketData` (JiraTicketData)
- `templateStructure` (TemplateContext)
- `provider` ("groq" or "ollama")

## Steps
1. **Prepare Prompt**:
    - System Role: Professional QA Engineer.
    - Context: Inject JIRA data and template sections.
    - Constraint: Follow the template structure strictly.
2. **Execute Call**:
    - If Groq: Call OpenAI-compatible endpoint with `llama3-70b-8192`.
    - If Ollama: Call `/api/generate` with local model (e.g., `llama3`).
3. **Handle Response**:
    - Parse sections.
    - Ensure markdown formatting is preserved.
4. **Retry Logic**: If failure, retry up to 3 times with backoff.

## Output
Return `TestPlanPayload` as defined in `gemini.md`.
