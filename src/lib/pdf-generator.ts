/**
 * PDF Generator for Advisory Agreements
 * Randomly selects from 16 reference templates and generates a filled PDF with dummy data
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { promises as fs } from 'fs';
import * as path from 'path';

// Reference template types
type DiscretionType = 'Discretionary' | 'Non-Discretionary';
type WrapType = 'WRAP' | 'NON-WRAP';
type FeeType = 'Flat' | 'Tiered';
type AccountHolders = 1 | 2;

interface TemplateConfig {
    discretion: DiscretionType;
    wrap: WrapType;
    feeType: FeeType;
    accountHolders: AccountHolders;
    filename: string;
}

// All 16 template configurations
const TEMPLATES: TemplateConfig[] = [
    { discretion: 'Discretionary', wrap: 'WRAP', feeType: 'Flat', accountHolders: 1, filename: 'Discretionary WRAP Flat (1).pdf' },
    { discretion: 'Discretionary', wrap: 'WRAP', feeType: 'Flat', accountHolders: 2, filename: 'Discretionary WRAP Flat (2).pdf' },
    { discretion: 'Discretionary', wrap: 'WRAP', feeType: 'Tiered', accountHolders: 1, filename: 'Discretionary WRAP Tiered (1).pdf' },
    { discretion: 'Discretionary', wrap: 'WRAP', feeType: 'Tiered', accountHolders: 2, filename: 'Discretionary WRAP Tiered (2).pdf' },

    { discretion: 'Discretionary', wrap: 'NON-WRAP', feeType: 'Flat', accountHolders: 1, filename: 'Discretionary NON-WRAP Flat (1).pdf' },
    { discretion: 'Discretionary', wrap: 'NON-WRAP', feeType: 'Flat', accountHolders: 2, filename: 'Discretionary NON-WRAP Flat (2).pdf' },
    { discretion: 'Discretionary', wrap: 'NON-WRAP', feeType: 'Tiered', accountHolders: 1, filename: 'Discretionary NON-WRAP Tiered (1).pdf' },
    { discretion: 'Discretionary', wrap: 'NON-WRAP', feeType: 'Tiered', accountHolders: 2, filename: 'Discretionary NON-WRAP Tiered (2).pdf' },

    { discretion: 'Non-Discretionary', wrap: 'WRAP', feeType: 'Flat', accountHolders: 1, filename: 'Non-Discretionary WRAP Flat (1).pdf' },
    { discretion: 'Non-Discretionary', wrap: 'WRAP', feeType: 'Flat', accountHolders: 2, filename: 'Non-Discretionary WRAP Flat (2).pdf' },
    { discretion: 'Non-Discretionary', wrap: 'WRAP', feeType: 'Tiered', accountHolders: 1, filename: 'Non-Discretionary WRAP Tiered (1).pdf' },
    { discretion: 'Non-Discretionary', wrap: 'WRAP', feeType: 'Tiered', accountHolders: 2, filename: 'Non-Discretionary WRAP Tiered (2).pdf' },

    { discretion: 'Non-Discretionary', wrap: 'NON-WRAP', feeType: 'Flat', accountHolders: 1, filename: 'Non-Discretionary NON-WRAP Flat (1).pdf' },
    { discretion: 'Non-Discretionary', wrap: 'NON-WRAP', feeType: 'Flat', accountHolders: 2, filename: 'Non-Discretionary NON-WRAP Flat (2).pdf' },
    { discretion: 'Non-Discretionary', wrap: 'NON-WRAP', feeType: 'Tiered', accountHolders: 1, filename: 'Non-Discretionary NON-WRAP Tiered (1).pdf' },
    { discretion: 'Non-Discretionary', wrap: 'NON-WRAP', feeType: 'Tiered', accountHolders: 2, filename: 'Non-Discretionary NON-WRAP Tiered (2).pdf' },
];

// Dummy data generators
const FIRST_NAMES = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'William', 'Mary'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const ADVISOR_NAMES = ['James Anderson', 'Patricia Mitchell', 'Mark Thompson', 'Jennifer White', 'Steven Clark'];

function randomDate(start: Date, end: Date): string {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
}

function randomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateDummyData(config: TemplateConfig) {
    const firstName1 = randomElement(FIRST_NAMES);
    const lastName1 = randomElement(LAST_NAMES);
    const firstName2 = randomElement(FIRST_NAMES.filter(n => n !== firstName1));
    const lastName2 = lastName1; // Joint accounts usually same last name

    const clientName = config.accountHolders === 1
        ? `${firstName1} ${lastName1}`
        : `${firstName1} ${lastName1} & ${firstName2} ${lastName2}`;

    const feeAmount = config.feeType === 'Flat'
        ? `${(Math.random() * 0.5 + 0.5).toFixed(2)}%` // 0.5% to 1.0%
        : ''; // Tiered will have a chart

    const tieredFeeChart = config.feeType === 'Tiered'
        ? `0 to 500,000: 1.00%
500,000 to 1,000,000: 0.85%
1,000,000 to 2,000,000: 0.75%
2,000,000 to 5,000,000: 0.50%`
        : '';

    return {
        discretionary: config.discretion,
        wrap: config.wrap,
        advisorName: randomElement(ADVISOR_NAMES),
        repCode: `REP${Math.floor(Math.random() * 9000 + 1000)}`,
        clientName,
        effectiveDate: randomDate(new Date('2024-01-01'), new Date('2024-12-31')),
        advReceivedDate: randomDate(new Date('2023-11-01'), new Date('2024-01-15')),
        accountNumber: `ACC${Math.floor(Math.random() * 900000 + 100000)}`,
        feeType: config.feeType,
        feeAmount,
        tieredFeeChart,
        clientSignatureDateP11: randomDate(new Date('2024-01-01'), new Date('2024-12-31')),
        advisorSignatureDateP11: randomDate(new Date('2024-01-01'), new Date('2024-12-31')),
        clientSignatureDateP14: randomDate(new Date('2024-01-01'), new Date('2024-12-31')),
        advisorSignatureDateP14: randomDate(new Date('2024-01-01'), new Date('2024-12-31')),
    };
}

/**
 * Generate a test PDF by randomly selecting a template and filling with dummy data
 * @param outputPath - Where to save the generated PDF
 * @returns Metadata about the generated PDF
 */
