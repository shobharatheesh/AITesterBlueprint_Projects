import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LayoutDashboard,
    Settings as SettingsIcon,
    History as HistoryIcon,
    Ticket,
    Shield,
    Send,
    Loader2,
    Zap,
    FileText,
    Copy,
    Download,
    Globe,
    Database,
    CheckCircle,
    AlertCircle,
    User,
    Key,
    Link as LinkIcon,
    Cpu,
    Flame,
    FileUp,
    ExternalLink,
    Save,
    Trash2,
    X
} from 'lucide-react';

// --- Type Definitions ---
interface SettingsData {
    jiraBaseUrl: string;
    jiraEmail: string;
    jiraToken: string;
    groqKey: string;
    groqModel: string;
    ollamaUrl: string;
    ollamaModel: string;
    useLocalLlm: boolean;
}

const App = () => {
    const [currentPage, setCurrentPage] = useState<'dashboard' | 'settings' | 'history'>('dashboard');
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState<SettingsData>({
        jiraBaseUrl: '',
        jiraEmail: '',
        jiraToken: '',
        groqKey: '',
        groqModel: 'llama-3.3-70b-versatile',
        ollamaUrl: 'http://localhost:11434',
        ollamaModel: 'llama3',
        useLocalLlm: false,
    });

    // Global Status
    const [jiraStatus, setJiraStatus] = useState<'connected' | 'error' | 'unconfigured'>('unconfigured');
    const [llmStatus, setLlmStatus] = useState<'connected' | 'error' | 'unconfigured'>('unconfigured');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await axios.get('/api/settings');
            setSettings(res.data);
            validateConnections(res.data);
        } catch (err) {
            console.error('Failed to fetch settings');
        }
    };

    const validateConnections = async (s: SettingsData) => {
        if (s.jiraBaseUrl && s.jiraToken) {
            axios.post('/api/jira/test', { baseUrl: s.jiraBaseUrl, email: s.jiraEmail, token: s.jiraToken })
                .then(() => setJiraStatus('connected'))
                .catch(() => setJiraStatus('error'));
        }
        if (s.useLocalLlm) {
            axios.post('/api/llm/test-ollama', { baseUrl: s.ollamaUrl })
                .then(() => setLlmStatus('connected'))
                .catch(() => setLlmStatus('error'));
        } else if (s.groqKey) {
            axios.post('/api/llm/test-groq', { apiKey: s.groqKey })
                .then(() => setLlmStatus('connected'))
                .catch(() => setLlmStatus('error'));
        }
    };

    return (
        <div className="flex h-screen bg-[#020617] text-slate-200 font-['Inter'] overflow-hidden">
            {/* Sidebar Navigation */}
            <aside className="w-72 bg-slate-950/50 border-r border-white/5 flex flex-col items-center py-8 z-50">
                <div className="flex items-center gap-3 mb-12 px-6 w-full">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Ticket className="text-white w-5 h-5" />
                    </div>
                    <h1 className="text-lg font-bold tracking-tight text-white">B.L.A.S.T.</h1>
                </div>

                <nav className="flex-1 w-full px-4 space-y-2">
                    <NavItem
                        icon={LayoutDashboard}
                        label="Generate"
                        active={currentPage === 'dashboard'}
                        onClick={() => {
                            setCurrentPage('dashboard');
                            fetchSettings();
                        }}
                    />
                    <NavItem
                        icon={HistoryIcon}
                        label="History"
                        active={currentPage === 'history'}
                        onClick={() => setCurrentPage('history')}
                    />
                    <NavItem
                        icon={SettingsIcon}
                        label="Settings"
                        active={currentPage === 'settings'}
                        onClick={() => setCurrentPage('settings')}
                    />
                </nav>

                <div className="w-full px-4 mt-auto">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3">
                        <StatusIndicator label="JIRA" status={jiraStatus} />
                        <StatusIndicator label="LLM" status={llmStatus} />
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto relative bg-black/20">
                {/* Background Decorative Elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full -mr-64 -mt-64" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full -ml-32 -mb-32" />

                <div className="max-w-6xl mx-auto p-10 h-full flex flex-col">
                    {currentPage === 'dashboard' && <DashboardPage settings={settings} />}
                    {currentPage === 'settings' && <SettingsPage settings={settings} onSave={fetchSettings} />}
                    {currentPage === 'history' && <HistoryPage />}
                </div>
            </main>
        </div>
    );
};

// --- Components ---

const NavItem = ({ icon: Icon, label, active, onClick }: any) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 font-semibold' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
            }`}
    >
        <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} />
        <span>{label}</span>
    </button>
);

const StatusIndicator = ({ label, status }: { label: string, status: 'connected' | 'error' | 'unconfigured' }) => (
    <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">{label}</span>
        <div className="flex items-center gap-1.5 font-sans">
            <div className={`w-1.5 h-1.5 rounded-full ${status === 'connected' ? 'bg-emerald-500 animate-pulse' :
                status === 'error' ? 'bg-rose-500' : 'bg-slate-700'
                }`} />
            <span className={`text-[10px] font-bold ${status === 'connected' ? 'text-emerald-500' :
                status === 'error' ? 'text-rose-500' : 'text-slate-500'
                }`}>
                {status.toUpperCase()}
            </span>
        </div>
    </div>
);

// --- Pages ---

const DashboardPage = ({ settings }: { settings: SettingsData }) => {
    const [ticketId, setTicketId] = useState('');
    const [ticketData, setTicketData] = useState<any>(null);
    const [testPlan, setTestPlan] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'fetching' | 'analyzing' | 'done'>('idle');

    const fetchTicket = async () => {
        if (!ticketId) return;
        setLoading(true);
        setStatus('fetching');
        try {
            const res = await axios.post('/api/jira/fetch', { ticketId });
            setTicketData(res.data);
            setStatus('idle');
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to fetch ticket. Check JIRA settings.');
            setStatus('idle');
        } finally {
            setLoading(false);
        }
    };

    const generatePlan = async () => {
        setLoading(true);
        setStatus('analyzing');
        try {
            const res = await axios.post('/api/testplan/generate', { ticketId });
            setTestPlan(res.data.testPlan);
            setStatus('done');
        } catch (err: any) {
            alert(err.response?.data?.error || 'Generation failed.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!testPlan) return;
        navigator.clipboard.writeText(testPlan);
        alert('Strategy copied to clipboard!');
    };

    const exportToPDF = async () => {
        if (!testPlan) return;
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        const margin = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const contentWidth = pageWidth - (margin * 2);
        let cursorY = 20;

        // Header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(37, 99, 235); // Blue-600
        doc.text('B.L.A.S.T. Test Strategy', margin, cursorY);
        cursorY += 12;

        // Metadata
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // Slate-500
        doc.text(`Key: ${ticketData?.key}`, margin, cursorY);
        doc.text(`Status: ${ticketData?.status}`, margin + 50, cursorY);
        cursorY += 6;
        doc.text(`Generated: ${new Date().toLocaleString()}`, margin, cursorY);
        cursorY += 8;

        // Title
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42); // Slate-900
        const titleLines = doc.splitTextToSize(ticketData?.summary || '', contentWidth);
        doc.text(titleLines, margin, cursorY);
        cursorY += (titleLines.length * 7) + 5;

        doc.setDrawColor(226, 232, 240); // Slate-200
        doc.line(margin, cursorY, pageWidth - margin, cursorY);
        cursorY += 12;

        // Content
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(51, 65, 85); // Slate-700

        const splitText = doc.splitTextToSize(testPlan, contentWidth);

        splitText.forEach((line: string) => {
            if (cursorY > pageHeight - margin) {
                doc.addPage();
                cursorY = 20;
            }
            doc.text(line, margin, cursorY);
            cursorY += 7; // Line height
        });

        // Page Numbers
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }

        doc.save(`Strategy_${ticketData?.key || 'Draft'}.pdf`);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col h-full">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Generate Strategy</h2>
                    <p className="text-slate-500 text-sm italic">Harness LLM power to decompose JIRA requirements into test architectures.</p>
                </div>
                <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-2xl px-5 py-2.5 backdrop-blur-md">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-slate-400">Mode: <span className="text-blue-400">{settings.useLocalLlm ? 'Ollama' : 'Groq API'}</span></span>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8 flex-1 overflow-hidden">
                {/* Left: Controls */}
                <div className="col-span-12 lg:col-span-4 space-y-6 overflow-y-auto pr-2">
                    <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 space-y-6 shadow-xl shadow-black/40">
                        <div className="space-y-4">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Connect Ticket</label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={ticketId}
                                    onChange={(e) => setTicketId(e.target.value)}
                                    onKeyPress={(k) => k.key === 'Enter' && fetchTicket()}
                                    placeholder="PROJ-123"
                                    className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500/30 text-lg font-mono text-white transition-all shadow-inner"
                                />
                                <button
                                    onClick={fetchTicket}
                                    disabled={loading}
                                    className="absolute right-2 top-2 bottom-2 aspect-square bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl transition-all shadow-lg flex items-center justify-center active:scale-95"
                                >
                                    {loading && status === 'fetching' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {ticketData && (
                            <div className="animate-in zoom-in-95 duration-500 space-y-6 pt-4 border-t border-white/5">
                                <div className="p-6 bg-blue-500/[0.03] border border-blue-500/20 rounded-2xl space-y-4 shadow-inner">
                                    <div className="flex justify-between items-center ">
                                        <div className="px-3 py-1 bg-blue-500/10 rounded-full text-[10px] font-bold text-blue-400 border border-blue-500/30 uppercase tracking-wider">
                                            {ticketData.key}
                                        </div>
                                        <span className="text-xs text-slate-500 font-medium">{ticketData.status}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-white leading-snug">{ticketData.summary}</h3>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {ticketData.labels.map((l: string) => (
                                            <span key={l} className="text-[10px] font-bold bg-white/5 text-slate-400 px-2 py-1 rounded-md border border-white/5">#{l}</span>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={generatePlan}
                                    disabled={loading}
                                    className="w-full h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white font-bold flex items-center justify-center gap-3 shadow-2xl hover:shadow-blue-500/30 transition-all hover:-translate-y-0.5"
                                >
                                    {loading && status === 'analyzing' ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Designing Strategy...
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="w-5 h-5 text-yellow-400" />
                                            Generate Test Plan
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Preview */}
                <div className="col-span-12 lg:col-span-8 flex flex-col min-h-[500px]">
                    <div className="bg-slate-900/40 border border-white/10 rounded-[40px] flex flex-col overflow-hidden shadow-2xl shadow-black/80 flex-1">
                        <div className="px-8 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                <span className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">Strategy Output</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={copyToClipboard}
                                    disabled={!testPlan}
                                    className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors disabled:opacity-20"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={exportToPDF}
                                    disabled={!testPlan}
                                    className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors disabled:opacity-20"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 font-['JetBrains_Mono'] text-sm leading-relaxed text-slate-300">
                            {testPlan ? (
                                <div className="animate-in fade-in duration-1000">
                                    {testPlan.split('\n').map((l, i) => (
                                        <div key={i} className="flex gap-6 group">
                                            <span className="w-8 text-slate-800 text-right select-none group-hover:text-blue-900 transition-colors uppercase font-bold text-[10px] mt-1">{i + 1}</span>
                                            <span className="flex-1">{l || '\u00A0'}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-700 space-y-6">
                                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/5 shadow-inner">
                                        <FileText className="w-8 h-8 opacity-20" />
                                    </div>
                                    <p className="text-center text-balance max-w-xs text-xs font-semibold tracking-wide uppercase opacity-40">
                                        Connect a JIRA issue to begin structural decomposition
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SettingsPage = ({ settings, onSave }: { settings: SettingsData, onSave: () => void }) => {
    const [localSettings, setLocalSettings] = useState(settings);
    const [saving, setSaving] = useState(false);
    const [testResult, setTestResult] = useState<any>(null);
    const [templateSections, setTemplateSections] = useState<any[]>([]);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Attempt to load current template sections
        axios.get('/api/settings').then(res => {
            const stored = localStorage.getItem('last_sections');
            // This is a bit loose, ideally fetching from backend
        });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.post('/api/settings/save', localSettings);
            onSave();
            alert('Settings persisted successfully.');
        } catch (err) {
            alert('Failed to save configuration.');
        } finally {
            setSaving(false);
        }
    };

    const handleTemplateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('template', file);

        setSaving(true);
        try {
            const res = await axios.post('/api/templates/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setTemplateSections(res.data.sections);
            alert('Template uploaded and mapped successfully!');
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to upload template');
        } finally {
            setSaving(false);
        }
    };

    const testJira = async () => {
        setTestResult({ type: 'jira', loading: true });
        try {
            const res = await axios.post('/api/jira/test', {
                baseUrl: localSettings.jiraBaseUrl,
                email: localSettings.jiraEmail,
                token: localSettings.jiraToken
            });
            setTestResult({ type: 'jira', success: true, user: res.data.user });
        } catch (err: any) {
            setTestResult({ type: 'jira', success: false, error: err.response?.data?.error || err.message });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Configuration</h2>
                    <p className="text-slate-500 text-sm font-medium">B.L.A.S.T. Module connectivity and security parameters.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3.5 rounded-2xl flex items-center gap-3 shadow-xl shadow-blue-900/40 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Apply Changes
                </button>
            </div>

            <div className="grid grid-cols-12 gap-10">
                {/* JIRA Settings */}
                <div className="col-span-12 lg:col-span-6 space-y-6">
                    <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 shadow-2xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                                <LinkIcon className="text-blue-500 w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-white">JIRA Integration</h3>
                        </div>

                        <div className="space-y-6">
                            <SettingsField
                                label="Base URL"
                                placeholder="https://company.atlassian.net"
                                value={localSettings.jiraBaseUrl}
                                onChange={(v) => setLocalSettings({ ...localSettings, jiraBaseUrl: v })}
                            />
                            <SettingsField
                                label="Email Address"
                                placeholder="qa-lead@agent.ai"
                                value={localSettings.jiraEmail}
                                onChange={(v) => setLocalSettings({ ...localSettings, jiraEmail: v })}
                            />
                            <SettingsField
                                label="API Token"
                                placeholder="••••••••••••••••"
                                type="password"
                                value={localSettings.jiraToken}
                                onChange={(v) => setLocalSettings({ ...localSettings, jiraToken: v })}
                            />

                            <div className="pt-4 space-y-4">
                                <button
                                    onClick={testJira}
                                    className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl text-xs font-bold text-slate-300 flex items-center justify-center gap-3 transition-all hover:bg-white/10 active:scale-95"
                                >
                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                    Validate Credentials
                                </button>

                                {testResult?.type === 'jira' && (
                                    <div className={`p-4 rounded-xl text-xs font-bold border flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${testResult.loading ? 'bg-slate-900/50 border-white/5 text-slate-400' :
                                        testResult.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                            'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                        }`}>
                                        {testResult.loading ? <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> :
                                            testResult.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                        {testResult.loading ? 'Handshaking...' :
                                            testResult.success ? `Connected as: ${testResult.user}` : `Error: ${testResult.error}`}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* LLM Settings */}
                <div className="col-span-12 lg:col-span-6 space-y-6">
                    <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 shadow-2xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                                <Cpu className="text-indigo-500 w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Intelligence Profile</h3>
                        </div>

                        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-white/5 mb-8">
                            <button
                                onClick={() => setLocalSettings({ ...localSettings, useLocalLlm: false })}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${!localSettings.useLocalLlm ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/20' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                <Globe className="w-4 h-4" /> Groq API
                            </button>
                            <button
                                onClick={() => setLocalSettings({ ...localSettings, useLocalLlm: true })}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${localSettings.useLocalLlm ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/20' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                <Database className="w-4 h-4" /> Ollama
                            </button>
                        </div>

                        {localSettings.useLocalLlm ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                                <SettingsField
                                    label="Local Endpoint"
                                    value={localSettings.ollamaUrl}
                                    onChange={(v) => setLocalSettings({ ...localSettings, ollamaUrl: v })}
                                />
                                <SettingsField
                                    label="Local Model"
                                    value={localSettings.ollamaModel}
                                    onChange={(v) => setLocalSettings({ ...localSettings, ollamaModel: v })}
                                />
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                                <SettingsField
                                    label="Groq API Key"
                                    type="password"
                                    placeholder="gsk_••••••••"
                                    value={localSettings.groqKey}
                                    onChange={(v) => setLocalSettings({ ...localSettings, groqKey: v })}
                                />
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-widest">Cloud Model</label>
                                    <select
                                        value={localSettings.groqModel}
                                        onChange={(e) => setLocalSettings({ ...localSettings, groqModel: e.target.value })}
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 outline-none text-white appearance-none cursor-pointer focus:border-indigo-500/30 font-medium"
                                    >
                                        <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Recommended)</option>
                                        <option value="llama-3.1-70b-versatile">llama-3.1-70b-versatile (Powerful)</option>
                                        <option value="llama-3.1-8b-instant">llama-3.1-8b-instant (Fastest)</option>
                                        <option value="mixtral-8x7b-32768">mixtral-8x7b-32768 (Balance)</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        <div className="mt-8 p-6 bg-amber-500/[0.02] border border-amber-500/10 rounded-2xl flex items-start gap-4 shadow-inner">
                            <Flame className="w-5 h-5 text-amber-500 mt-1 shrink-0" />
                            <div>
                                <h4 className="text-xs font-bold text-amber-500/80 mb-1 uppercase tracking-wide">Data Policy</h4>
                                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">JIRA credentials are used exclusively to fetch structured ADF data for LLM context. No private keys are logged in system archives.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Templates Page */}
                <div className="col-span-12">
                    <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-10 shadow-2xl space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                                    <FileUp className="text-emerald-500 w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Strategy Frameworks</h3>
                                    <p className="text-xs text-slate-500 font-medium uppercase mt-0.5 tracking-tight">PDF Structure Extraction Module</p>
                                </div>
                            </div>
                            <div className="px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-[10px] font-bold text-emerald-400">DEFAULT ACTIVE</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-white/5 rounded-[40px] p-12 flex flex-col items-center justify-center gap-6 hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] transition-all cursor-pointer group shadow-inner"
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".pdf"
                                    onChange={handleTemplateUpload}
                                />
                                <div className="relative">
                                    <div className="absolute inset-0 bg-emerald-500/20 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative w-20 h-20 bg-emerald-500/10 rounded-[30px] flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                                        <FileUp className="w-8 h-8 text-emerald-500" />
                                    </div>
                                </div>
                                <div className="text-center space-y-2">
                                    <h4 className="text-lg font-bold text-white">Deploy New Template</h4>
                                    <p className="text-xs text-slate-500 max-w-[240px] leading-relaxed mx-auto font-medium lowercase">upload a strategy pdf and we will automatically map its sections</p>
                                </div>
                            </div>

                            <div className="bg-slate-950 p-8 rounded-[40px] border border-white/5 shadow-inner space-y-6">
                                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                    <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                                        {templateSections.length > 0 ? 'Mapped Structure' : 'System Default'}
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-600">
                                        {templateSections.length > 0 ? `${templateSections.length} Sections` : 'v1.2.0-std'}
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {(templateSections.length > 0 ? templateSections : [
                                        { heading: 'Overview' },
                                        { heading: 'Test Scenarios' },
                                        { heading: 'Edge Cases' },
                                        { heading: 'Bug Reports' },
                                        { heading: 'Conclusion' }
                                    ]).map((s: any) => (
                                        <div key={s.heading} className="flex items-center gap-3 px-4 py-2.5 bg-white/5 rounded-xl border border-white/5 group transition-all hover:bg-white/10">
                                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 opacity-60 group-hover:opacity-100" />
                                            <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 uppercase tracking-widest">{s.heading}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const HistoryPage = () => (
    <div className="h-full flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500 text-slate-200">
        <div className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center border border-white/5 shadow-inner">
            <HistoryIcon className="w-10 h-10 opacity-20 text-blue-500" />
        </div>
        <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold tracking-tight text-white">Archive Under Maintenance</h3>
            <p className="text-slate-500 text-sm max-w-xs font-medium leading-relaxed italic">System history is currently being migrated to the new SQLite architecture. Check back soon for full search capabilities.</p>
        </div>
    </div>
);

const SettingsField = ({ label, placeholder, value, onChange, type = 'text' }: { label: string, placeholder?: string, value: string, onChange: (v: string) => void, type?: string }) => (
    <div className="space-y-2.5">
        <label className="text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-widest">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-blue-500/30 text-white font-medium transition-all shadow-inner"
        />
    </div>
);

export default App;
