# Findings

## Research & Discoveries
- **Ollama Status**: Installed (version 0.15.0).
- **Target Model**: `llama3.2` failed with Exit Code 2. Switched to `gemma3:1b` (Operational).
- **Architecture**:
    - **Frontend**: Clean Chat UI (HTML/Vanilla CSS/JS) for "Wow" factor.
    - **Backend**: Python (Flask) recommended to manage the "Prompt Template" logic securely and maintain state if needed.
    - **Flow**: User -> UI -> Python (Applies Template) -> Ollama -> UI.

## Constraints
- **Model Availability**: `gemma3:1b` is currently the only stable model on this machine.
- **Context Window**: Local models have limits; we must ensure the "Template + User Input" fits.
- **UI Design**: Must use Vanilla CSS with "Rich Aesthetics" (Glassmorphism, Dark Mode).
