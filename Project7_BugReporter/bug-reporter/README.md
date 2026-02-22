# 🐞 AI Bug Reporter

> Transform screenshots into production-ready JIRA bug reports using AI vision technology.

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3.1-646CFF?logo=vite)](https://vitejs.dev/)
[![Groq](https://img.shields.io/badge/Groq-AI-orange)](https://groq.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

![AI Bug Reporter Screenshot](https://via.placeholder.com/800x400/1a1a2e/ffffff?text=AI+Bug+Reporter+Screenshot)

---

## ✨ Features

### 🤖 AI-Powered Analysis
- **Vision AI** analyzes screenshots to identify UI issues
- **Auto-categorization** of Severity (Blocker/Critical/Major/Minor/Trivial)
- **Auto-assignment** of Priority (P1-P4)
- **Smart detection** of modules and features

### 🎫 JIRA Integration
- Create issues directly in JIRA Cloud
- Automatic field mapping
- Error handling with actionable messages
- Permission checking

### 📊 Export Options
| Format | Description |
|--------|-------------|
| 📕 **PDF** | Professional formatted report with screenshot |
| 📊 **Excel** | Multi-sheet workbook with test case format |
| 📄 **TXT** | Plain text format for quick sharing |
| 📦 **JSON** | Structured data for API integration |
| 📋 **Copy** | Copy to clipboard |

### 🎨 Premium UI
- Dark mode with glassmorphism design
- Responsive layout
- Animated micro-interactions
- Drag & drop file upload

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have:
- [Node.js](https://nodejs.org/) 18+ installed
- A [Groq](https://console.groq.com) API key
- (Optional) JIRA Cloud account for ticket creation

### Step 1: Clone the Repository

```bash
git clone https://github.com/shobharatheesh/AITesterBlueprint_Projects.git
cd AITesterBlueprint_Projects/Project7_BugReporter/bug-reporter
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment

Create a `.env` file in the root directory:

```bash
# Optional: Add your Groq API key here
# Or enter it directly in the app
VITE_GROQ_API_KEY=your_groq_api_key_here
```

### Step 4: Start the Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

---

## 📖 Usage Guide

### Generating a Bug Report

1. **Open the App**
   ```
   http://localhost:5173
   ```

2. **Enter Groq API Key**
   - Get your free API key from https://console.groq.com
   - Paste it in the "Groq API Key" field
   - Or set it in the `.env` file

3. **Upload Screenshot**
   - Drag and drop an image, or click to browse
   - Supports PNG, JPG, WebP formats

4. **Add Context (Optional)**
   - **Issue Description:** Brief explanation of the bug
   - **Expected Behavior:** What should happen
   - **Environment:** App URL, Browser, OS, Build Version

5. **Generate Report**
   - Click "🔍 Generate JIRA Ticket"
   - AI will analyze the screenshot
   - Bug report appears in seconds

### Connecting to JIRA

1. Click **"Connect JIRA"** (top right corner)

2. Enter your JIRA credentials:
   | Field | How to Find |
   |-------|-------------|
   | **Domain** | Your JIRA URL: `yourcompany.atlassian.net` |
   | **Email** | Your Atlassian account email |
   | **API Token** | Generate at [id.atlassian.com](https://id.atlassian.com/manage-profile/security/api-tokens) |
   | **Project Key** | Found in JIRA: Projects → View All Projects → Key column |

3. Click **"Test Connection"** to verify

4. Click **"Save Settings"**

5. Now click **"Create in [PROJECT]"** to create JIRA issues directly!

### Exporting Reports

After generating a bug ticket, click any export button:

- **📋 Copy** — Copy formatted text to clipboard
- **📄 .txt** — Download as text file
- **📦 JSON** — Download structured JSON
- **📕 PDF** — Download professional PDF report
- **📊 Excel** — Download Excel workbook with test case format

---

## 🏗️ Architecture

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19 + Vite |
| **Styling** | Vanilla CSS |
| **AI Engine** | Groq API (Llama Vision) |
| **PDF Export** | jsPDF |
| **Excel Export** | XLSX |
| **Icons** | SVG |

### Project Structure

```
bug-reporter/
├── src/
│   ├── components/
│   │   ├── UploadForm.jsx      # Screenshot upload form
│   │   ├── BugTicket.jsx       # Bug report display
│   │   ├── JiraSettings.jsx    # JIRA configuration modal
│   │   └── *.css               # Component styles
│   ├── services/
│   │   ├── groqService.js      # Groq AI API integration
│   │   ├── jiraService.js      # JIRA REST API integration
│   │   └── exportService.js    # PDF/Excel export functions
│   ├── App.jsx                 # Main app component
│   └── main.jsx                # Entry point
├── diagnose-jira.cjs           # Diagnostic script
├── create-jira-issue.js        # Standalone JIRA creator
└── package.json
```

### Data Flow

```
User Uploads Screenshot
    ↓
Groq Vision AI Analysis
    ↓
Structured Bug Ticket (JSON)
    ↓
├─→ Display in UI
├─→ Export as PDF/Excel/TXT/JSON
└─→ Create JIRA Issue (optional)
```

---

## ⚙️ Configuration

### Groq AI Models

The app uses the following Groq vision model:

```javascript
const MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
```

To change the model, edit `src/services/groqService.js`.

### JIRA Issue Types

Default issue type is "Bug". To change:

1. Open JIRA Settings
2. Modify "Issue Type" field (e.g., "Story", "Task", "Defect")
3. Must match your JIRA project exactly

### Custom Labels

Add default labels to all created issues:

1. Open JIRA Settings
2. Enter comma-separated labels (e.g., `ai-generated, ui-bug`)

---

## 🛠️ Troubleshooting

### Issue: "Failed to fetch" or CORS Error

**Cause:** Browser blocks direct JIRA API calls

**Solutions:**
1. Use the Vite dev server proxy (default for localhost)
2. Install a CORS browser extension (temporary)
3. Deploy to a server with proper CORS headers

### Issue: "403 Forbidden" — No Permission

**Cause:** Your JIRA account lacks "Create Issues" permission

**Fix:**
1. Ask your JIRA admin to grant permission
2. Or check the Project Key is correct

**Run diagnostic:**
```bash
node diagnose-jira.cjs
```

### Issue: "404 Not Found" — Project Not Found

**Cause:** Wrong Project Key

**How to find correct key:**
1. In JIRA, go to Projects → View All Projects
2. Look at the "Key" column
3. Example: `PROJ`, `QA`, `DEV`, `AI`

### Issue: PDF Export Not Working

**Cause:** Screenshot URL may be blocked

**Fix:**
- Ensure screenshot is properly loaded
- Try exporting as Excel or TXT instead

---

## 🧪 Testing

### Run Diagnostic Tool

Check your JIRA connection:

```bash
# Edit diagnose-jira.cjs with your credentials
node diagnose-jira.cjs
```

This will show:
- Connection status
- Accessible projects
- Permission status

### Create Standalone Issue

```bash
# Edit create-jira-issue.js with your config
node create-jira-issue.js
```

---

## 📦 Build for Production

```bash
npm run build
```

Output goes to `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

---

## 🚀 Deployment

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy
```

### Environment Variables for Production

Set these in your hosting platform:

```
VITE_GROQ_API_KEY=your_groq_api_key
```

**Note:** For JIRA integration in production, you may need a backend proxy due to CORS.

---

## 🎯 Use Cases

### QA Engineers
- Rapid bug documentation
- Consistent report formatting
- Direct JIRA integration

### Developers
- Quick bug reporting
- Screenshot analysis
- Environment tracking

### Product Managers
- Visual bug tracking
- Export for stakeholders
- Priority classification

---

## 🤝 Contributing

Contributions welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- [Groq](https://groq.com) for AI inference
- [React](https://reactjs.org/) for UI framework
- [Vite](https://vitejs.dev/) for build tooling
- [JIRA](https://www.atlassian.com/software/jira) for issue tracking

---

## 📧 Contact

For questions or support:
- GitHub Issues: [Report a bug](https://github.com/shobharatheesh/AITesterBlueprint_Projects/issues)
- LinkedIn: [Connect with me](https://linkedin.com/in/your-profile)

---

<p align="center">
  Made with ❤️ for QA Engineers everywhere
</p>
