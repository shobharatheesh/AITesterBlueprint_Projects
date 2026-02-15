import { useState, useEffect } from 'react';
import Groq from 'groq-sdk';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Beaker,
  Code2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  RotateCw,
  Sparkles,
  Key,
  Heart
} from 'lucide-react';

const SYSTEM_PROMPT = `You are an expert Senior QA Automation Engineer. 
Your task is to generate comprehensive, high-quality test cases based on the user's input (requirements or code snippet). 

Output Format:
Provide the output in clean, structured MARKDOWN format. Focus on readability.
Use the following structure for each test case:

### Test Cases for [Feature Name]

#### Test Case [N]: [Title]
* **Test Case ID**: TC[00N]
* **Test Scenario**: [Brief description]
* **Pre-conditions**:
  + [Condition 1]
  + [Condition 2]
* **Test Steps**:
  1. [Step 1]
  2. [Step 2]
* **Expected Result**: [Outcome]
* **Priority**: [High/Medium/Low]
* **Test Type**: [Functional/Security/etc]

Use '###' for the main header and '####' for individual test cases.
Use bullet points and bold text exactly as shown to match the desired style.`;

function App() {
  const [apiKey, setApiKey] = useState('');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (import.meta.env.VITE_GROQ_API_KEY) {
      setApiKey(import.meta.env.VITE_GROQ_API_KEY);
    }
  }, []);

  const handleGenerate = async () => {
    if (!apiKey) {
      setError("Please enter a valid Groq API Key.");
      return;
    }
    if (!query.trim()) {
      setError("Please enter requirements or code to test.");
      return;
    }

    setLoading(true);
    setError(null);
    // previous result is kept until new one arrives or we can clear it. 
    // user might want to see old result while new one generates? 
    // usually clearing is better to show activity.
    setResult('');

    try {
      const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: query }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.1,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("No content received from API");

      setResult(content);

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to generate test cases.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test-cases.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="layout-container font-sans text-slate-200">
      {/* Header with API Key */}
      <header className="flex flex-col md:flex-row items-center justify-between mb-8 animate-fade-in py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
            <Beaker className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">TestForge AI</h1>
        </div>

        <div className="mt-4 md:mt-0 glass-panel px-3 py-1.5 rounded-full flex items-center gap-2 max-w-xs w-full">
          <Key className="w-3 h-3 text-slate-500" />
          <input
            type={showApiKey ? "text" : "password"}
            placeholder="API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="bg-transparent border-none outline-none text-xs w-full text-slate-400 placeholder-slate-600 font-mono"
          />
          <button
            onClick={() => setShowApiKey(!showApiKey)}
            className="text-[10px] text-indigo-400 hover:text-indigo-300 uppercase font-semibold tracking-wider"
          >
            {showApiKey ? "Hide" : "Show"}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-6">

        {/* Input Section */}
        <section className="glass-panel rounded-xl p-1 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

          <div className="bg-[#0f1623] rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                <Code2 className="w-3 h-3" />
                Input Requirements
              </label>
            </div>

            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Paste your user stories, acceptance criteria, or code snippet here..."
              className="w-full bg-transparent border-none outline-none text-sm text-slate-300 placeholder-slate-600 font-mono min-h-[120px] resize-y"
            />

            <div className="flex justify-end mt-2 pt-2 border-t border-slate-800">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="btn-primary py-2 px-6 text-sm flex items-center gap-2 shadow-lg shadow-indigo-900/20 rounded-full"
              >
                {loading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Test Cases
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm flex items-center gap-3"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section (Only visible if result exists) */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col rounded-xl overflow-hidden glass-panel border border-slate-700/50"
          >
            {/* Toolbar */}
            <div className="bg-[#1e293b]/50 border-b border-slate-700/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Generated Test Cases
              </h2>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-600"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-600"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={handleGenerate}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-900/20 transition-all ml-2"
                >
                  <RotateCw className="w-4 h-4" />
                  Regenerate
                </button>
              </div>
            </div>

            {/* Markdown Content */}
            <div className="p-6 bg-[#0B1120] text-slate-300 min-h-[400px] overflow-auto custom-markdown">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 mb-6 text-center animate-fade-in">
        <p className="flex items-center justify-center gap-2 text-slate-500 text-sm font-medium">
          Made with <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" /> using GROQ AI
        </p>
      </footer>
    </div>
  );
}

export default App;
