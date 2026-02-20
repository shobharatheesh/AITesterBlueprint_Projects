# SOP: JIRA Ticket Fetching

## Objective
To retrieve structured ticket data from JIRA using the REST API v3.

## Inputs
- `ticketId` (e.g., "PROJ-123")
- JIRA Credentials (`BASE_URL`, `EMAIL`, `API_TOKEN`) from environment/db.

## Steps
1. **Validate Input**: Check if `ticketId` follows the regex `[A-Z]+-\d+`.
2. **Construct Request**: Call `GET /rest/api/3/issue/{ticketId}`.
3. **Parse Response**:
    - Extract `summary`, `description` (Atlassian Document Format).
    - Map `priority`, `status`, `labels`.
    - Extract `Acceptance Criteria` (search description for keywords or check custom fields).
4. **Error Handling**:
    - 404: Ticket not found.
    - 401: Invalid credentials.
    - 403: Forbidden access.

## Output
Return `JiraTicketData` object as defined in `gemini.md`.
