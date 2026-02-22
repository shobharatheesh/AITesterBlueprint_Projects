import { useState } from 'react';
import { createJiraIssue, checkCreatePermission, getAccessibleProjects } from '../services/jiraService';
import { exportToPDF, exportToExcel } from '../services/exportService';
import './BugTicket.css';

const SEVERITY_CONFIG = {
    Blocker: { color: '#dc2626', bg: 'rgba(220, 38, 38, 0.15)', icon: '🔴', label: 'BLOCKER' },
    Critical: { color: '#ea580c', bg: 'rgba(234, 88, 12, 0.15)', icon: '🟠', label: 'CRITICAL' },
    Major: { color: '#d97706', bg: 'rgba(217, 119, 6, 0.15)', icon: '🟡', label: 'MAJOR' },
    Minor: { color: '#2563eb', bg: 'rgba(37, 99, 235, 0.15)', icon: '🔵', label: 'MINOR' },
    Trivial: { color: '#6b7280', bg: 'rgba(107, 114, 128, 0.15)', icon: '⚪', label: 'TRIVIAL' },
};

const PRIORITY_CONFIG = {
    P1: { color: '#dc2626', label: 'P1 - Immediate', icon: '⬆️⬆️' },
    P2: { color: '#ea580c', label: 'P2 - High', icon: '⬆️' },
    P3: { color: '#2563eb', label: 'P3 - Normal', icon: '➡️' },
    P4: { color: '#6b7280', label: 'P4 - Low', icon: '⬇️' },
};

function Badge({ type, value }) {
    const config = type === 'severity' ? SEVERITY_CONFIG[value] : PRIORITY_CONFIG[value];
    if (!config) return <span className="badge">{value}</span>;
    return (
        <span
            className="badge"
            style={{ color: config.color, background: config.bg, borderColor: config.color + '40' }}
        >
            {config.icon} {config.label || value}
        </span>
    );
}

function TicketRow({ label, value, children }) {
    return (
        <div className="ticket-row">
            <span className="ticket-label">{label}</span>
            <span className="ticket-value">{children || value || <em className="not-specified">Not specified</em>}</span>
        </div>
    );
}

function StepsList({ steps }) {
    if (!steps || steps.length === 0) return <em className="not-specified">Not provided</em>;
    return (
        <ol className="steps-list">
            {steps.map((step, i) => (
                <li key={i}>{step}</li>
            ))}
        </ol>
    );
}

