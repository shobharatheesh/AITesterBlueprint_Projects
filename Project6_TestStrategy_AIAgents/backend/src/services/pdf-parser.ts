import fs from 'fs';
const pdf = require('pdf-parse');

export interface TemplateSection {
    heading: string;
    content_placeholder?: string;
}

export class PDFParserService {
    async extractStructure(filePath: string): Promise<TemplateSection[]> {
        const dataBuffer = fs.readFileSync(filePath);
        try {
            const data = await pdf(dataBuffer);
            const text: string = data.text;

            const lines = text.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
            const headings = lines.filter((line: string) =>
                line.length < 50 &&
                /^[0-9.]*\s*[A-Z]/.test(line) &&
                !line.includes(':')
            );

            if (headings.length === 0) {
                return [
                    { heading: 'Overview' },
                    { heading: 'Test Scenarios' },
                    { heading: 'Edge Cases' },
                    { heading: 'Bug Reports' },
                    { heading: 'Conclusion' }
                ];
            }

            return headings.map((h: string) => ({ heading: h }));
        } catch (error: any) {
            console.error('PDF Parse Error:', error);
            // Fallback
            return [
                { heading: 'Overview' },
                { heading: 'Test Scenarios' },
                { heading: 'Edge Cases' },
                { heading: 'Bug Reports' },
                { heading: 'Conclusion' }
            ];
        }
    }
}
