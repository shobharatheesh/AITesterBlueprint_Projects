# 📜 gemini.md — Project Constitution
## Project: AI Bug Reporter Agent (Project 7)

---

## 🎯 North Star
A React-based web application that acts as a Senior QA Engineer. Users upload a screenshot and provide issue details; the app analyzes the UI problem using an LLM (Groq API) and returns a structured, JIRA-ready bug report.

---

## 🏗️ Architecture
- **Framework:** React (Vite)
- **Language:** JavaScript
- **Styling:** Vanilla CSS
- **LLM Backend:** Groq API (vision model: meta-llama/llama-4-scout-17b-16e-instruct or llava-v1.5-7b-4096-preview)
- **API Key:** Stored in `.env` as `VITE_GROQ_API_KEY`

---

## 📦 Input Schema
```json
{
  "screenshot": "File (image/*)",
  "description": "string (optional)",
  "environment": {
    "appUrl": "string",
    "browser": "string",
    "os": "string",
    "buildVersion": "string"
  },
  "expectedBehavior": "string (optional)"
}
```

## 📤 Output Schema (JIRA Ticket)
```json
{
  "project": "string",
  "issueType": "Bug",
  "summary": "string (< 15 words)",
  "description": "string",
  "stepsToReproduce": ["string"],
  "actualResult": "string",
  "expectedResult": "string",
  "environment": {
    "appUrl": "string",
    "browser": "string",
    "os": "string",
    "buildVersion": "string"
  },
  "severity": "Blocker | Critical | Major | Minor | Trivial",
  "priority": "P1 | P2 | P3 | P4",
  "module": "string",
  "feature": "string"
}
```

---

## 🔒 Behavioral Rules
1. Return ONLY the JIRA ticket — no extra commentary
2. Never hallucinate backend logs or technical facts not visible in the screenshot
3. Summary must be under 15 words
4. Severity/Priority determined by rules in prompt.md
5. If no description provided, infer from screenshot

---

## 🔧 Architectural Invariants
- Groq API call uses vision-capable model with base64 image
- `.env` must have `VITE_GROQ_API_KEY`
- All UI components are functional React components
- No backend server — pure client-side React + Groq API calls