export default function BugTicket({ ticket, screenshotPreview, jiraSettings, onOpenJiraSettings }) {
    const [copied, setCopied] = useState(false);
    const [showRaw, setShowRaw] = useState(false);
    const [jiraStatus, setJiraStatus] = useState('idle');
    const [jiraResult, setJiraResult] = useState(null);
    const [jiraError, setJiraError] = useState('');
    const [permissionChecked, setPermissionChecked] = useState(false);
    const [accessibleProjects, setAccessibleProjects] = useState([]);

    const isJiraConfigured = jiraSettings?.domain && jiraSettings?.email && jiraSettings?.apiToken && jiraSettings?.projectKey;

    const formatTicketAsText = () => {
        return `🐞 JIRA BUG TICKET
═══════════════════════════════════════

Project:      ${ticket.project || 'N/A'}
Issue Type:   ${ticket.issueType}
Summary:      ${ticket.summary}
Module:       ${ticket.module || 'N/A'}
Feature:      ${ticket.feature || 'N/A'}
Severity:     ${ticket.severity}
Priority:     ${ticket.priority}

Description:
${ticket.description}

Steps to Reproduce:
${(ticket.stepsToReproduce || []).map((s, i) => `${i + 1}. ${s}`).join('\n')}

Actual Result:
${ticket.actualResult}

Expected Result:
${ticket.expectedResult}

Environment:
  - App URL:       ${ticket.environment?.appUrl || 'N/A'}
  - Browser:       ${ticket.environment?.browser || 'N/A'}
  - OS:            ${ticket.environment?.os || 'N/A'}
  - Build Version: ${ticket.environment?.buildVersion || 'N/A'}

Attachments: Screenshot Provided
`;
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(formatTicketAsText());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleExport = () => {
        const blob = new Blob([formatTicketAsText()], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BUG_${ticket.summary?.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40) || 'ticket'}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleExportJSON = () => {
        const blob = new Blob([JSON.stringify(ticket, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BUG_${ticket.summary?.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40) || 'ticket'}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const [isExporting, setIsExporting] = useState(false);

    const handleExportPDF = async () => {
        setIsExporting(true);
        try {
            await exportToPDF(ticket, screenshotPreview);
        } catch (err) {
            console.error('PDF export error:', err);
            alert('Failed to export PDF. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleExportExcel = () => {
        try {
            exportToExcel(ticket, screenshotPreview);
        } catch (err) {
            console.error('Excel export error:', err);
            alert('Failed to export Excel. Please try again.');
        }
    };

    const handleCreateInJira = async () => {
        if (!isJiraConfigured) {
            onOpenJiraSettings?.();
            return;
        }
        setJiraStatus('loading');
        setJiraError('');
        setJiraResult(null);
        setPermissionChecked(false);
        
        try {
            const result = await createJiraIssue(ticket, jiraSettings);
            setJiraResult(result);
            setJiraStatus('success');
        } catch (err) {
            setJiraError(err.message);
            setJiraStatus('error');
        }
    };

    const handleRetry = async () => {
        setJiraStatus('loading');
        setJiraError('');
        setAccessibleProjects([]);
        
        try {
            // Re-check permissions first
            const permResult = await checkCreatePermission(jiraSettings);
            setPermissionChecked(true);
            
            if (permResult.canCreate) {
                // Permission is good now, try creating the issue
                const result = await createJiraIssue(ticket, jiraSettings);
                setJiraResult(result);
                setJiraStatus('success');
            } else {
                // Still no permission - get accessible projects to help user
                const projectsResult = await getAccessibleProjects(jiraSettings);
                if (projectsResult.success && projectsResult.projects.length > 0) {
                    setAccessibleProjects(projectsResult.projects);
                }
                
                setJiraError(`${permResult.message}\n\n⚠️ If admin just changed permissions, try:` +
                    `\n1. Wait 1-2 minutes for JIRA to update` +
                    `\n2. Click "⚙️ Settings" → "Test Connection"` +
                    `\n3. Or try a different project from the list below`);
                setJiraStatus('error');
            }
        } catch (err) {
            // Check if it's a project not found error
            if (err.message?.includes('not found') || err.message?.includes('404')) {
                const projectsResult = await getAccessibleProjects(jiraSettings);
                if (projectsResult.success && projectsResult.projects.length > 0) {
                    setAccessibleProjects(projectsResult.projects);
                }
            }
            setJiraError(err.message);
            setJiraStatus('error');
        }
    };

    const severityConf = SEVERITY_CONFIG[ticket.severity] || {};

    return (
        <div className="bug-ticket">
            {/* Ticket Header */}
            <div className="ticket-header" style={{ borderLeftColor: severityConf.color || '#6366f1' }}>
                <div className="ticket-header-top">
                    <div className="ticket-type-badge">
                        <span className="bug-icon">🐞</span>
                        <span>Bug</span>
                    </div>
                    <div className="ticket-badges">
                        <Badge type="severity" value={ticket.severity} />
                        <Badge type="priority" value={ticket.priority} />
                    </div>
                </div>
                <h2 className="ticket-summary">{ticket.summary}</h2>
                <div className="ticket-meta">
                    {ticket.project && <span className="meta-chip">📁 {ticket.project}</span>}
                    {ticket.module && <span className="meta-chip">🔧 {ticket.module}</span>}
                    {ticket.feature && <span className="meta-chip">⚙️ {ticket.feature}</span>}
                </div>
            </div>

            {/* Ticket Body */}
            <div className="ticket-body">
                <div className="ticket-section">
                    <h3 className="section-title">📋 Description</h3>
                    <p className="ticket-description">{ticket.description}</p>
                </div>

                <div className="ticket-section">
                    <h3 className="section-title">🔁 Steps to Reproduce</h3>
                    <StepsList steps={ticket.stepsToReproduce} />
                </div>

                <div className="results-grid">
                    <div className="ticket-section result-card actual">
                        <h3 className="section-title">❌ Actual Result</h3>
                        <p>{ticket.actualResult || <em className="not-specified">Not provided</em>}</p>
                    </div>
                    <div className="ticket-section result-card expected">
                        <h3 className="section-title">✅ Expected Result</h3>
                        <p>{ticket.expectedResult || <em className="not-specified">Not provided</em>}</p>
                    </div>
                </div>

                <div className="ticket-section">
                    <h3 className="section-title">🌍 Environment</h3>
                    <div className="env-table">
                        <TicketRow label="App URL" value={ticket.environment?.appUrl} />
                        <TicketRow label="Browser" value={ticket.environment?.browser} />
                        <TicketRow label="OS" value={ticket.environment?.os} />
                        <TicketRow label="Build Version" value={ticket.environment?.buildVersion} />
                    </div>
                </div>

                {screenshotPreview && (
                    <div className="ticket-section">
                        <h3 className="section-title">📎 Attachment</h3>
                        <div className="attachment-wrapper">
                            <img src={screenshotPreview} alt="Bug screenshot" className="attachment-img" />
                            <span className="attachment-label">screenshot.png</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="ticket-actions">
                <button
                    id="create-jira-btn"
                    className={`action-btn jira-create-btn jira-status-${jiraStatus}`}
                    onClick={handleCreateInJira}
                    disabled={jiraStatus === 'loading' || jiraStatus === 'success'}
                    title={isJiraConfigured ? `Create issue in ${jiraSettings.projectKey}` : 'Configure JIRA first'}
                >
                    {jiraStatus === 'loading' && (
                        <><span className="btn-spinner" /> Creating issue...</>
                    )}
                    {jiraStatus === 'success' && (
                        <>✅ Created in JIRA</>
                    )}
                    {(jiraStatus === 'idle' || jiraStatus === 'error') && (
                        <>
                            <JiraIcon />
                            {isJiraConfigured ? `Create in ${jiraSettings.projectKey}` : 'Connect JIRA First'}
                        </>
                    )}
                </button>

                <button id="copy-btn" className="action-btn primary" onClick={handleCopy}>
                    {copied ? '✅ Copied!' : '📋 Copy'}
                </button>
                <button id="export-txt-btn" className="action-btn secondary" onClick={handleExport}>
                    📄 .txt
                </button>
                <button id="export-json-btn" className="action-btn secondary" onClick={handleExportJSON}>
                    📦 JSON
                </button>
                <button 
                    id="export-pdf-btn" 
                    className="action-btn secondary" 
                    onClick={handleExportPDF}
                    disabled={isExporting}
                >
                    {isExporting ? '⏳ PDF...' : '📕 PDF'}
                </button>
                <button 
                    id="export-excel-btn" 
                    className="action-btn secondary" 
                    onClick={handleExportExcel}
                >
                    📊 Excel
                </button>
                <button
                    id="raw-toggle-btn"
                    className="action-btn ghost"
                    onClick={() => setShowRaw((v) => !v)}
                >
                    {showRaw ? '🙈' : '👁️'}
                </button>
            </div>

            {/* JIRA Status Banners */}
            {jiraStatus === 'success' && jiraResult && (
                <div className="jira-banner success-banner">
                    <span className="banner-icon">🎉</span>
                    <div className="banner-content">
                        <strong>Issue created in JIRA!</strong>
                        <span>Your bug ticket is live on the board.</span>
                    </div>
                    <a
                        href={jiraResult.url}
                        target="_blank"
                        rel="noreferrer"
                        className="jira-issue-link"
                    >
                        {jiraResult.issueKey} ↗
                    </a>
                </div>
            )}

            {jiraStatus === 'error' && (
                <div className="jira-banner error-banner">
                    <span className="banner-icon">⚠️</span>
                    <div className="banner-content">
                        <strong>JIRA Error</strong>
                        <span style={{ whiteSpace: 'pre-line' }}>{jiraError}</span>
                        {permissionChecked && (
                            <span style={{ marginTop: '0.5rem', display: 'block', color: '#fbbf24' }}>
                                ℹ️ Permission was re-checked after admin changes
                            </span>
                        )}
                        {accessibleProjects.length > 0 && (
                            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '6px' }}>
                                <strong style={{ color: '#818cf8' }}>📋 Your Accessible Projects:</strong>
                                <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.2rem', fontSize: '0.8rem' }}>
                                    {accessibleProjects.slice(0, 6).map(p => (
                                        <li key={p.key} style={{ marginBottom: '0.25rem' }}>
                                            <code style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '0.1rem 0.3rem', borderRadius: '3px', color: '#a5b4fc' }}>{p.key}</code>
                                            {' '}— {p.name}
                                        </li>
                                    ))}
                                </ul>
                                <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                                    Try using one of these Project Keys in Settings
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="banner-actions">
                        <button className="banner-action-btn" onClick={() => onOpenJiraSettings?.()}>
                            ⚙️ Settings
                        </button>
                        <button className="banner-action-btn retry" onClick={handleRetry}>
                            🔄 Retry
                        </button>
                    </div>
                </div>
            )}

            {showRaw && (
                <div className="raw-json">
                    <pre>{JSON.stringify(ticket, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}

function JiraIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
            <path d="M16 2L2 16l14 14 14-14L16 2z" fill="currentColor" opacity="0.9" />
            <path d="M16 8l-8 8 8 8 8-8-8-8z" fill="white" opacity="0.6" />
            <path d="M16 12l-4 4 4 4 4-4-4-4z" fill="white" />
        </svg>
    );
}
