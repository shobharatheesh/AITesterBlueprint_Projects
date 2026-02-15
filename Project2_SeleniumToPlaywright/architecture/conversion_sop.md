# SOP: LLM-Powered Selenium to Playwright Conversion (Phase 3)

## Goal
Use a local LLM (Ollama/CodeLlama) to translate complex Selenium Java test logic into high-quality Playwright TypeScript/JavaScript.

## Inputs
- `selenium_code`: Raw Java source code.
- `target_language`: 'typescript' | 'javascript'.
- `llm_model`: 'codellama' (required).

## Step-by-Step Logic
1. **Extraction**: Parse the input Java code to extract test methods and Page Objects.
2. **Context Preparation**: Construct a prompt for CodeLlama that includes:
    - The raw Java code.
    - Translation rules (e.g., "Use Playwright test hooks", "Inject awaits").
    - Expected mapping dictionary (from findings.md).
3. **LLM Inference**: Call the Ollama API (`/api/generate` or `/api/chat`).
4. **Refinement**:
    - Clean the LLM output (remove markdown blocks if present).
    - Apply regex-based post-processing for consistent formatting.
    - Ensure all actions are prefixed with `await`.
5. **Directory Management**:
    - Build a timestamped directory.
    - Save the final output and a log of the prompt used.

## Tools Required
- `ollama_client.py`: Wrapper for Ollama API communication.
- `converter_llm.py`: Logic for prompt engineering and response parsing.
- `api.py`: Updated to route requests through the LLM toolset.

## Edge Cases
- LLM hallucinating non-existent Playwright methods.
- Timeouts for very large Java files.
- Model not found on local instance.
