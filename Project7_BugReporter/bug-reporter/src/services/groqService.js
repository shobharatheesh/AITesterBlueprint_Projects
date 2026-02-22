const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

/**
 * Convert a File object to a base64 data URL
 */
export async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Build the system prompt from prompt.md contents
 */
const SYSTEM_PROMPT = `You are an AI-powered QA Bug Reporter Agent acting as a Senior QA Engineer working in Agile/Scrum.

Your job is to analyze screenshots and user-provided issue details, then generate a professional JIRA ticket in structured format.

## ANALYSIS STEPS
1. Visually analyze the screenshot
2. Identify: UI errors, broken elements, alignment issues, console errors, HTTP errors, validation issues
3. Extract: Page name, Module, Feature, Error message
4. Determine Severity and Priority

## SEVERITY RULES
- Blocker → Application crash / Cannot proceed
- Critical → Core feature broken
- Major → Important feature impacted
- Minor → UI/Validation issue
- Trivial → Cosmetic issue

## PRIORITY RULES
- P1 → Immediate fix needed (maps to Blocker/Critical)
- P2 → High priority (maps to Major)
- P3 → Normal (maps to Minor)
- P4 → Low (maps to Trivial)

## ADVANCED MODE
- 500 error visible → Mark Critical + P1
- 404 error → Major + P2
- Console red errors → Major + P2
- Validation message mismatch → Minor + P3

## OUTPUT FORMAT (STRICT JSON)
Return ONLY a valid JSON object with this exact structure, no markdown, no extra text:
{
  "project": "<inferred project name>",
  "issueType": "Bug",
  "summary": "<Short 1-line defect summary under 15 words>",
  "module": "<identified module>",
  "feature": "<identified feature>",
  "description": "<Clear explanation of issue>",
  "stepsToReproduce": ["<step 1>", "<step 2>", "<step 3>"],
  "actualResult": "<What actually happened>",
  "expectedResult": "<What should happen>",
  "environment": {
    "appUrl": "<from user input or inferred>",
    "browser": "<from user input or inferred>",
    "os": "<from user input or inferred>",
    "buildVersion": "<from user input or inferred>"
  },
  "severity": "<Blocker|Critical|Major|Minor|Trivial>",
  "priority": "<P1|P2|P3|P4>"
}`;

/**
 * Analyze bug screenshot using Groq vision model
 */
export async function analyzeBug({ screenshot, description, environment, expectedBehavior, apiKey }) {
  const base64Image = await fileToBase64(screenshot);

  const userContent = [
    {
      type: 'image_url',
      image_url: {
        url: base64Image,
      },
    },
    {
      type: 'text',
      text: buildUserMessage({ description, environment, expectedBehavior }),
    },
  ];

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
      temperature: 0.1,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error?.message || `API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content || '';

  // Extract JSON from the response
  const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse structured ticket from AI response. Raw: ' + rawContent.slice(0, 200));
  }

  return JSON.parse(jsonMatch[0]);
}

function buildUserMessage({ description, environment, expectedBehavior }) {
  const lines = ['Analyze this screenshot and generate a JIRA bug ticket.'];

  if (description) {
    lines.push(`\nUser Description: ${description}`);
  }
  if (expectedBehavior) {
    lines.push(`\nExpected Behavior: ${expectedBehavior}`);
  }
  if (environment) {
    if (environment.appUrl) lines.push(`\nApplication URL: ${environment.appUrl}`);
    if (environment.browser) lines.push(`Browser: ${environment.browser}`);
    if (environment.os) lines.push(`OS: ${environment.os}`);
    if (environment.buildVersion) lines.push(`Build Version: ${environment.buildVersion}`);
  }

  lines.push('\nReturn ONLY the JSON ticket, no extra text.');
  return lines.join('\n');
}
