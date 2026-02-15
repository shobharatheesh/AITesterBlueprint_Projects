# Findings & Research: Intelligent Test Plan Agent

## 🔍 Research & Tech Stack
- **Backend Architecture:** Selected **FastAPI** over Express for its native support for asynchronous Python, which is ideal for handling LLM response times and JIRA API requests.
- **LLM Connectivity:** 
    - **Groq SDK:** Integrated for high-speed cloud inference. Research showed Llama3-70b provides the best balance of context comprehension for complex JIRA tickets.
    - **Ollama REST API:** Researched the `/api/generate` and `/api/tags` endpoints for local model support, ensuring portability.
- **JIRA REST API v3:** Identified that the v3 API returns descriptions in **Atlassian Document Format (ADF)**, a nested JSON structure. Current implementation treats it as a raw object/string; future optimization may require a custom ADF-to-Markdown parser.
- **Frontend Layer:** Used **Vite + React** with **Tailwind CSS** for a desktop-first, performance-oriented UI. Integrated **Framer Motion** for micro-animations (loading states and transitions).

## 💡 Discoveries
- **Proxy Necessity:** During development, confirmed that a Vite proxy configuration is essential to bypass CORS issues when the frontend (Port 3000) calls the FastAPI backend (Port 8000).
- **Environment Context:** Found that JIRA API tokens must be paired with the user's email address in a Basic Auth header (`HTTPBasicAuth` in Python) for successful authentication.
- **Ollama Latency:** Local LLM generation via Ollama can take significantly longer (60-120s) compared to Groq (2-5s), requiring distinct timeout configurations in the backend.
- **Glassmorphism Design:** Discovered that using `backdrop-blur-xl` with low-opacity backgrounds (`bg-white/5`) provides a premium "OS-level" feel that fits the B.L.A.S.T. high-tech aesthetic.

## ⚠️ Constraints & Limitations
- **Security:** API keys and JIRA tokens are strictly limited to the `.env` file and processed only on the backend. No keys are ever exposed to the client-side build or `localStorage`.
- **Input Sanitization:** JIRA IDs must follow the `[A-Z]+-\d+` pattern. Malicious inputs are filtered via Pydantic models in FastAPI.
- **Data Persistence:** The current implementation uses an ephemeral state. History and persistent settings are documented in `gemini.md` to be moved to a local **SQLite** database in the next iteration.
- **PDF Extraction:** PDF template parsing is currently a roadmap item. The system currently uses string-based prompts for test case formatting.
