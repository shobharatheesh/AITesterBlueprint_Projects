import React, { useState } from 'react';
import { Search, Loader2, Wand2, FileText, Settings, History, CheckCircle2, ChevronRight, Layout, Download, Copy, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { fetchTicket, generatePlan } from './services/api';

const App = () => {
    const [ticketKey, setTicketKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [ticketData, setTicketData] = useState(null);
    const [testPlan, setTestPlan] = useState('');
    const [error, setError] = useState(null);

    const handleFetch = async (e) => {
        e.preventDefault();
        if (!ticketKey) return;

        setLoading(true);
        setError(null);
        setTestPlan('');

        try {
            const data = await fetchTicket(ticketKey);
            setTicketData(data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to fetch ticket. Check JIRA connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!ticketData) return;

        setGenerating(true);
        setError(null);
        try {
            const result = await generatePlan(ticketData);
            setTestPlan(result.plan);
        } catch (err) {
            setError(err.response?.data?.detail || 'Generation failed. Check LLM provider.');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col">
            {/* Background Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 glass-card mx-6 mt-6 py-4 px-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Layout className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white">B.L.A.S.T. <span className="text-slate-500 text-sm font-normal ml-2">v.1.0</span></h1>
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Intelligent Test Plan Agent</p>
                    </div>
                </div>

                <nav className="hidden md:flex items-center gap-6">
                    <button className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                        <History className="w-4 h-4" /> History
                    </button>
                    <button className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                        <Settings className="w-4 h-4" /> Settings
                    </button>
                </nav>
            </header>

            <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] mx-auto w-full">
                {/* Left Column: Input & Ticket Data */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    {/* Input Section */}
                    <section className="glass-card p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Search className="w-5 h-5 text-blue-400" /> Start Blueprint
                        </h2>
                        <form onSubmit={handleFetch} className="space-y-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Enter JIRA Key (e.g., KAN-123)"
                                    className="w-full input-field pr-12"
                                    value={ticketKey}
                                    onChange={(e) => setTicketKey(e.target.value.toUpperCase())}
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="absolute right-2 top-2 p-1.5 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 px-1">Tip: Use your verified JIRA domain credentials in .env</p>
                        </form>
                    </section>

                    {/* Ticket Display */}
                    <AnimatePresence mode="wait">
                        {ticketData && (
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="glass-card p-6 flex flex-col flex-1"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">{ticketData.key}</span>
                                        <h3 className="text-xl font-bold text-white mt-1 leading-tight">{ticketData.summary}</h3>
                                    </div>
                                    <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${ticketData.priority === 'High' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'
                                        }`}>
                                        {ticketData.priority}
                                    </div>
                                </div>

                                <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                            <span className="text-sm font-medium">{ticketData.status}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assignee</label>
                                        <p className="text-sm mt-1">{ticketData.assignee || 'Unassigned'}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description Context</label>
                                        <div className="text-sm text-slate-400 mt-1 leading-relaxed line-clamp-6">
                                            {typeof ticketData.description === 'string' ? ticketData.description : 'Complex content format detected.'}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleGenerate}
                                    disabled={generating}
                                    className="mt-6 w-full btn-primary flex items-center justify-center gap-2 py-4"
                                >
                                    {generating ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Generating Architecture...
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 className="w-5 h-5" />
                                            Trigger Test Agent
                                        </>
                                    )}
                                </button>
                            </motion.section>
                        )}
                    </AnimatePresence>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 text-red-400 text-sm"
                        >
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p>{error}</p>
                        </motion.div>
                    )}
                </div>

                {/* Right Column: Generated Output */}
                <div className="lg:col-span-8 flex flex-col h-[calc(100vh-170px)]">
                    <section className="glass-card flex-1 flex flex-col overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-indigo-400" />
                                <h2 className="text-lg font-semibold">Generated Test Plan</h2>
                            </div>

                            {testPlan && (
                                <div className="flex gap-2">
                                    <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white" title="Copy to Clipboard">
                                        <Copy className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white" title="Download PDF">
                                        <Download className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-900/20">
                            {testPlan ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="prose prose-invert prose-blue max-w-none"
                                >
                                    <ReactMarkdown>{testPlan}</ReactMarkdown>
                                </motion.div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center max-w-sm mx-auto">
                                    <div className="w-20 h-20 bg-slate-900/50 rounded-full flex items-center justify-center mb-6">
                                        <FileText className="w-10 h-10 opacity-20" />
                                    </div>
                                    <h3 className="text-xl font-medium mb-2">Workspace Ready</h3>
                                    <p className="text-sm">Select a ticket and trigger the AI agent to generate a comprehensive test plan here.</p>
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-3 border-t border-white/5 bg-slate-950/50 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-slate-500">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> JIRA API</div>
                                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> GROQ Cloud</div>
                            </div>
                            <div>Layer 3: Execution Agent</div>
                        </div>
                    </section>
                </div>
            </main>

            <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
        </div>
    );
};

export default App;
