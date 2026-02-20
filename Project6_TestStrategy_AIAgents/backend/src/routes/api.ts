import { Router } from 'express';
import { JiraService } from '../services/jira-client';
import { LLMService } from '../services/llm-provider';
import { getSetting, setSetting } from '../db/settings';
import axios from 'axios';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PDFParserService } from '../services/pdf-parser';

const router = Router();
const llmService = new LLMService();
const pdfParser = new PDFParserService();

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../../../templates');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, 'active_template.pdf');
    }
});
const upload = multer({ storage });

// Helper to get all settings
const getAllSettings = async () => {
    const model = await getSetting('groqModel');
    return {
        jiraBaseUrl: await getSetting('jiraBaseUrl') || '',
        jiraEmail: await getSetting('jiraEmail') || '',
        jiraToken: await getSetting('jiraToken') || '',
        groqKey: await getSetting('groqKey') || '',
        // Force migration if they have the old decommissioned model
        groqModel: (!model || model === 'llama3-70b-8192') ? 'llama-3.3-70b-versatile' : model,
        ollamaUrl: await getSetting('ollamaUrl') || 'http://localhost:11434',
        ollamaModel: await getSetting('ollamaModel') || 'llama3',
        useLocalLlm: await getSetting('useLocalLlm') === 'true'
    };
};

// --- SETTINGS ENDPOINTS ---

router.get('/settings', async (req, res) => {
    try {
        const settings = await getAllSettings();
        res.json(settings);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/settings/save', async (req, res) => {
    try {
        const settings = req.body;
        for (const [key, value] of Object.entries(settings)) {
            await setSetting(key, String(value));
        }
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// --- JIRA ENDPOINTS ---

router.post('/jira/test', async (req, res) => {
    const { baseUrl, email, token } = req.body;
    try {
        const jiraClient = new JiraService(baseUrl, email, token);
        const result = await axios.get(`${baseUrl.replace(/\/$/, '')}/rest/api/3/myself`, {
            headers: {
                'Authorization': `Basic ${Buffer.from(`${email}:${token}`).toString('base64')}`,
                'Accept': 'application/json'
            }
        });
        res.json({ success: true, user: result.data.displayName });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.response?.data || error.message });
    }
});

router.post('/jira/fetch', async (req, res) => {
    const { ticketId } = req.body;
    try {
        const s = await getAllSettings();
        if (!s.jiraBaseUrl || !s.jiraEmail || !s.jiraToken) {
            return res.status(400).json({ error: 'JIRA credentials not configured' });
        }
        const jiraClient = new JiraService(s.jiraBaseUrl, s.jiraEmail, s.jiraToken);
        const ticket = await jiraClient.fetchTicket(ticketId);
        res.json(ticket);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// --- LLM ENDPOINTS ---

router.post('/llm/test-groq', async (req, res) => {
    const { apiKey } = req.body;
    try {
        const response = await axios.get('https://api.groq.com/openai/v1/models', {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        res.json({ success: true });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.response?.data?.error?.message || error.message });
    }
});

router.post('/llm/test-ollama', async (req, res) => {
    const { baseUrl } = req.body;
    try {
        const response = await axios.get(`${baseUrl.replace(/\/$/, '')}/api/tags`);
        res.json({ success: true, models: response.data.models });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// --- TEMPLATE ENDPOINTS ---

router.post('/templates/upload', upload.single('template'), async (req, res) => {
    try {
        if (!req.file) throw new Error('No file uploaded');
        const sections = await pdfParser.extractStructure(req.file.path);
        await setSetting('template_sections', JSON.stringify(sections));
        res.json({ success: true, sections });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/testplan/generate', async (req, res) => {
    const { ticketId } = req.body;
    try {
        const s = await getAllSettings();
        const jiraClient = new JiraService(s.jiraBaseUrl, s.jiraEmail, s.jiraToken);
        const ticket = await jiraClient.fetchTicket(ticketId);

        // Use stored template sections or default
        const storedTemplate = await getSetting('template_sections');
        const template = storedTemplate ? { sections: JSON.parse(storedTemplate) } : {
            sections: [
                { heading: 'Overview' },
                { heading: 'Test Scenarios' },
                { heading: 'Edge Cases' },
                { heading: 'Bug Reports' },
                { heading: 'Conclusion' }
            ]
        };

        const config = {
            provider: s.useLocalLlm ? 'ollama' : 'groq',
            model: s.useLocalLlm ? s.ollamaModel : s.groqModel,
            apiKey: s.groqKey,
            baseUrl: s.ollamaUrl
        };

        const testPlan = await llmService.generateTestPlan(ticket, template, config as any);
        res.json({ testPlan });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
