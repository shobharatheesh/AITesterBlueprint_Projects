# Project 4: Test Plan AI Agent (B.L.A.S.T. Protocol)

## 📌 Overview
This project implements an **Intelligent Test Plan Generator** using the **B.L.A.S.T.** (Blueprint, Link, Architect, Stylize, Trigger) protocol. The agent autonomously fetches requirements (JIRA, Confluence, Local Files), analyzes them using an LLM (OpenAI/Anthropic/Ollama), and generates comprehensive test plans delivered to JIRA or Slack.

## 🚀 Key Features
- **Auto-Fetch**: Retrieves tickets directly from JIRA using the REST API.
- **Context-Aware Analysis**: Uses LLMs to understand acceptance criteria and edge cases.
- **Structured Output**: Generates test plans in consistent JSON/Markdown formats using predefined schemas.
- **Multi-Destination**: delivery to JIRA (as subtasks), Slack (notifications), or CSV export.
- **Deterministic**: Designed for reliability with error handling and self-correction loops.

## 📂 Project Structure
Following the B.L.A.S.T. standard:
- **`gemini.md`**: The Project Constitution (Data Schemas, Behavioral Rules, Integrations). **Read this first.**
- **`task_plan.md`**: The implementation roadmap and current status.
- **`manifesto/B.L.A.S.T.md`**: The core operating protocol for the agent.
- **`agent.md`**: The specific persona and system prompt for the AI agent.
- **`tools/`**: (Planned) Python scripts for atomic actions (e.g., `jira_fetch.py`, `llm_generate.py`).
- **`architecture/`**: (Planned) Logic flows and SOPs.

## 🛠️ Setup & Configuration

### 1. Prerequisites
- Python 3.10+
- Node.js (for frontend if applicable)
- A JIRA Account with API Token
- An LLM Provider API Key (OpenAI, Anthropic, or running Ollama locally)

### 2. Environment Variables
1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` with your credentials:
   ```ini
   JIRA_URL=https://your-domain.atlassian.net
   JIRA_EMAIL=your-email@example.com
   JIRA_API_TOKEN=your-jira-token
   LLM_PROVIDER=openai  # or ollama
   LLM_API_KEY=sk-...
   ```

### 3. Installation
(Coming soon: `pip install -r requirements.txt`)

## 🚦 Usage Flow (Planned)
1. **Initialize**: The agent verifies connections (`Phase 2: Link`).
2. **Trigger**: User inputs a JIRA Ticket ID (e.g., `PROJ-123`).
3. **Process**:
   - `tools/fetch_jira.py` gets the ticket details.
   - `tools/normalize.py` converts it to the standard schema (defined in `gemini.md`).
   - `agent` (LLM) generates the test plan based on `agent.md` prompt.
4. **Deliver**: The result is sent to Slack or attached to the JIRA ticket.

## 🤝 Contributing
Please ensure any changes to logic are first documented in `gemini.md` or `architecture/` before writing code.

---
*Built with the B.L.A.S.T. Protocol.*
