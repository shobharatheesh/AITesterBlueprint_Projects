import { useState, useCallback } from 'react';
import './UploadForm.css';

const BROWSERS = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera', 'Other'];
const OS_LIST = ['Windows 11', 'Windows 10', 'macOS', 'Ubuntu', 'iOS', 'Android', 'Other'];

export default function UploadForm({ onAnalyze, isLoading }) {
    const [screenshot, setScreenshot] = useState(null);
    const [preview, setPreview] = useState(null);
    const [description, setDescription] = useState('');
    const [expectedBehavior, setExpectedBehavior] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [showApiKey, setShowApiKey] = useState(false);
    const [environment, setEnvironment] = useState({
        appUrl: '',
        browser: '',
        os: '',
        buildVersion: '',
    });
    const [dragOver, setDragOver] = useState(false);

    const handleFile = useCallback((file) => {
        if (!file || !file.type.startsWith('image/')) return;
        setScreenshot(file);
        const url = URL.createObjectURL(file);
        setPreview(url);
    }, []);

    const handleDrop = useCallback(
        (e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            handleFile(file);
        },
        [handleFile]
    );

    const handleFileInput = (e) => handleFile(e.target.files[0]);

    const handleEnvChange = (field, value) => {
        setEnvironment((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!screenshot) return;
        if (!apiKey.trim()) {
            alert('Please enter your Groq API Key.');
            return;
        }
        onAnalyze({ screenshot, description, environment, expectedBehavior, apiKey: apiKey.trim() });
    };

    const clearScreenshot = () => {
        setScreenshot(null);
        setPreview(null);
    };

    return (
        <form className="upload-form" onSubmit={handleSubmit}>
            {/* API Key */}
            <div className="form-section">
                <label className="form-label">
                    <span className="label-icon">🔑</span> Groq API Key
                    <span className="required">*</span>
                </label>
                <div className="api-key-wrapper">
                    <input
                        id="api-key-input"
                        type={showApiKey ? 'text' : 'password'}
                        className="form-input"
                        placeholder="gsk_..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        required
                    />
                    <button
                        type="button"
                        className="toggle-key-btn"
                        onClick={() => setShowApiKey((v) => !v)}
                        title={showApiKey ? 'Hide key' : 'Show key'}
                    >
                        {showApiKey ? '🙈' : '👁️'}
                    </button>
                </div>
                <p className="field-hint">
                    Get your key at{' '}
                    <a href="https://console.groq.com" target="_blank" rel="noreferrer">
                        console.groq.com
                    </a>
                </p>
            </div>

            {/* Screenshot Upload */}
            <div className="form-section">
                <label className="form-label">
                    <span className="label-icon">📸</span> Screenshot
                    <span className="required">*</span>
                </label>
                {!preview ? (
                    <div
                        id="drop-zone"
                        className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('file-input').click()}
                    >
                        <div className="drop-icon">🖼️</div>
                        <p className="drop-text">Drop screenshot here or <span className="drop-link">click to browse</span></p>
                        <p className="drop-sub">PNG, JPG, WebP supported</p>
                        <input
                            id="file-input"
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleFileInput}
                        />
                    </div>
                ) : (
                    <div className="preview-wrapper">
                        <img src={preview} alt="Screenshot preview" className="screenshot-preview" />
                        <button type="button" className="remove-btn" onClick={clearScreenshot}>✕ Remove</button>
                    </div>
                )}
            </div>

            {/* Issue Description */}
            <div className="form-section">
                <label className="form-label" htmlFor="description-input">
                    <span className="label-icon">📝</span> Issue Description
                    <span className="optional">(optional)</span>
                </label>
                <textarea
                    id="description-input"
                    className="form-textarea"
                    placeholder="Describe the bug in your own words..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                />
            </div>

            {/* Expected Behavior */}
            <div className="form-section">
                <label className="form-label" htmlFor="expected-input">
                    <span className="label-icon">✅</span> Expected Behavior
                    <span className="optional">(optional)</span>
                </label>
                <textarea
                    id="expected-input"
                    className="form-textarea"
                    placeholder="What should have happened?"
                    value={expectedBehavior}
                    onChange={(e) => setExpectedBehavior(e.target.value)}
                    rows={2}
                />
            </div>

            {/* Environment */}
            <div className="form-section">
                <label className="form-label">
                    <span className="label-icon">🌍</span> Environment Details
                    <span className="optional">(optional)</span>
                </label>
                <div className="env-grid">
                    <div className="env-field">
                        <label htmlFor="app-url" className="env-label">App URL</label>
                        <input
                            id="app-url"
                            type="url"
                            className="form-input"
                            placeholder="https://app.example.com"
                            value={environment.appUrl}
                            onChange={(e) => handleEnvChange('appUrl', e.target.value)}
                        />
                    </div>
                    <div className="env-field">
                        <label htmlFor="build-version" className="env-label">Build Version</label>
                        <input
                            id="build-version"
                            type="text"
                            className="form-input"
                            placeholder="v1.2.3"
                            value={environment.buildVersion}
                            onChange={(e) => handleEnvChange('buildVersion', e.target.value)}
                        />
                    </div>
                    <div className="env-field">
                        <label htmlFor="browser-select" className="env-label">Browser</label>
                        <select
                            id="browser-select"
                            className="form-select"
                            value={environment.browser}
                            onChange={(e) => handleEnvChange('browser', e.target.value)}
                        >
                            <option value="">Select Browser</option>
                            {BROWSERS.map((b) => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                        </select>
                    </div>
                    <div className="env-field">
                        <label htmlFor="os-select" className="env-label">Operating System</label>
                        <select
                            id="os-select"
                            className="form-select"
                            value={environment.os}
                            onChange={(e) => handleEnvChange('os', e.target.value)}
                        >
                            <option value="">Select OS</option>
                            {OS_LIST.map((o) => (
                                <option key={o} value={o}>{o}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Submit */}
            <button
                id="analyze-btn"
                type="submit"
                className={`analyze-btn ${isLoading ? 'loading' : ''}`}
                disabled={!screenshot || isLoading}
            >
                {isLoading ? (
                    <>
                        <span className="spinner" />
                        Analyzing Bug...
                    </>
                ) : (
                    <>
                        <span>🔍</span> Generate JIRA Ticket
                    </>
                )}
            </button>
        </form>
    );
}
