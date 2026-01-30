# Project Constitution: Gemini (Project Map & State Tracking)

## Project Overview
- **Name:** Selenium Java to Playwright JS/TS Converter
- **North Star:** Developing a Selenium Java with Playwright Javascript/TypeScript Converter. 
- **Objective:** Bridge the gap between legacy Selenium suites and modern Playwright infrastructure.
- **Discovery Answers:**
    - **Integrations:** Convert TestNG Selenium Java into Playwright Javascript/TypeScript using **Ollama API** (Local LLM).
    - **Model Requirement:** `llama3.2:latest` (Switched from codellama due to C: drive space constraints)
    - **Source of Truth:** User input via Web UI.
    - **Delivery Payload:** Converted code saved to a new directory and displayed in the UI.
    - **Behavioral Rules:** Convert everything; maintain logic, parameters, and structure. Use LLM for complex logic and mapping.

## Data Schema (Proposed)

### Conversion Payload (JSON)
```json
{
  "source": {
    "language": "java",
    "framework": "selenium",
    "content": "string" // Raw Selenium Java code
  },
  "target": {
    "language": "typescript", // or javascript
    "framework": "playwright",
    "content": "string" // Converted Playwright code
  },
  "metadata": {
    "pom_detected": "boolean",
    "conversion_log": "array",
    "unmapped_commands": "array"
  }
}
```

## Architectural Invariants
1. Follow the B.L.A.S.T. protocol.
2. Use A.N.T. 3-layer architecture.
3. Use Ollama local API for intelligent code translation.
4. All intermediate files go to `.tmp/`.

## Behavioral Rules
1. **Full Conversion:** Convert all TestNG annotations, Selenium commands, and Java logic to their Playwright equivalents.
2. **Directory Management:** Create a timestamped directory for each conversion to avoid overwriting unless specified.
3. **UI Feedback:** Provide real-time feedback and highlight potential conversion warnings.
4. **Deterministic Mapping:** Use a dictionary-based mapping for standard commands to ensure consistency.

## Maintenance Log
- (To be populated in Phase 5)
