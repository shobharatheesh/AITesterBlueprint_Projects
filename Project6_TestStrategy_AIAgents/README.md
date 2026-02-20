# 🚀 B.L.A.S.T. — Intelligent Test Strategy Generator

> **Blueprint · Link · Architect · Stylize · Trigger**  
> An AI-powered, full-stack agentic application that autonomously transforms JIRA requirements into production-ready test strategies.

![Tech Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20React%20%7C%20TypeScript-blue)
![AI](https://img.shields.io/badge/AI-Groq%20%7C%20Ollama%20%7C%20Llama%203.3-indigo)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📸 Features

- 🔌 **JIRA Integration** — Directly fetch ticket data (summary, description, acceptance criteria, labels) via REST API.
- 🧠 **AI-Powered Strategy Generation** — Uses Groq (Llama 3.3/3.1) or local Ollama LLMs to write full test plans.
- 📄 **PDF Template Mapping** — Upload your company's test strategy PDF and the AI automatically learns and replicates its structure.
- 📥 **PDF Export** — Download a professionally formatted, multi-page test strategy PDF for stakeholders.
- 📋 **Copy to Clipboard** — One-click copy of the full strategy for pasting into documents or emails.
- 💾 **Persistent Configuration** — All settings (JIRA credentials, LLM keys, model choices) are stored securely in a local SQLite database.
- 🏠 **Privacy-First Local Mode** — Full support for running the AI 100% locally via Ollama. No data leaves your machine.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express, TypeScript, ts-node-dev |
| **Database** | SQLite3 (via `sqlite` and `sqlite3` npm packages) |
| **AI Cloud** | Groq API (Llama 3.3 70B Versatile, Llama 3.1, Mixtral) |
| **AI Local** | Ollama (any compatible local model) |
| **File Handling** | Multer (PDF uploads), pdf-parse (structure extraction) |
| **PDF Export** | jsPDF (multi-page document generation) |

---

## 📁 Project Structure

```
Project6_TestStrategy_AIAgents/
│
├── backend/                    # Express API Server
│   ├── src/
│   │   ├── db/
│   │   │   └── settings.ts     # SQLite connection & helpers
│   │   ├── routes/
│   │   │   └── api.ts          # All API endpoints
│   │   ├── services/
│   │   │   ├── jira-client.ts  # JIRA REST API integration
│   │   │   ├── llm-provider.ts # Groq & Ollama LLM logic
│   │   │   └── pdf-parser.ts   # PDF structure extraction
│   │   └── index.ts            # Express server entrypoint
│   ├── data/                   # SQLite DB lives here (gitignored)
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # React Vite Application
│   ├── src/
│   │   ├── App.tsx             # Main app with all pages & components
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts          # API proxy config (→ backend:3001)
│   ├── tailwind.config.js
│   └── package.json
│
├── tools/
│   ├── init_db.py              # Database initialization script
│   ├── check_jira.py           # JIRA connectivity test script
│   └── check_llm.py            # LLM connectivity test script
│
├── architecture/               # Design documentation
├── .env.example                # Environment variable template
├── B.L.A.S.T.md                # Protocol specification
├── prompt.md                   # LLM prompt engineering docs
└── README.md
```

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18 or higher → [https://nodejs.org](https://nodejs.org)
- **npm** v9 or higher (comes with Node.js)
- **Python 3** (for the database init script)
- **Git**
- **A Groq API Key** (free at [https://console.groq.com](https://console.groq.com)) — *OR* — **Ollama** installed locally ([https://ollama.ai](https://ollama.ai))

---

## 🚀 Full Setup Guide

### Step 1: Clone the Repository

```bash
git clone https://github.com/shobharatheesh/AITesterBlueprint_Projects.git
cd AITesterBlueprint_Projects/Project6_TestStrategy_AIAgents
```

### Step 2: Set Up Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Open `.env` and configure it:

```env
# JIRA Configuration (can also be set via the UI later)
JIRA_BASE_URL=https://your-company.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your-jira-api-token

# Groq API (for cloud LLM — get free key at console.groq.com)
GROQ_API_KEY=gsk_your_groq_api_key_here

# Ollama (for local LLM — optional)
OLLAMA_BASE_URL=http://localhost:11434
```

> **💡 Tip:** You can skip the `.env` file entirely and configure everything directly in the **Settings** page of the UI at runtime.

### Step 3: Initialize the Database

Run the Python script to create the SQLite database and tables:

```bash
python tools/init_db.py
```

You should see:
```
Database initialized at .../backend/data/app.db
```

### Step 4: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 5: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

## ▶️ Running the Application

You need **two terminal windows** — one for the backend, one for the frontend.

### Terminal 1 — Start the Backend (Port 3001)

```bash
cd backend
npm run dev
```

Expected output:
```
🚀 B.L.A.S.T. Server running on port 3001
✅ SQLite database connected
```

### Terminal 2 — Start the Frontend (Port 5173)

```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Open the Application

Navigate to: **[http://localhost:5173](http://localhost:5173)**

---

## 🗺️ Application Workflow

### 1. Configure Settings (First Time)

1. Click **Settings** in the left sidebar.
2. **JIRA Integration Section:**
   - Enter your JIRA **Base URL** (e.g., `https://mycompany.atlassian.net`)
   - Enter your **Email Address**
   - Enter your **API Token** (generate at: [https://id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens))
   - Click **"Validate Credentials"** to confirm the connection.
3. **Intelligence Profile Section:**
   - Choose **Groq API** (cloud, fast) or **Ollama** (local, private).
   - For Groq: Paste your API key and select a model (recommended: `llama-3.3-70b-versatile`).
   - For Ollama: Enter your local URL and model name (e.g., `llama3`).
4. Click **"Apply Changes"** to save all settings persistently to the database.

### 2. Upload a Custom PDF Template (Optional)

1. Scroll down in Settings to **"Strategy Frameworks"**.
2. Click the **"Deploy New Template"** zone.
3. Select a PDF that represents your company's test strategy format.
4. The AI will automatically extract the section headings and display them in the **"Mapped Structure"** panel.
5. Click **Apply Changes**.

> From this point, all generated strategies will follow your company's template structure.

### 3. Generate a Test Strategy

1. Click **Generate** in the left sidebar.
2. In the **"Connect Ticket"** input, type your JIRA ticket ID (e.g., `PROJ-123`).
3. Press **Enter** or click the send button (→). The ticket preview will appear showing its summary and status.
4. Click **"Generate Test Plan"**.
5. Wait for the AI to analyze and write the strategy (typically 5–15 seconds).
6. The full strategy will appear in the **"Strategy Output"** panel on the right.

### 4. Export the Strategy

- **Copy:** Click the copy icon (📋) at the top-right of the output panel to copy the full text to your clipboard.
- **PDF Download:** Click the download icon (📥) to generate and save a professionally formatted, multi-page PDF report including ticket metadata, timestamps, and page numbers.

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/settings` | Fetch all saved configurations |
| `POST` | `/api/settings/save` | Save all configurations to SQLite |
| `POST` | `/api/jira/test` | Validate JIRA credentials |
| `POST` | `/api/jira/fetch` | Fetch a JIRA ticket by ID |
| `POST` | `/api/llm/test-groq` | Validate Groq API key |
| `POST` | `/api/llm/test-ollama` | Validate Ollama local endpoint |
| `POST` | `/api/templates/upload` | Upload a PDF template and extract structure |
| `POST` | `/api/testplan/generate` | Generate a full test strategy for a JIRA ticket |

---

## 🔒 Security Notes

- **API Keys are never exposed to the frontend.** They are stored server-side in the local SQLite database.
- The `.env` file and `backend/data/app.db` are **gitignored** to prevent credential leakage.
- JIRA credentials are used exclusively for fetching ticket data within the API request-response cycle. No data is logged or persisted beyond settings.

---

## 🧪 Available LLM Models (Groq)

| Model ID | Speed | Best For |
|---|---|---|
| `llama-3.3-70b-versatile` | Fast | Complex strategies (Recommended) |
| `llama-3.1-70b-versatile` | Fast | Detailed analysis |
| `llama-3.1-8b-instant` | Very Fast | Quick iterations |
| `mixtral-8x7b-32768` | Fast | Large context / long descriptions |

---

## 🐛 Troubleshooting

| Issue | Solution |
|---|---|
| `SQLITE_CANTOPEN` error | Run `python tools/init_db.py` to initialize the database directory |
| Groq model decommissioned error | Go to **Settings** → Select `llama-3.3-70b-versatile` → Apply Changes |
| JIRA fetch fails | Ensure your Base URL has no trailing slash and your API Token is valid |
| Ollama connection refused | Make sure Ollama is running: `ollama serve` in a terminal |
| PDF export is incomplete | This is fixed — the engine now supports multi-page output via `jsPDF` |

---

## 📜 The B.L.A.S.T. Protocol

This project is built on the **B.L.A.S.T.** methodology for deterministic AI behavior:

| Letter | Principle | Description |
|---|---|---|
| **B** | Blueprint | Define the output structure before invoking the LLM |
| **L** | Link | Connect the AI to live, structured data sources (JIRA) |
| **A** | Architect | Map requirements to a formal test strategy framework |
| **S** | Stylize | Format the output to match professional standards |
| **T** | Trigger | Execute the strategy generation pipeline deterministically |

See `B.L.A.S.T.md` for the full protocol specification.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'feat: add AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

**Built with ❤️ using the B.L.A.S.T. Protocol**

*Transforming QA Engineering through Agentic AI*

</div>
