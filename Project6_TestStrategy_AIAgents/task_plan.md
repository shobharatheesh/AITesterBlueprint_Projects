# Task Plan - Project 6: Test Strategy AI Agents

## Phase 0: Initialization 🟢
- [x] Initialize Project Memory (`task_plan.md`, `findings.md`, `progress.md`, `gemini.md`)
- [ ] Answer Discovery Questions
- [ ] Define Initial Blueprint

## Phase 1: B - Blueprint (Vision & Logic) 🏗️
- [x] Research existing Test Strategy frameworks and AI agent patterns
- [x] Define Data Schema in `gemini.md`
- [x] Finalize Blueprint:
    - **Backend Stack**: Node.js (Express + TypeScript) - *[Confirmed]*
    - **Storage**: Local SQLite (SQLite3) + File system for templates.
    - **Self-Healing**: Follow the analyze-patch-test-update loop for all errors.
    - **TS Strictness**: Use strict TypeScript configurations for both backend and frontend to ensure type safety for JSON payloads.
    - **API Security**: No keys in client-side code; proxy all external requests through the Node.js backend.
- [x] Implement Configuration & Settings Module (JIRA, LLM, Templates)

## Phase 2: L - Link (Connectivity) ⚡
- [x] Initialize project directories (`frontend`, `backend`, `templates`, `.tmp`)
- [x] Setup `backend` project (npm init, tsconfig, express)
- [x] Setup `frontend` project (Vite + React + TS)
- [x] Verify JIRA API connection via minimal script (`tools/check_jira.py`)
- [x] Verify Groq/Ollama connection via minimal script (`tools/check_llm.py`)

## Phase 3: A - Architect (The 3-Layer Build) ⚙️
- [x] Layer 1: Create SOPs in `architecture/` (JIRA Fetching, LLM Generation)
- [x] Layer 2: Define Navigation logic (Express routes in `src/routes/api.ts`)
- [x] Layer 3: Build deterministic Python scripts & TS services (`jira-client.ts`, `llm-provider.ts`)

## Phase 4: S - Stylize (Refinement & UI) ✨
- [x] Refine output payloads
- [x] Design and implement UI (Premium Dashboard in `App.tsx`)
- [ ] Get user feedback

## Phase 5: T - Trigger (Deployment) 🛰️
- [ ] Move logic to production environment
- [ ] Setup execution triggers
- [ ] Finalize Maintenance Log in `gemini.md`
