#!/usr/bin/env node
/**
 * JIRA Diagnostic Tool
 * Run this to troubleshoot connection issues
 */

const https = require('https');

// ==========================================
// CONFIGURATION - EDIT THESE 4 VALUES
// ==========================================
const CONFIG = {
  // Your JIRA domain (e.g., "mycompany.atlassian.net")
  // Find it in your JIRA URL: https://XXXX.atlassian.net
  domain: 'your-domain.atlassian.net',
  
  // Your Atlassian account email
  email: 'sraork@gmail.com',
  
  // Your API Token (get from https://id.atlassian.com/manage-profile/security/api-tokens)
  // It looks like: ATATT3xFfGF0iVvgNmC6sRrsC2uGqF... (very long)
  apiToken: 'YOUR_API_TOKEN_HERE',
  
  // The Project Key you're trying to create issues in
  // Example: "PROJ", "QA", "DEV", "AI" (usually 2-10 uppercase letters)
  projectKey: 'AI_Blueprint123',
};

// ==========================================
// DIAGNOSTIC FUNCTIONS
// ==========================================

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${CONFIG.email}:${CONFIG.apiToken}`).toString('base64');
    
    const options = {
      hostname: CONFIG.domain,
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${auth}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (e) => reject(e));
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runDiagnostics() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔍 JIRA DIAGNOSTIC TOOL');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Test 1: Basic Connection
  console.log('TEST 1: Checking basic connection...');
  try {
    const myself = await makeRequest('/rest/api/3/myself');
    if (myself.status === 200) {
      console.log('✅ Connected as:', myself.data.displayName);
      console.log('   Email:', myself.data.emailAddress);
      console.log('   Account ID:', myself.data.accountId);
    } else {
      console.log('❌ Failed to connect. Status:', myself.status);
      console.log('   Error:', myself.data);
      return;
    }
  } catch (e) {
    console.log('❌ Connection error:', e.message);
    return;
  }

  console.log('\n───────────────────────────────────────────────────────────\n');

  // Test 2: List Accessible Projects
  console.log('TEST 2: Listing your accessible projects...');
  try {
    const projects = await makeRequest('/rest/api/3/project?maxResults=50');
    if (projects.status === 200 && Array.isArray(projects.data)) {
      console.log(`✅ Found ${projects.data.length} accessible project(s):\n`);
      console.log('   KEY          | NAME');
      console.log('   ─────────────┼──────────────────────────');
      projects.data.forEach(p => {
        const marker = p.key === CONFIG.projectKey ? ' ← [TARGET]' : '';
        console.log(`   ${p.key.padEnd(12)} | ${p.name}${marker}`);
      });
      
      const targetProject = projects.data.find(p => p.key === CONFIG.projectKey);
      if (!targetProject) {
        console.log('\n⚠️  WARNING: Your target project "' + CONFIG.projectKey + '" is NOT in the list!');
        console.log('   Possible issues:');
        console.log('   • Wrong project key (check case - PROJ vs proj)');
        console.log('   • You don\'t have access to that project');
        console.log('   • The project has been deleted or archived');
      } else {
        console.log('\n✅ Target project "' + CONFIG.projectKey + '" found: ' + targetProject.name);
      }
    } else {
      console.log('❌ Failed to get projects. Status:', projects.status);
    }
  } catch (e) {
    console.log('❌ Error:', e.message);
  }

  console.log('\n───────────────────────────────────────────────────────────\n');

  // Test 3: Check Specific Project
  console.log('TEST 3: Checking specific project "' + CONFIG.projectKey + '"...');
  try {
    const project = await makeRequest(`/rest/api/3/project/${CONFIG.projectKey}`);
    if (project.status === 200) {
      console.log('✅ Project exists:', project.data.name);
      console.log('   Key:', project.data.key);
      console.log('   ID:', project.data.id);
      console.log('   URL:', `https://${CONFIG.domain}/browse/${project.data.key}`);
    } else if (project.status === 404) {
      console.log('❌ Project NOT FOUND (404)');
      console.log('   The project key "' + CONFIG.projectKey + '" does not exist.');
    } else {
      console.log('❌ Status:', project.status, project.data);
    }
  } catch (e) {
    console.log('❌ Error:', e.message);
  }

  console.log('\n───────────────────────────────────────────────────────────\n');

  // Test 4: Check Permissions
  console.log('TEST 4: Checking permissions for "' + CONFIG.projectKey + '"...');
  try {
    const perms = await makeRequest(`/rest/api/3/mypermissions?projectKey=${CONFIG.projectKey}`);
    if (perms.status === 200) {
      const createPerm = perms.data.permissions?.CREATE_ISSUES;
      if (createPerm) {
        if (createPerm.havePermission) {
          console.log('✅ You HAVE "Create Issues" permission!');
        } else {
          console.log('❌ You DO NOT have "Create Issues" permission');
          console.log('   Permission ID:', createPerm.id);
          console.log('   Required:', createPerm.permission);
        }
      } else {
        console.log('⚠️  Could not find CREATE_ISSUES permission in response');
      }
    } else if (perms.status === 400) {
      console.log('❌ Bad Request (400) - Project "' + CONFIG.projectKey + '" may not exist');
    } else if (perms.status === 403) {
      console.log('❌ Forbidden (403) - No permission to check permissions');
    } else {
      console.log('❌ Status:', perms.status, perms.data);
    }
  } catch (e) {
    console.log('❌ Error:', e.message);
  }

  console.log('\n═══════════════════════════════════════════════════════════\n');
  console.log('NEXT STEPS:');
  console.log('1. Check if your target project is in the list above');
  console.log('2. If not, ask your JIRA admin for the correct project key');
  console.log('3. Verify you have "Create Issues" permission in that project');
  console.log('═══════════════════════════════════════════════════════════');
}

// Run
if (CONFIG.apiToken === 'YOUR_API_TOKEN_HERE') {
  console.log('⚠️  Please edit this file and set your API token');
  console.log('Get your token at: https://id.atlassian.com/manage-profile/security/api-tokens');
  process.exit(1);
}

runDiagnostics();
