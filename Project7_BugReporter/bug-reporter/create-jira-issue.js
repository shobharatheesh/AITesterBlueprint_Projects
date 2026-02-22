#!/usr/bin/env node
/**
 * Standalone script to create JIRA issue
 * Usage: node create-jira-issue.js
 */

const https = require('https');

// ==========================================
// CONFIGURATION - Fill these in
// ==========================================
const CONFIG = {
  domain: 'your-domain.atlassian.net',  // Your JIRA domain
  email: 'sraork@gmail.com',              // Your email
  apiToken: 'YOUR_API_TOKEN_HERE',        // Your API token
  projectKey: 'AI_Blueprint123',          // Project key
};

// ==========================================
// BUG TICKET DATA
// ==========================================
const bugTicket = {
  summary: 'Login button not responding on VWO platform',
  description: 'The login button on the VWO sign-in page is not responding when clicked. This prevents users from accessing their accounts.',
  stepsToReproduce: [
    'Navigate to the VWO login page',
    'Enter valid email address',
    'Enter valid password',
    'Click the "Sign In" button'
  ],
  actualResult: 'Clicking the Sign In button does not trigger any action. The page remains static and user is not logged in.',
  expectedResult: 'User should be successfully logged in and redirected to the VWO dashboard.',
  environment: {
    appUrl: 'https://app.vwo.com',
    browser: 'Chrome',
    os: 'Windows 11',
    buildVersion: 'N/A'
  },
  severity: 'Critical',
  priority: 'P1',
  module: 'Authentication',
  feature: 'Login'
};

// ==========================================
// JIRA API FUNCTIONS
// ==========================================

function buildADF(ticket) {
  const para = (text) => ({
    type: 'paragraph',
    content: [{ type: 'text', text: String(text || 'N/A') }]
  });

  const heading = (text, level = 3) => ({
    type: 'heading',
    attrs: { level },
    content: [{ type: 'text', text: text.replace(/[\u{1F000}-\u{1FFFF}]/gu, '').replace(/[\u{2600}-\u{26FF}]/gu, '').trim() }]
  });

  const bullet = (text) => ({
    type: 'listItem',
    content: [para(String(text || ''))]
  });

  return {
    type: 'doc',
    version: 1,
    content: [
      heading('Description'),
      para(ticket.description),

      heading('Steps to Reproduce'),
      {
        type: 'bulletList',
        content: ticket.stepsToReproduce.map((s, i) => bullet(`${i + 1}. ${s}`))
      },

      heading('Actual Result'),
      para(ticket.actualResult),

      heading('Expected Result'),
      para(ticket.expectedResult),

      heading('Environment'),
      {
        type: 'bulletList',
        content: [
          bullet(`App URL: ${ticket.environment?.appUrl || 'N/A'}`),
          bullet(`Browser: ${ticket.environment?.browser || 'N/A'}`),
          bullet(`OS: ${ticket.environment?.os || 'N/A'}`),
          bullet(`Build Version: ${ticket.environment?.buildVersion || 'N/A'}`)
        ]
      },

      heading('Classification'),
      {
        type: 'bulletList',
        content: [
          bullet(`Module: ${ticket.module || 'N/A'}`),
          bullet(`Feature: ${ticket.feature || 'N/A'}`),
          bullet(`Severity: ${ticket.severity}`),
          bullet(`Priority: ${ticket.priority}`)
        ]
      }
    ]
  };
}

function createIssue() {
  const payload = JSON.stringify({
    fields: {
      project: { key: CONFIG.projectKey },
      issuetype: { name: 'Bug' },
      summary: bugTicket.summary,
      description: buildADF(bugTicket)
    }
  });

  const auth = Buffer.from(`${CONFIG.email}:${CONFIG.apiToken}`).toString('base64');

  const options = {
    hostname: CONFIG.domain,
    port: 443,
    path: '/rest/api/3/issue',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Basic ${auth}`
    }
  };

  console.log('Creating JIRA issue...');
  console.log('Project:', CONFIG.projectKey);
  console.log('Summary:', bugTicket.summary);
  console.log('');

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const result = JSON.parse(data);
        console.log('✅ SUCCESS!');
        console.log('Issue Key:', result.key);
        console.log('URL:', `https://${CONFIG.domain}/browse/${result.key}`);
      } else {
        console.log('❌ ERROR:', res.statusCode);
        try {
          const error = JSON.parse(data);
          console.log('Details:', error.errorMessages || error.errors);
        } catch {
          console.log('Response:', data);
        }
      }
    });
  });

  req.on('error', (e) => {
    console.error('Request failed:', e.message);
  });

  req.write(payload);
  req.end();
}

// Run
if (CONFIG.apiToken === 'YOUR_API_TOKEN_HERE') {
  console.log('⚠️  Please edit this file and set your API token in the CONFIG section');
  console.log('Get your token at: https://id.atlassian.com/manage-profile/security/api-tokens');
  process.exit(1);
}

createIssue();
