import React, { useState, useRef } from 'react';
import { Wand2, History, Settings, Database, Server, FileText, Save, Send, ShieldCheck, ChevronRight, Search, Loader2, Copy, Download, Table } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import * as XLSX from 'xlsx';

const App = () => {
    const [activeView, setActiveView] = useState('Settings');
    const [activeTab, setActiveTab] = useState('JIRA');
    const [loadingStates, setLoadingStates] = useState({
        test: false,
        save: false,
        fetch: false,
        generate: false
    });
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

    // JIRA Settings State
    const [jiraConfig, setJiraConfig] = useState({
        url: '',
        email: '',
        token: ''
    });

    // LLM Settings State
    const [llmConfig, setLlmConfig] = useState({
        provider: 'Groq (Cloud)',
        modelId: 'llama-3.3-70b-versatile',
        apiKey: ''
    });

    const handleTestConnection = async () => {
        if (!jiraConfig.url || !jiraConfig.email || !jiraConfig.token) {
            setStatusMessage({ type: 'error', text: 'Please fill in all JIRA fields' });
            return;
        }

        setLoadingStates(prev => ({ ...prev, test: true }));
        setStatusMessage({ type: 'info', text: 'Testing connection...' });

        try {
            const response = await axios.post('/api/config/test-jira', jiraConfig);
            if (response.data.status === 'success') {
                setStatusMessage({ type: 'success', text: response.data.message });
            } else {
                setStatusMessage({ type: 'error', text: response.data.message });
            }
        } catch (error) {
            setStatusMessage({ type: 'error', text: 'Failed to reach server' });
        } finally {
            setLoadingStates(prev => ({ ...prev, test: false }));
        }
    };

    const handleTestLLM = async () => {
        if (llmConfig.provider !== 'Ollama (Local)' && !llmConfig.apiKey) {
            setStatusMessage({ type: 'error', text: 'Please enter an API Key for Cloud providers' });
            return;
        }

        setLoadingStates(prev => ({ ...prev, test: true }));
        setStatusMessage({ type: 'info', text: 'Verifying AI Brain...' });

        try {
            const response = await axios.post('/api/config/test-llm', llmConfig);
            if (response.data.status === 'success') {
                setStatusMessage({ type: 'success', text: response.data.message });
            } else {
                setStatusMessage({ type: 'error', text: response.data.message });
            }
        } catch (error) {
            setStatusMessage({ type: 'error', text: 'Failed to verify LLM setup' });
        } finally {
            setLoadingStates(prev => ({ ...prev, test: false }));
        }
    };

    const handleSaveSettings = async () => {
        setLoadingStates(prev => ({ ...prev, save: true }));
        try {
            await axios.post('/api/config/save-settings', { jira: jiraConfig, llm: llmConfig });
            setStatusMessage({ type: 'success', text: 'Settings saved successfully' });
        } catch (error) {
            setStatusMessage({ type: 'error', text: 'Failed to save settings' });
        } finally {
            setLoadingStates(prev => ({ ...prev, save: false }));
        }
    };

    // Generation State
    const [ticketKey, setTicketKey] = useState('');
    const [fetchedTicket, setFetchedTicket] = useState(null);
    const [generatedPlan, setGeneratedPlan] = useState('');
    const planRef = useRef(null);

    const handleCopyMarkdown = () => {
        if (!generatedPlan) return;
        navigator.clipboard.writeText(generatedPlan);
        setStatusMessage({ type: 'success', text: 'Markdown copied to clipboard!' });
        setTimeout(() => setStatusMessage({ type: '', text: '' }), 3000);
    };

    const handleExportPDF = async () => {
        if (!planRef.current) return;

        setLoadingStates(prev => ({ ...prev, generate: true }));
        setStatusMessage({ type: 'info', text: 'Generating professional PDF report...' });

        try {
            const canvas = await html2canvas(planRef.current, {
                scale: 3, // Higher scale for ultra-sharp text
                useCORS: true,
                backgroundColor: '#0B1527',
                windowWidth: 1200, // Fixed width for consistent alignment
                onclone: (cloned) => {
                    const el = cloned.getElementById('pdf-content');
                    if (el) {
                        el.style.width = '1100px';
                        el.style.padding = '40px';
                    }
                }
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;

            const ratio = pdfWidth / imgWidth;
            const imgHeightInPdf = imgHeight * ratio;
            const totalPages = Math.ceil(imgHeightInPdf / pdfHeight);

            for (let i = 0; i < totalPages; i++) {
                if (i > 0) pdf.addPage();
                // Shift image up by page height for each new page
                pdf.addImage(imgData, 'PNG', 0, -(i * pdfHeight), pdfWidth, imgHeightInPdf);
            }

            pdf.save(`TestPlan_${fetchedTicket?.key || 'Export'}.pdf`);
            setStatusMessage({ type: 'success', text: 'Professional PDF Downloaded!' });
        } catch (error) {
            console.error('PDF Error:', error);
            setStatusMessage({ type: 'error', text: 'PDF failed. Try Copy Markdown.' });
        } finally {
            setLoadingStates(prev => ({ ...prev, generate: false }));
        }
    };

    const handleExportExcel = () => {
        if (!generatedPlan || !planRef.current) return;

        try {
            const table = planRef.current.querySelector('table');
            if (!table) {
                setStatusMessage({ type: 'error', text: 'No table found for Excel export. Regenerate please.' });
                return;
            }

            const wb = XLSX.utils.table_to_book(table);
            XLSX.writeFile(wb, `TestPlan_${fetchedTicket?.key || 'Export'}.xlsx`);
            setStatusMessage({ type: 'success', text: 'Excel Report Downloaded!' });
        } catch (error) {
            console.error('Excel Error:', error);
            setStatusMessage({ type: 'error', text: 'Excel export failed.' });
        }
    };

    const handleFetchTicket = async () => {
        if (!ticketKey) {
            setStatusMessage({ type: 'error', text: 'Please enter a JIRA Ticket Key or URL' });
            return;
        }

        // Extract key if it's a URL
        let finalKey = ticketKey;
        if (ticketKey.includes('/browse/')) {
            finalKey = ticketKey.split('/browse/')[1].split('?')[0];
        }

        setLoadingStates(prev => ({ ...prev, fetch: true }));
        setStatusMessage({ type: 'info', text: 'Fetching ticket details...' });

        try {
            const response = await axios.post('/api/testplan/fetch', {
                ticket_key: finalKey,
                config: jiraConfig
            });
            setFetchedTicket(response.data);
            setStatusMessage({ type: 'success', text: `Fetched: ${response.data.summary}` });
        } catch (error) {
            const msg = error.response?.data?.detail || 'Failed to fetch ticket. Check JIRA settings.';
            setStatusMessage({ type: 'error', text: msg });
        } finally {
            setLoadingStates(prev => ({ ...prev, fetch: false }));
        }
    };

    const handleGenerateAI = async () => {
        if (!fetchedTicket) return;

        setLoadingStates(prev => ({ ...prev, generate: true }));
        setStatusMessage({ type: 'info', text: 'AI is architecting your test plan...' });

        try {
            const response = await axios.post('/api/testplan/generate', {
                ticket_data: fetchedTicket,
                template: "", // Optional template support
                config: llmConfig
            });
            setGeneratedPlan(response.data.plan);
            setStatusMessage({ type: 'success', text: 'Test Plan Generated!' });
        } catch (error) {
            setStatusMessage({ type: 'error', text: 'AI Generation failed. Check LLM settings.' });
        } finally {
            setLoadingStates(prev => ({ ...prev, generate: false }));
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900 font-sans antialiased">
            {/* Sidebar */}
            <aside className="w-64 bg-[#0B1527] flex flex-col pt-8 px-4 shrink-0 h-full">
                <div className="flex items-center gap-3 mb-10 px-2 text-white">
                    <div className="p-2 bg-blue-600/20 rounded-lg">
                        <Database className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight uppercase tracking-tight">Test Plan AI</h1>
                        <p className="text-[10px] text-slate-400 font-medium">Intelligent Test Plan Generator</p>
                    </div>
                </div>

                <nav className="space-y-2 flex-1">
                    <div
                        onClick={() => setActiveView('Generate')}
                        className={`sidebar-item ${activeView === 'Generate' ? 'sidebar-item-active' : ''}`}
                    >
                        <Wand2 className="w-5 h-5" />
                        <span className="font-medium">Generate</span>
                    </div>
                    <div
                        onClick={() => setActiveView('History')}
                        className={`sidebar-item ${activeView === 'History' ? 'sidebar-item-active' : ''}`}
                    >
                        <History className="w-5 h-5" />
                        <span className="font-medium">History</span>
                    </div>
                    <div
                        onClick={() => setActiveView('Settings')}
                        className={`sidebar-item ${activeView === 'Settings' ? 'sidebar-item-active' : ''}`}
                    >
                        <Settings className="w-5 h-5" />
                        <span className="font-medium">Settings</span>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-12 bg-slate-50">
                <div className="max-w-4xl mx-auto flex flex-col h-full">

                    <AnimatePresence mode="wait">
                        {activeView === 'Settings' ? (
                            <motion.div
                                key="settings"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <div className="mb-8">
                                    <h2 className="text-3xl font-bold text-slate-900">Settings</h2>
                                    <p className="text-slate-500 mt-1">Configure integrations and templates</p>
                                </div>

                                {/* Status Notification */}
                                {statusMessage.text && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`mb-6 p-4 rounded-lg flex items-center gap-3 border ${statusMessage.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' :
                                            statusMessage.type === 'error' ? 'bg-red-50 border-red-100 text-red-700' :
                                                'bg-blue-50 border-blue-100 text-blue-700'
                                            }`}
                                    >
                                        <div className={`p-1.5 rounded-full ${statusMessage.type === 'success' ? 'bg-green-100' :
                                            statusMessage.type === 'error' ? 'bg-red-100' :
                                                'bg-blue-100'
                                            }`}>
                                            <ShieldCheck className="w-4 h-4" />
                                        </div>
                                        <p className="text-sm font-medium">{statusMessage.text}</p>
                                        <button
                                            className="ml-auto text-slate-400 hover:text-slate-600"
                                            onClick={() => setStatusMessage({ type: '', text: '' })}
                                        >
                                            <Search className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                )}

                                {/* Tabs */}
                                <div className="flex bg-slate-200/50 p-1 rounded-lg w-fit mb-8 border border-slate-200">
                                    {['JIRA', 'LLM', 'Templates'].map((tab) => (
                                        <div
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`tab-item flex items-center gap-2 ${activeTab === tab ? 'tab-item-active' : ''}`}
                                        >
                                            {tab === 'JIRA' && <Database className="w-4 h-4" />}
                                            {tab === 'LLM' && <Server className="w-4 h-4" />}
                                            {tab === 'Templates' && <FileText className="w-4 h-4" />}
                                            {tab}
                                        </div>
                                    ))}
                                </div>

                                {/* Content Section */}
                                <div className="card p-8">
                                    {activeTab === 'JIRA' && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                            <div className="mb-8 overflow-hidden">
                                                <h3 className="text-xl font-bold text-slate-900">JIRA Configuration</h3>
                                                <p className="text-sm text-slate-500 mt-0.5">Connect to your JIRA instance</p>
                                            </div>

                                            <div className="space-y-6 max-w-3xl">
                                                <div>
                                                    <label className="input-label">Base URL</label>
                                                    <input
                                                        type="text"
                                                        value={jiraConfig.url}
                                                        onChange={(e) => setJiraConfig({ ...jiraConfig, url: e.target.value })}
                                                        className="input-field"
                                                        placeholder="https://company.atlassian.net/"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="input-label">Username / Email</label>
                                                    <input
                                                        type="email"
                                                        value={jiraConfig.email}
                                                        onChange={(e) => setJiraConfig({ ...jiraConfig, email: e.target.value })}
                                                        className="input-field"
                                                        placeholder="email@company.com"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="input-label">API Token</label>
                                                    <input
                                                        type="password"
                                                        value={jiraConfig.token}
                                                        onChange={(e) => setJiraConfig({ ...jiraConfig, token: e.target.value })}
                                                        className="input-field"
                                                        placeholder="Enter API token"
                                                    />
                                                    <p className="text-xs text-blue-600 mt-2 cursor-pointer hover:underline">Get your API token from Atlassian Account Settings</p>
                                                </div>

                                                <div className="pt-6 flex items-center justify-between border-t border-slate-100 mt-8">
                                                    <button
                                                        className="btn-primary flex items-center gap-2"
                                                        onClick={handleSaveSettings}
                                                        disabled={loadingStates.save}
                                                    >
                                                        {loadingStates.save ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                        Save JIRA Settings
                                                    </button>
                                                    <button
                                                        className="btn-secondary flex items-center gap-2"
                                                        onClick={handleTestConnection}
                                                        disabled={loadingStates.test}
                                                    >
                                                        {loadingStates.test ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                                        Test Connection
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'LLM' && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                            <div className="mb-8 overflow-hidden">
                                                <h3 className="text-xl font-bold text-slate-900">LLM Configuration</h3>
                                                <p className="text-sm text-slate-500 mt-0.5">Choose your primary AI brain</p>
                                            </div>

                                            <div className="space-y-6 max-w-3xl">
                                                <div>
                                                    <label className="input-label">Provider</label>
                                                    <select
                                                        className="input-field"
                                                        value={llmConfig.provider}
                                                        onChange={(e) => setLlmConfig({ ...llmConfig, provider: e.target.value })}
                                                    >
                                                        <option>Groq (Cloud)</option>
                                                        <option>Ollama (Local)</option>
                                                        <option>OpenAI (Cloud)</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="input-label">Model ID</label>
                                                    <input
                                                        type="text"
                                                        className="input-field"
                                                        value={llmConfig.modelId}
                                                        onChange={(e) => setLlmConfig({ ...llmConfig, modelId: e.target.value })}
                                                        placeholder="llama-3.3-70b-versatile"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="input-label">API Key</label>
                                                    <input
                                                        type="password"
                                                        className="input-field"
                                                        value={llmConfig.apiKey}
                                                        onChange={(e) => setLlmConfig({ ...llmConfig, apiKey: e.target.value })}
                                                        placeholder="gsk_..."
                                                    />
                                                </div>
                                                <div className="pt-6 border-t border-slate-100 mt-8 flex justify-between">
                                                    <button
                                                        className="btn-primary flex items-center gap-2"
                                                        onClick={handleSaveSettings}
                                                        disabled={loadingStates.save}
                                                    >
                                                        {loadingStates.save ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                        Save LLM Settings
                                                    </button>
                                                    <button
                                                        className="btn-secondary flex items-center gap-2"
                                                        onClick={handleTestLLM}
                                                        disabled={loadingStates.test}
                                                    >
                                                        {loadingStates.test ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                                        Test AI Connection
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'Templates' && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                            <div className="mb-8 overflow-hidden">
                                                <h3 className="text-xl font-bold text-slate-900">PDF Templates</h3>
                                                <p className="text-sm text-slate-500 mt-0.5">Manage your output document structure</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 border border-blue-100 bg-blue-50/30 rounded-lg flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="w-8 h-8 text-blue-500" />
                                                        <div>
                                                            <p className="font-semibold text-sm">Corporate Standard</p>
                                                            <p className="text-xs text-slate-500">Default PDF layout</p>
                                                        </div>
                                                    </div>
                                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                </div>
                                                <div className="p-4 border border-slate-200 rounded-lg flex items-center justify-between hover:border-blue-200 transition-colors cursor-pointer">
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="w-8 h-8 text-slate-300" />
                                                        <div>
                                                            <p className="font-semibold text-sm">Minimal Checklist</p>
                                                            <p className="text-xs text-slate-500">Action-oriented view</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="mt-8 btn-secondary w-full border-dashed">+ Upload New Template</button>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        ) : activeView === 'Generate' ? (
                            <motion.div
                                key="generate"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <div className="mb-8">
                                    <h2 className="text-3xl font-bold text-slate-900">Generate Test Plan</h2>
                                    <p className="text-slate-500 mt-1">Enter a JIRA ticket ID to generate a comprehensive test plan</p>
                                </div>

                                {/* Status Notification (Local for Generate) */}
                                {statusMessage.text && activeView === 'Generate' && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`mb-6 p-4 rounded-lg flex items-center gap-3 border ${statusMessage.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' :
                                            statusMessage.type === 'error' ? 'bg-red-50 border-red-100 text-red-700' :
                                                'bg-blue-50 border-blue-100 text-blue-700'
                                            }`}
                                    >
                                        <div className={`p-1.5 rounded-full ${statusMessage.type === 'success' ? 'bg-green-100' :
                                            statusMessage.type === 'error' ? 'bg-red-100' :
                                                'bg-blue-100'
                                            }`}>
                                            <ShieldCheck className="w-4 h-4" />
                                        </div>
                                        <p className="text-sm font-medium">{statusMessage.text}</p>
                                    </motion.div>
                                )}

                                <div className="space-y-6">
                                    <div className="card p-8">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">1</div>
                                            <div>
                                                <h3 className="font-bold text-slate-900">Ticket Input</h3>
                                                <p className="text-sm text-slate-500">Enter the JIRA ticket ID you want to generate a test plan for</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <div className="relative flex-1">
                                                <input
                                                    type="text"
                                                    className="input-field pl-10 h-12"
                                                    placeholder="VWO-5 or JIRA URL"
                                                    value={ticketKey}
                                                    onChange={(e) => setTicketKey(e.target.value)}
                                                />
                                                <Search className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" />
                                            </div>
                                            <button
                                                className="btn-primary h-12 px-8 flex items-center gap-2"
                                                onClick={handleFetchTicket}
                                                disabled={loadingStates.fetch}
                                            >
                                                {loadingStates.fetch ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                                Fetch Ticket
                                            </button>
                                        </div>
                                        <p className="mt-3 text-xs text-slate-400">Recent: <span className="text-blue-500 cursor-pointer hover:underline" onClick={() => setTicketKey('VWO-1')}>VWO-1</span></p>
                                    </div>

                                    {fetchedTicket && (
                                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                                            <div className="card p-8 border-l-4 border-l-blue-500">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div>
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase tracking-wider">{fetchedTicket.key}</span>
                                                        <h4 className="text-xl font-bold mt-2 text-slate-900">{fetchedTicket.summary}</h4>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                                            <ShieldCheck className="w-3.5 h-3.5" />
                                                            Priority: {fetchedTicket.priority}
                                                        </div>
                                                        <div className="text-xs text-slate-400">Status: {fetchedTicket.status}</div>
                                                    </div>
                                                </div>

                                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 mb-8 max-h-48 overflow-y-auto">
                                                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                                        {typeof fetchedTicket.description === 'string' ? fetchedTicket.description : 'Click Trigger to analyze requirements...'}
                                                    </p>
                                                </div>

                                                <button
                                                    className="w-full btn-primary h-14 text-lg gap-3 shadow-blue-500/20 shadow-xl"
                                                    onClick={handleGenerateAI}
                                                    disabled={loadingStates.generate}
                                                >
                                                    {loadingStates.generate ? <Loader2 className="w-6 h-6 animate-spin" /> : <Wand2 className="w-6 h-6" />}
                                                    Trigger AI Generation
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {generatedPlan && (
                                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                            <div ref={planRef} className="card p-8 bg-[#0B1527] text-slate-100 border-none shadow-2xl overflow-hidden relative">
                                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                                    <FileText className="w-48 h-48" />
                                                </div>

                                                <div className="flex justify-between items-center mb-8 border-b border-slate-700/50 pb-6 relative z-10">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-blue-600 rounded-lg">
                                                            <FileText className="w-5 h-5 text-white" />
                                                        </div>
                                                        <h3 className="text-xl font-bold">AI Generated Test Plan</h3>
                                                    </div>
                                                    <div className="flex gap-3 no-print">
                                                        <button
                                                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-md text-sm font-medium transition-colors border border-slate-700 flex items-center gap-2"
                                                            onClick={handleExportExcel}
                                                        >
                                                            <Table className="w-4 h-4" />
                                                            Export Excel
                                                        </button>
                                                        <button
                                                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-md text-sm font-medium transition-colors border border-slate-700 flex items-center gap-2"
                                                            onClick={handleExportPDF}
                                                            disabled={loadingStates.generate}
                                                        >
                                                            <Download className="w-4 h-4" />
                                                            Export PDF
                                                        </button>
                                                        <button
                                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-sm font-medium transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2"
                                                            onClick={handleCopyMarkdown}
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                            Copy Markdown
                                                        </button>
                                                    </div>
                                                </div>

                                                <div id="pdf-content" className="markdown-content relative z-10 max-w-none">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                        {generatedPlan}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="other"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center h-64 text-slate-400"
                            >
                                <Database className="w-12 h-12 mb-4 opacity-20" />
                                <p>View "{activeView}" is under construction.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default App;
