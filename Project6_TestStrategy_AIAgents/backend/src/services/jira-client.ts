import axios from 'axios';

export class JiraService {
    private baseUrl: string;
    private auth: string;

    constructor(baseUrl: string, email: string, token: string) {
        this.baseUrl = baseUrl.replace(/\/$/, '');
        this.auth = Buffer.from(`${email}:${token}`).toString('base64');
    }

    async fetchTicket(ticketId: string) {
        try {
            const response = await axios.get(`${this.baseUrl}/rest/api/3/issue/${ticketId}`, {
                headers: {
                    'Authorization': `Basic ${this.auth}`,
                    'Accept': 'application/json'
                }
            });

            const issue = response.data;
            const fields = issue.fields;

            // Basic ADF to text parser for description (very simplified)
            const description = fields.description
                ? JSON.stringify(fields.description)
                : 'No description provided';

            return {
                key: issue.key,
                summary: fields.summary,
                description: description,
                priority: fields.priority?.name || 'Medium',
                status: fields.status?.name || 'To Do',
                assignee: fields.assignee?.displayName || 'Unassigned',
                labels: fields.labels || [],
                acceptance_criteria: this.extractAC(description)
            };
        } catch (error: any) {
            console.error('Jira fetch error:', error.response?.data || error.message);
            throw new Error(`Failed to fetch JIRA ticket: ${error.message}`);
        }
    }

    private extractAC(description: string): string[] {
        // Basic regex attempt to find AC
        const acMatch = description.match(/Acceptance Criteria[:\s]+(.*?)(?=\\n\\n|$)/is);
        return acMatch ? [acMatch[1].trim()] : ["Please check ticket description for AC details."];
    }
}
