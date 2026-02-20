import axios from 'axios';

export interface LLMConfig {
    provider: 'groq' | 'ollama';
    apiKey?: string;
    baseUrl?: string;
    model: string;
}

export class LLMService {
    async generateTestPlan(ticketData: any, template: any, config: LLMConfig) {
        const prompt = `
      You are a professional QA Engineer. Generate a comprehensive test plan following the template structure below.
      
      JIRA TICKET:
      Key: ${ticketData.key}
      Summary: ${ticketData.summary}
      Description: ${ticketData.description}
      Acceptance Criteria: ${ticketData.acceptance_criteria.join(', ')}
      
      TEMPLATE STRUCTURE:
      ${template.sections.map((s: any) => `- ${s.heading}`).join('\n')}
      
      INSTRUCTIONS:
      Map the ticket details to the appropriate sections. Provide detailed test scenarios, edge cases, and regression impacts.
    `;

        if (config.provider === 'groq') {
            return this.callGroq(prompt, config);
        } else {
            return this.callOllama(prompt, config);
        }
    }

    private async callGroq(prompt: string, config: LLMConfig) {
        try {
            const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: config.model,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7
            }, {
                headers: { 'Authorization': `Bearer ${config.apiKey}` }
            });
            return response.data.choices[0].message.content;
        } catch (error: any) {
            throw new Error(`Groq Error: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    private async callOllama(prompt: string, config: LLMConfig) {
        try {
            const response = await axios.post(`${config.baseUrl}/api/generate`, {
                model: config.model,
                prompt: prompt,
                stream: false
            });
            return response.data.response;
        } catch (error: any) {
            throw new Error(`Ollama Error: ${error.message}`);
        }
    }
}
