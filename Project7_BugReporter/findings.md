# 🔍 findings.md — Research & Discoveries

## Groq Vision API
- Groq supports vision via `meta-llama/llama-4-scout-17b-16e-instruct` model
- Requires base64 image encoding in the message payload
- API endpoint: https://api.groq.com/openai/v1/chat/completions
- Image passed as: `{ type: "image_url", image_url: { url: "data:image/jpeg;base64,..." } }`

## React + Vite
- Use `npm create vite@latest` for scaffolding
- Environment variables must be prefixed with `VITE_` to be accessible in the browser

## JIRA Format
- Ticket must include: Summary, Description, Steps to Reproduce, Actual/Expected Result, Environment, Severity, Priority
- Severity: Blocker > Critical > Major > Minor > Trivial
- Priority: P1 (Immediate) > P2 (High) > P3 (Normal) > P4 (Low)
