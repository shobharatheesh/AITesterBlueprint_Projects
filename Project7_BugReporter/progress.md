# 📋 Progress — Project 7: AI Bug Reporter

## ✅ COMPLETED

### Phase 1: Blueprint
- [x] Read B.L.A.S.T.md and prompt.md
- [x] Define data schema in gemini.md
- [x] Identify tech stack: React (Vite) + Groq API

### Phase 2: Link
- [x] Groq API integration with vision model (meta-llama/llama-4-scout-17b-16e-instruct)
- [x] API key input in UI (user-provided, stored in session)

### Phase 3: Architect
- [x] Scaffold Vite React project
- [x] Build UploadForm component with drag-and-drop
- [x] Build BugTicket display component
- [x] Build Groq API service module for image analysis
- [x] Build JIRA Settings modal component
- [x] Build JIRA API service module for issue creation

### Phase 4: Stylize
- [x] Dark-mode premium UI
- [x] Glassmorphism card design
- [x] Animated micro-interactions
- [x] Copy-to-clipboard for ticket
- [x] Export ticket as .txt and .json
- [x] JIRA integration UI with connection test

### Phase 5: Integration
- [x] JIRA Cloud REST API v3 integration
- [x] Test connection functionality
- [x] CORS handling documentation
- [x] Error handling with human-readable messages

---

## 🚀 Ready to Use

### Features
1. **Screenshot Upload** - Drag & drop or click to select
2. **Issue Details** - Description, Expected Behavior, Environment (URL, Browser, OS, Version)
3. **Groq API Analysis** - Vision AI analyzes screenshot and generates structured bug report
4. **JIRA Ticket Output** - Project, Summary, Module, Feature, Severity, Priority, Steps, Results, Environment
5. **Export Options** - Copy to clipboard, Export as .txt, Export as JSON
6. **JIRA Integration** - Direct issue creation in JIRA Cloud with credentials

### Severity Levels
- 🔴 Blocker - Application crash / Cannot proceed
- 🟠 Critical - Core feature broken
- 🟡 Major - Important feature impacted
- 🔵 Minor - UI/Validation issue
- ⚪ Trivial - Cosmetic issue

### Priority Levels
- P1 - Immediate fix needed
- P2 - High priority
- P3 - Normal
- P4 - Low

---

## 📁 Project Structure
```
bug-reporter/
├── src/
│   ├── App.jsx              # Main app component
│   ├── App.css              # Global styles & design system
│   ├── components/
│   │   ├── UploadForm.jsx   # Form with screenshot upload
│   │   ├── UploadForm.css
│   │   ├── BugTicket.jsx    # JIRA ticket display
│   │   ├── BugTicket.css
│   │   ├── JiraSettings.jsx # JIRA connection settings
│   │   └── JiraSettings.css
│   ├── services/
│   │   ├── groqService.js   # Groq Vision AI API
│   │   └── jiraService.js   # JIRA REST API
│   ├── index.css
│   └── main.jsx
├── index.html
└── package.json
```

---

## 🏃 How to Run

```bash
cd bug-reporter
npm install
npm run dev
```

### Prerequisites
- Node.js 18+
- Groq API Key (get from console.groq.com)
- (Optional) JIRA Cloud account for direct integration

---

## 🔧 JIRA Integration Setup

1. Click "Connect JIRA" in the header
2. Enter your JIRA Cloud domain (e.g., `yourcompany.atlassian.net`)
3. Enter your Atlassian email
4. Generate an API token at id.atlassian.com → Security → API tokens
5. Enter your Project Key (e.g., PROJ, DEV, QA)
6. Click "Test Connection" to verify
7. Click "Save Settings"

### Note on CORS
Browsers block direct API calls to JIRA due to CORS policy. To create issues directly:
- Use a browser extension like "Allow CORS" temporarily
- Or use Copy/Export buttons and paste into JIRA manually