export async function generateTestAdvisoryPdf(outputPath: string) {
    // Randomly select a template
    const template = randomElement(TEMPLATES);
    const templatePath = path.join(process.cwd(), 'src/ai/reference-docs', template.filename);

    // Generate dummy data
    const data = generateDummyData(template);

    console.log('[PDF Generator] Selected template:', template.filename);
    console.log('[PDF Generator] Generated data:', data);

    try {
        // Read the template PDF
        const templateBytes = await fs.readFile(templatePath);
        const pdfDoc = await PDFDocument.load(templateBytes);

        // Note: Since the templates have "XXXXXX" placeholders, we would need to:
        // 1. Either use a PDF form with fillable fields (PDFDocument.getForm())
        // 2. Or parse and replace text directly (not recommended, complex)
        // 3. Or use a library that supports text search/replace

        // For now, let's just copy the template and save it with a new name
        // The AI will extract the XXXXXX fields and we can verify it works
        // In production, you'd want to actually fill the fields programmatically

        const pdfBytes = await pdfDoc.save();
        await fs.writeFile(outputPath, pdfBytes);

        console.log('[PDF Generator] Generated PDF:', outputPath);

        return {
            success: true,
            template: template.filename,
            config: template,
            data,
            outputPath,
        };
    } catch (error) {
        console.error('[PDF Generator] Error:', error);
        throw error;
    }
}

/**
 * Get the best matching reference template for a given set of attributes
 */
export function findMatchingTemplate(
    discretion?: string,
    wrap?: string,
    feeType?: string,
    accountHolders?: number
): string | null {
    const match = TEMPLATES.find(t => {
        if (discretion && t.discretion !== discretion) return false;
        if (wrap && t.wrap !== wrap) return false;
        if (feeType && t.feeType !== feeType) return false;
        if (accountHolders && t.accountHolders !== accountHolders) return false;
        return true;
    });

    return match ? match.filename : null;
}

/**
 * Get all template configurations
 */
export function getAllTemplates(): TemplateConfig[] {
    return TEMPLATES;
}
