import { useState } from 'react';
import UploadForm from './components/UploadForm';
import BugTicket from './components/BugTicket';
import JiraSettings, { loadJiraSettings } from './components/JiraSettings';
import { analyzeBug } from './services/groqService';
import './App.css';

export default function App() {
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [activeTab, setActiveTab] = useState('form'); // 'form' | 'ticket'

  // JIRA settings state
  const [jiraSettings, setJiraSettings] = useState(loadJiraSettings);
  const [jiraSettingsOpen, setJiraSettingsOpen] = useState(false);

  const isJiraConfigured = Boolean(
    jiraSettings?.domain && jiraSettings?.email && jiraSettings?.apiToken && jiraSettings?.projectKey
  );

  const handleAnalyze = async (formData) => {
    setIsLoading(true);
    setError(null);
    setTicket(null);

    try {
      const preview = URL.createObjectURL(formData.screenshot);
      setScreenshotPreview(preview);
      const result = await analyzeBug(formData);
      setTicket(result);
      setActiveTab('ticket');
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setTicket(null);
    setError(null);
    setScreenshotPreview(null);
    setActiveTab('form');
  };

  const handleJiraSave = (settings) => {
    setJiraSettings(settings);
  };

  return (
    <div className="app">
      {/* Background */}
      <div className="bg-gradient" />
      <div className="bg-grid" />

      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🐞</span>
            <div className="logo-text">
              <span className="logo-title">AI Bug Reporter</span>
              <span className="logo-sub">Senior QA Engineer · JIRA-Ready</span>
            </div>
          </div>
          <div className="header-right">
            <div className="header-badges">
              <span className="tech-badge">⚡ Groq</span>
              <span className="tech-badge">⚛️ React</span>
              <span className="tech-badge">🤖 Vision AI</span>
            </div>
            {/* JIRA Settings Button */}
            <button
              id="jira-settings-btn"
              className={`jira-settings-header-btn ${isJiraConfigured ? 'connected' : ''}`}
              onClick={() => setJiraSettingsOpen(true)}
              title="JIRA Integration Settings"
            >
              <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
                <path d="M16 2L2 16l14 14 14-14L16 2z" fill="currentColor" opacity="0.9" />
                <path d="M16 8l-8 8 8 8 8-8-8-8z" fill="white" opacity="0.6" />
                <path d="M16 12l-4 4 4 4 4-4-4-4z" fill="white" />
              </svg>
              {isJiraConfigured ? (
                <><span className="connected-dot" />{jiraSettings.projectKey}</>
              ) : (
                'Connect JIRA'
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="app-main">
        <div className="container">
          {/* Intro */}
          <div className="intro-section">
            <h1 className="intro-title">
              Instant <span className="gradient-text">JIRA Bug Tickets</span>
              <br />from Screenshots
            </h1>
            <p className="intro-sub">
              Upload a screenshot · Add context · Get a production-ready bug report in seconds.
            </p>
          </div>

          {/* JIRA Setup Notice (when not configured) */}
          {!isJiraConfigured && (
            <div className="jira-notice">
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                <path d="M16 2L2 16l14 14 14-14L16 2z" fill="#2684FF" />
                <path d="M16 8l-8 8 8 8 8-8-8-8z" fill="white" opacity="0.7" />
                <path d="M16 12l-4 4 4 4 4-4-4-4z" fill="white" />
              </svg>
              <span>
                Auto-create bugs in JIRA —{' '}
                <button className="notice-link" onClick={() => setJiraSettingsOpen(true)}>
                  Connect your JIRA account
                </button>
              </span>
            </div>
          )}

          {/* Tab Navigation */}
          {ticket && (
            <div className="tab-nav">
              <button
                id="tab-form"
                className={`tab-btn ${activeTab === 'form' ? 'active' : ''}`}
                onClick={() => setActiveTab('form')}
              >
                📤 New Report
              </button>
              <button
                id="tab-ticket"
                className={`tab-btn ${activeTab === 'ticket' ? 'active' : ''}`}
                onClick={() => setActiveTab('ticket')}
              >
                🐞 Bug Ticket
              </button>
            </div>
          )}

          {/* Two-column layout */}
          <div className={`layout ${ticket ? 'has-ticket' : 'no-ticket'}`}>
            {/* LEFT: Form */}
            <div className={`panel form-panel ${ticket && activeTab === 'ticket' ? 'panel-hidden' : ''}`}>
              <div className="panel-header">
                <h2 className="panel-title">
                  <span>📤</span> Report Details
                </h2>
                {ticket && (
                  <button id="new-report-btn" className="new-report-btn" onClick={handleReset}>
                    + New Report
                  </button>
                )}
              </div>
              <div className="panel-body">
                <UploadForm onAnalyze={handleAnalyze} isLoading={isLoading} />
              </div>
            </div>

            {/* RIGHT: Result area */}
            <div className={`panel result-panel ${ticket && activeTab === 'form' ? 'panel-hidden' : ''}`}>
              <div className="panel-header">
                <h2 className="panel-title">
                  <span>🎫</span> Generated JIRA Ticket
                </h2>
                {isJiraConfigured && (
                  <span className="jira-connected-badge">
                    <span className="connected-dot" />
                    {jiraSettings.projectKey}
                  </span>
                )}
              </div>
              <div className="panel-body">
                {/* Idle State */}
                {!isLoading && !ticket && !error && (
                  <div className="idle-state">
                    <div className="idle-icon">🤖</div>
                    <h3>Ready to Analyze</h3>
                    <p>
                      Upload a screenshot on the left and click{' '}
                      <strong>Generate JIRA Ticket</strong> to get started.
                    </p>
                    <ul className="feature-list">
                      <li>✅ Auto-detect severity & priority</li>
                      <li>✅ Identify module & feature</li>
                      <li>✅ One-click create in JIRA</li>
                      <li>✅ Export as .txt or .json</li>
                    </ul>
                    {!isJiraConfigured && (
                      <button
                        id="setup-jira-idle-btn"
                        className="setup-jira-btn"
                        onClick={() => setJiraSettingsOpen(true)}
                      >
                        <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
                          <path d="M16 2L2 16l14 14 14-14L16 2z" fill="currentColor" />
                          <path d="M16 8l-8 8 8 8 8-8-8-8z" fill="white" opacity="0.6" />
                          <path d="M16 12l-4 4 4 4 4-4-4-4z" fill="white" />
                        </svg>
                        Set Up JIRA Integration
                      </button>
                    )}
                  </div>
                )}

                {/* Loading State */}
                {isLoading && (
                  <div className="loading-state">
                    <div className="loading-animation">
                      <div className="pulse-ring" />
                      <div className="pulse-ring delay-1" />
                      <div className="pulse-ring delay-2" />
                      <span className="loading-bug">🐞</span>
                    </div>
                    <h3>Analyzing Screenshot...</h3>
                    <div className="loading-steps">
                      <LoadStep icon="🔍" text="Scanning UI elements" delay={0} />
                      <LoadStep icon="⚠️" text="Detecting issues" delay={0.6} />
                      <LoadStep icon="📋" text="Generating JIRA ticket" delay={1.2} />
                    </div>
                  </div>
                )}

                {/* Error State */}
                {error && !isLoading && (
                  <div className="error-state">
                    <div className="error-icon">⚠️</div>
                    <h3>Analysis Failed</h3>
                    <p className="error-message">{error}</p>
                    <button id="retry-btn" className="retry-btn" onClick={handleReset}>
                      🔄 Try Again
                    </button>
                  </div>
                )}

                {/* Ticket Result */}
                {ticket && !isLoading && !error && (
                  <BugTicket
                    ticket={ticket}
                    screenshotPreview={screenshotPreview}
                    jiraSettings={jiraSettings}
                    onOpenJiraSettings={() => setJiraSettingsOpen(true)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>
          Built with ⚛️ React + ⚡ Groq Vision AI + 🟦 JIRA REST API · AI Bug Reporter
        </p>
      </footer>

      {/* JIRA Settings Modal */}
      <JiraSettings
        isOpen={jiraSettingsOpen}
        onClose={() => setJiraSettingsOpen(false)}
        onSave={handleJiraSave}
      />
    </div>
  );
}

function LoadStep({ icon, text, delay }) {
  return (
    <div className="load-step" style={{ animationDelay: `${delay}s` }}>
      <span>{icon}</span>
      <span>{text}</span>
      <span className="load-dots">
        <span />
        <span />
        <span />
      </span>
    </div>
  );
}
