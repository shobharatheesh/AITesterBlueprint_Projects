# Process: Project 4 - Test Plan AI Agents

## Phase 0: Initialization
- [x] Initialize Project Memory (task_plan, findings, progress, gemini)

## Phase 1: Blueprint (Vision & Logic)
- [x] Discovery: Ask 5 questions
- [x] Define Data Schema in gemini.md
- [ ] Research helpful resources

## Phase 2: Link (Connectivity)
- [ ] **Env Setup:** Create .env with JIRA, GROQ, OLLAMA configs
- [x] **Backend Init:** Initialize FastAPI project structure (backend/app, requirements.txt)
- [ ] **Connection Test (JIRA):** Script to fetch 1 ticket (backend/scripts/test_jira.py)
- [ ] **Connection Test (Groq/Ollama):** Script to generate simple text (backend/scripts/test_llm.py)
- [ ] **Connection Test (SQLite):** Initialize DB

## Phase 3: Architect (Full-Stack Build)
- [x] **Backend API:** Implement `/api/jira/fetch`, `/api/testplan/generate`
- [x] **Frontend Init:** Setup React + Vite + Tailwind
- [x] **UI components:** Settings, Ticket Display, Markdown Editor
- [x] **Integration:** Connect Frontend to Backend APIs

## Phase 4: Stylize (Refinement & UI)
- [ ] Payload Refinement
- [ ] UI/UX

## Phase 5: Trigger (Deployment)
- [ ] Cloud Transfer
- [ ] Automation
- [ ] Documentation
