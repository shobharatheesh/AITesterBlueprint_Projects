/**
 * jiraService.js
 * Creates JIRA issues via REST API v3.
 */

// ── Common headers for all JIRA API calls ─────────────────
function jiraHeaders(email, apiToken) {
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${btoa(`${email}:${apiToken}`)}`,
    }
}

// ── Determine API URL ────────────────────────────────────
function getApiUrl(domain, path) {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isDev) {
        return `/jira-proxy/${cleanDomain}${path}`;
    }
    
    return `https://${cleanDomain}${path}`;
}

// ── Human-readable error interpretation ───────────────────
function interpretJiraError(status, data, context = {}) {
    if (data?.errors && Object.keys(data.errors).length > 0) {
        const fieldErrors = Object.entries(data.errors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(' | ')
        return fieldErrors;
    }
    if (data?.errorMessages?.length > 0) {
        return data.errorMessages.join(' | ')
    }

    switch (status) {
        case 400:
            return `Project "${context.projectKey}" not found or invalid request.`;
        case 401:
            return `Invalid email or API token. Generate a new one at id.atlassian.com`;
        case 403:
            return `No permission to create issues in "${context.projectKey}". Ask your JIRA admin.`;
        case 404:
            return `Project "${context.projectKey}" not found. Check the Project Key.`;
        default:
            return `Error ${status}: ${data?.error || 'Unknown error'}`;
    }
}

/**
 * Get user's accessible projects
 */
export async function getAccessibleProjects(settings) {
    const { email, apiToken, domain } = settings;
    
    const url = getApiUrl(domain, '/rest/api/3/project?maxResults=50');
    
    try {
        const response = await fetch(url, {
            headers: jiraHeaders(email, apiToken),
        });
        
        if (!response.ok) {
            return { success: false, error: `HTTP ${response.status}` };
        }
        
        const projects = await response.json();
        return { 
            success: true, 
            projects: projects.map(p => ({ 
                key: p.key, 
                name: p.name,
                id: p.id
            }))
        };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

/**
 * Check create permission using mypermissions endpoint
 */
export async function checkCreatePermission(settings) {
    const { email, apiToken, domain, projectKey } = settings;
    
    if (!email || !apiToken || !domain || !projectKey) {
        return { 
            canCreate: false, 
            message: 'Missing credentials or project key',
            details: null
        };
    }
    
    // First, try to get the project to verify it exists
    const projectUrl = getApiUrl(domain, `/rest/api/3/project/${projectKey}`);
    
    try {
        const projectResponse = await fetch(projectUrl, {
            headers: jiraHeaders(email, apiToken),
        });
        
        if (projectResponse.status === 404) {
            // Project doesn't exist - suggest getting valid projects
            const projectsResult = await getAccessibleProjects(settings);
            let suggestion = '';
            
            if (projectsResult.success && projectsResult.projects.length > 0) {
                const projectList = projectsResult.projects
                    .slice(0, 5)
                    .map(p => `• ${p.key} (${p.name})`)
                    .join('\n');
                suggestion = `\n\n📋 Projects you have access to:\n${projectList}`;
            }
            
            return {
                canCreate: false,
                message: `❌ Project "${projectKey}" NOT FOUND\n\nThe project key you entered doesn't exist or you don't have access to it.${suggestion}\n\n💡 How to find your Project Key:\n1. Go to JIRA in your browser\n2. Open the project where you want to create issues\n3. Look at the URL: https://yourdomain.atlassian.net/browse/XXX-123\n4. XXX is your Project Key (e.g., PROJ, QA, DEV)`,
                details: null
            };
        }
        
        if (!projectResponse.ok) {
            return {
                canCreate: false,
                message: `❌ Cannot access project: ${projectResponse.status}`,
                details: null
            };
        }
        
        const projectData = await projectResponse.json();
        
        // Now check permissions
        const permUrl = getApiUrl(domain, `/rest/api/3/mypermissions?projectKey=${projectKey}`);
        const permResponse = await fetch(permUrl, {
            headers: jiraHeaders(email, apiToken),
        });
        
        if (!permResponse.ok) {
            // Project exists but can't check permissions - try to create a test issue
            return {
                canCreate: null, // unknown
                message: `⚠️ Project "${projectKey}" (${projectData.name}) exists, but cannot verify permissions.\n\nYou can try creating an issue to test.`,
                details: { project: projectData }
            };
        }
        
        const permData = await permResponse.json();
        const permissions = permData.permissions || {};
        const createPerm = permissions.CREATE_ISSUES;
        
        if (createPerm?.havePermission) {
            return {
                canCreate: true,
                message: `✅ SUCCESS!\n\nYou have permission to create issues in:\n• Project: ${projectData.name}\n• Key: ${projectKey}\n• ID: ${projectData.id}`,
                details: { project: projectData, permissions }
            };
        } else {
            return {
                canCreate: false,
                message: `❌ NO PERMISSION\n\nProject "${projectKey}" (${projectData.name}) exists, but you DON'T have "Create Issues" permission.\n\n💡 Ask your JIRA admin to:\n1. Go to Project Settings → Permissions\n2. Add you to a role with "Create Issues" permission\n3. Or add you to the "Developers" or "Administrators" group`,
                details: { project: projectData, permissions }
            };
        }
    } catch (err) {
        return {
            canCreate: false,
            message: `Error: ${err.message}`,
            details: null
        };
    }
}

/**
 * Build JIRA issue payload
 */
export function buildJiraPayload(ticket, settings) {
    const { projectKey, issueTypeName, labels } = settings;

    const payload = {
        fields: {
            project: { key: projectKey },
            issuetype: { name: issueTypeName || 'Bug' },
            summary: ticket.summary?.slice(0, 255) || 'Bug Report',
            description: buildADF(ticket),
        },
    };

    if (labels && labels.trim()) {
        payload.fields.labels = labels
            .split(',')
            .map((l) => l.trim())
            .filter(Boolean);
    }

    return payload;
}

/**
 * Create a JIRA issue
 */
export async function createJiraIssue(ticket, settings) {
    const { email, apiToken, domain, projectKey, issueTypeName } = settings;

    if (!email || !apiToken || !domain || !projectKey) {
        throw new Error('Missing JIRA credentials. Open Settings to configure.');
    }

    if (!email.includes('@')) {
        throw new Error('Invalid email format. Use your Atlassian account email.');
    }

    const payload = buildJiraPayload(ticket, settings);
    const url = getApiUrl(domain, '/rest/api/3/issue');

    let response;
    try {
        response = await fetch(url, {
            method: 'POST',
            headers: jiraHeaders(email, apiToken),
            body: JSON.stringify(payload),
        });
    } catch (networkErr) {
        throw new Error(`Network error: ${networkErr.message}. Check your connection.`);
    }

    const data = await response.json().catch(() => ({}));
    
    const context = { email, projectKey, issueType: issueTypeName || 'Bug' };

    if (!response.ok) {
        const errorMsg = interpretJiraError(response.status, data, context);
        
        // Add specific guidance based on error
        if (response.status === 404) {
            const projectsResult = await getAccessibleProjects(settings);
            if (projectsResult.success && projectsResult.projects.length > 0) {
                const projectList = projectsResult.projects
                    .slice(0, 5)
                    .map(p => `• ${p.key} (${p.name})`)
                    .join('\n');
                throw new Error(`${errorMsg}\n\n📋 Projects you can access:\n${projectList}\n\nUpdate your Project Key in Settings.`);
            }
        }
        
        throw new Error(errorMsg);
    }

    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return {
        issueKey: data.key,
        issueId: data.id,
        url: `https://${cleanDomain}/browse/${data.key}`,
    };
}

/**
 * Test JIRA connection
 */
export async function testJiraConnection(settings) {
    const { email, apiToken, domain, projectKey } = settings;

    if (!domain || !email || !apiToken) {
        throw new Error('Fill in Domain, Email, and API Token.');
    }

    const url = getApiUrl(domain, '/rest/api/3/myself');

    const response = await fetch(url, {
        headers: jiraHeaders(email, apiToken),
    });

    if (!response.ok) {
        const context = { email, projectKey: projectKey || 'N/A' };
        throw new Error(interpretJiraError(response.status, await response.json().catch(() => ({})), context));
    }

    const data = await response.json();
    
    return { 
        displayName: data.displayName, 
        accountId: data.accountId, 
        email: data.emailAddress
    };
}

// ── Helpers ──────────────────────────────────────────────

function safeText(str) {
    if (!str) return 'N/A';
    return str.replace(/[\u{1F000}-\u{1FFFF}]/gu, '').replace(/[\u{2600}-\u{26FF}]/gu, '').trim() || str;
}

function buildADF(ticket) {
    const para = (text) => ({
        type: 'paragraph',
        content: [{ type: 'text', text: String(text || 'N/A') }],
    });

    const heading = (text, level = 3) => ({
        type: 'heading',
        attrs: { level },
        content: [{ type: 'text', text: safeText(text) }],
    });

    const bullet = (text) => ({
        type: 'listItem',
        content: [para(String(text || ''))],
    });

    const stepsItems = (ticket.stepsToReproduce || []).map((s, i) =>
        bullet(`${i + 1}. ${s}`)
    );

    return {
        type: 'doc',
        version: 1,
        content: [
            heading('Description'),
            para(ticket.description),

            heading('Steps to Reproduce'),
            stepsItems.length > 0
                ? { type: 'bulletList', content: stepsItems }
                : para('Not provided'),

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
                    bullet(`Build Version: ${ticket.environment?.buildVersion || 'N/A'}`),
                ],
            },

            heading('Classification'),
            {
                type: 'bulletList',
                content: [
                    bullet(`Module: ${ticket.module || 'N/A'}`),
                    bullet(`Feature: ${ticket.feature || 'N/A'}`),
                    bullet(`Severity: ${ticket.severity}`),
                    bullet(`Priority: ${ticket.priority}`),
                ],
            },

            {
                type: 'paragraph',
                content: [
                    { type: 'text', text: 'Generated by AI Bug Reporter', marks: [{ type: 'em' }] },
                ],
            },
        ],
    };
}
