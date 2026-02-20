# Findings - Project 6: Test Strategy AI Agents

## Research & Discoveries
- **Project Goal**: Automate Test Strategy generation using JIRA + LLMs (Groq/Ollama) + PDF Templates.
- **Frontend Stack**: React (Vite) + TS + Tailwind + shadcn/ui.
- **Backend Options**: Node.js (Express + TypeScript) - *[Confirmed]*
- **PDF Parsing**: `pdf-parse` (Node) or `PyPDF2/pdfminer` (Python) will be required to extract template structure.
- **Security**: Must implement local encryption for API keys (e.g., using a library like `crypto` or `keytar`).

## Constraints
- Must follow A.N.T. 3-layer architecture.
- Reliability over speed.
- No guessing at business logic.
