import { useState, useEffect } from 'react';
import { testJiraConnection, checkCreatePermission, getAccessibleProjects } from '../services/jiraService';
import './JiraSettings.css';

const STORAGE_KEY = 'bug_reporter_jira_settings';

export function loadJiraSettings() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function saveJiraSettings(settings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export default function JiraSettings({ isOpen, onClose, onSave }) {
    const [domain, setDomain] = useState('');
    const [email, setEmail] = useState('');
    const [apiToken, setApiToken] = useState('');
    const [projectKey, setProjectKey] = useState('');
    const [issueTypeName, setIssueTypeName] = useState('Bug');
    const [labels, setLabels] = useState('');

    const [testStatus, setTestStatus] = useState('idle');
    const [testMessage, setTestMessage] = useState('');
    const [accessibleProjects, setAccessibleProjects] = useState([]);
    const [showToken, setShowToken] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const saved = loadJiraSettings();
            if (saved) {
                setDomain(saved.domain || '');
                setEmail(saved.email || '');
                setApiToken(saved.apiToken || '');
                setProjectKey(saved.projectKey || '');
                setIssueTypeName(saved.issueTypeName || 'Bug');
                setLabels(saved.labels || '');
            }
            setTestStatus('idle');
            setTestMessage('');
            setAccessibleProjects([]);
        }
    }, [isOpen]);

    const handleSave = () => {
        const settings = {
            domain: domain.trim(),
            email: email.trim(),
            apiToken: apiToken.trim(),
            projectKey: projectKey.trim().toUpperCase(),
            issueTypeName: issueTypeName.trim() || 'Bug',
            labels: labels.trim(),
        };
        saveJiraSettings(settings);
        onSave?.(settings);
        onClose?.();
    };

    const handleTest = async () => {
        setTestStatus('testing');
        setTestMessage('');
        setAccessibleProjects([]);
        try {
            const settings = {
                domain: domain.trim(),
                email: email.trim(),
                apiToken: apiToken.trim(),
                projectKey: projectKey.trim().toUpperCase(),
            };
            const result = await testJiraConnection(settings);
            
            // Also fetch accessible projects
            const projectsResult = await getAccessibleProjects(settings);
            if (projectsResult.success) {
                setAccessibleProjects(projectsResult.projects);
            }
            
            setTestStatus('success');
            setTestMessage(`✅ Connected as ${result.displayName} (${result.email})`);
        } catch (err) {
            setTestStatus('error');
            setTestMessage(err.message);
        }
    };

    const handleCheckPermission = async () => {
        setTestStatus('testing');
        setTestMessage('');
        try {
            const settings = {
                domain: domain.trim(),
                email: email.trim(),
                apiToken: apiToken.trim(),
                projectKey: projectKey.trim().toUpperCase(),
            };
            const result = await checkCreatePermission(settings);
            
            // If project not found, also fetch accessible projects
            if (!result.canCreate && result.details === null) {
                const projectsResult = await getAccessibleProjects(settings);
                if (projectsResult.success) {
                    setAccessibleProjects(projectsResult.projects);
                }
            }
            
            setTestStatus(result.canCreate ? 'success' : result.canCreate === null ? 'warning' : 'error');
            setTestMessage(result.message);
        } catch (err) {
            setTestStatus('error');
            setTestMessage(err.message);
        }
    };

    const canSave = domain && email && apiToken && projectKey;
    const canTest = domain && email && apiToken;

    if (!isOpen) return null;

    return (
        <div className="jira-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
            <div className="jira-modal">
                <div className="jira-modal-header">
                    <div className="jira-modal-title">
                        <JiraLogo />
                        <span>JIRA Integration</span>
                    </div>
                    <button className="jira-modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="jira-modal-body">
                    <p className="jira-intro">
                        Connect to your Atlassian JIRA Cloud to create issues directly.
                    </p>

                    {/* Domain */}
                    <div className="jira-field">
                        <label htmlFor="jira-domain">JIRA Domain <span className="required">*</span></label>
                        <div className="jira-input-wrapper">
                            <span className="input-prefix">https://</span>
                            <input
                                id="jira-domain"
                                type="text"
                                value={domain}
                                onChange={(e) => setDomain(e.target.value.replace(/^https?:\/\//, '').replace(/\/+$/, ''))}
                                placeholder="yourcompany.atlassian.net"
                            />
                        </div>
                        <span className="field-hint">Your JIRA Cloud domain</span>
                    </div>

                    {/* Email */}
                    <div className="jira-field">
                        <label htmlFor="jira-email">Email <span className="required">*</span></label>
                        <input
                            id="jira-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@company.com"
                        />
                        <span className="field-hint">Your Atlassian account email</span>
                    </div>

                    {/* API Token */}
                    <div className="jira-field">
                        <label htmlFor="jira-token">API Token <span className="required">*</span></label>
                        <div className="jira-input-row">
                            <input
                                id="jira-token"
                                type={showToken ? 'text' : 'password'}
                                value={apiToken}
                                onChange={(e) => setApiToken(e.target.value)}
                                placeholder="ATATT..."
                            />
                            <button
                                type="button"
                                className="toggle-btn"
                                onClick={() => setShowToken((v) => !v)}
                            >
                                {showToken ? '🙈' : '👁️'}
                            </button>
                        </div>
                        <span className="field-hint">
                            Create at{' '}
                            <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noreferrer">
                                id.atlassian.com → Security → API tokens
                            </a>
                        </span>
                    </div>

                    {/* Project Key */}
                    <div className="jira-field">
                        <label htmlFor="jira-project">
                            Project Key <span className="required">*</span>
                            <span className="field-help" title="How to find your Project Key">❓</span>
                        </label>
                        <input
                            id="jira-project"
                            type="text"
                            value={projectKey}
                            onChange={(e) => setProjectKey(e.target.value.toUpperCase())}
                            placeholder="e.g., PROJ, QA, DEV"
                        />
                        <span className="field-hint">
                            Must match exactly. See instructions below ↓
                        </span>
                    </div>

                    {/* Issue Type */}
                    <div className="jira-field">
                        <label htmlFor="jira-issuetype">Issue Type</label>
                        <input
                            id="jira-issuetype"
                            type="text"
                            value={issueTypeName}
                            onChange={(e) => setIssueTypeName(e.target.value)}
                            placeholder="Bug"
                        />
                        <span className="field-hint">Default: Bug</span>
                    </div>

                    {/* Labels */}
                    <div className="jira-field">
                        <label htmlFor="jira-labels">Labels</label>
                        <input
                            id="jira-labels"
                            type="text"
                            value={labels}
                            onChange={(e) => setLabels(e.target.value)}
                            placeholder="ai-generated, ui-bug"
                        />
                        <span className="field-hint">Comma-separated (optional)</span>
                    </div>

                    {/* Test Result */}
                    {testStatus !== 'idle' && (
                        <div className={`jira-test-result ${testStatus}`}>
                            <span className="test-icon">
                                {testStatus === 'testing' ? '⏳' : testStatus === 'success' ? '✅' : testStatus === 'warning' ? '⚠️' : '❌'}
                            </span>
                            <span className="test-text" style={{ whiteSpace: 'pre-line' }}>
                                {testMessage}
                            </span>
                        </div>
                    )}

                    {/* Accessible Projects List */}
                    {accessibleProjects.length > 0 && (
                        <div className="projects-list">
                            <strong>📋 Your Accessible Projects:</strong>
                            <ul>
                                {accessibleProjects.slice(0, 8).map(p => (
                                    <li key={p.key}>
                                        <code>{p.key}</code> — {p.name}
                                        <button 
                                            className="use-project-btn"
                                            onClick={() => setProjectKey(p.key)}
                                        >
                                            Use This
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Permission Check Button */}
                    {canTest && projectKey && (
                        <button 
                            className="check-permission-link"
                            onClick={handleCheckPermission}
                            disabled={testStatus === 'testing'}
                        >
                            🔍 Check Permission for {projectKey}
                        </button>
                    )}

                    {/* Instructions Box */}
                    <div className="jira-instructions">
                        <strong>📖 How to Find Your Project Key:</strong>
                        <ol>
                            <li>Open JIRA in your browser</li>
                            <li>Go to the project where you want to create issues</li>
                            <li>Look at the URL: <code>.../browse/XXX-123</code></li>
                            <li><strong>XXX</strong> is your Project Key (e.g., <code>PROJ</code>, <code>QA</code>)</li>
                        </ol>
                        <p className="instruction-note">
                            Or go to <strong>Projects → View All Projects</strong> and look at the "Key" column.
                        </p>
                    </div>
                </div>

                <div className="jira-modal-footer">
                    <button
                        className="jira-btn secondary"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="jira-btn test"
                        onClick={handleTest}
                        disabled={!canTest || testStatus === 'testing'}
                    >
                        {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
                    </button>
                    <button
                        className="jira-btn primary"
                        onClick={handleSave}
                        disabled={!canSave}
                    >
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
}

function JiraLogo() {
    return (
        <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
            <path d="M16 2L2 16l14 14 14-14L16 2z" fill="#2684FF" />
            <path d="M16 8l-8 8 8 8 8-8-8-8z" fill="white" opacity="0.7" />
            <path d="M16 12l-4 4 4 4 4-4-4-4z" fill="white" />
        </svg>
    );
}
