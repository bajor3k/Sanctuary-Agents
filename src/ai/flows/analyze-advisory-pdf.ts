'use server';
/**
 * @fileOverview Genkit flow to analyze advisory agreement PDFs using Gemini's native PDF support.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { promises as fs } from 'fs';

const AdvisoryDataSchema = z.object({
    discretionary: z.enum(['Discretionary', 'Non-Discretionary', 'Missing', 'Error']).describe('Whether the account is discretionary or non-discretionary'),
    wrap: z.enum(['WRAP', 'Non-WRAP', 'Missing', 'Error']).describe('Whether the account is WRAP or Non-WRAP'),
    clientName: z.string().describe('The client\'s full name'),
    effectiveDate: z.string().describe('The effective date of the agreement (format: MM/DD/YYYY)'),
    clientSignedP11: z.enum(['Yes', 'No', 'Missing', 'Error']).describe('Whether client signed page 11'),
    clientDatedP11: z.enum(['Yes', 'No', 'Missing', 'Error']).describe('Whether client dated page 11'),
    accountNumber: z.string().describe('The account number'),
    feeType: z.enum(['Flat', 'Tiered', 'Missing', 'Error']).describe('The fee structure type'),
    feeAmount: z.string().describe('The fee amount or percentage'),
    advReceivedDate: z.string().describe('The date ADV was received (format: MM/DD/YYYY)'),
    clientSignedP14: z.enum(['Yes', 'No', 'Missing', 'Error']).describe('Whether client signed page 14'),
    clientDatedP14: z.enum(['Yes', 'No', 'Missing', 'Error']).describe('Whether client dated page 14'),
});

export type AdvisoryData = z.infer<typeof AdvisoryDataSchema>;

const advisoryPdfPrompt = ai.definePrompt({
    name: 'advisoryPdfPrompt',
    input: {
        schema: z.object({
            pdfData: z.string().describe('Base64 encoded PDF data'),
        })
    },
    output: { schema: AdvisoryDataSchema },
    model: 'googleai/gemini-2.0-flash-exp',
    prompt: `You are analyzing a financial advisory agreement PDF document. I'm providing you with the PDF file.

CAREFULLY EXAMINE THE ENTIRE DOCUMENT and extract the following information:

**FIELD EXTRACTION GUIDE:**

1. **discretionary**: Look for checkboxes or text indicating "Discretionary" vs "Non-Discretionary"
2. **wrap**: Look for "WRAP Fee Program" checkbox or text
3. **clientName**: Find the client's full legal name (appears in headers, signature blocks)
4. **effectiveDate**: The agreement effective date (format: MM/DD/YYYY)
5. **accountNumber**: Account or contract number (series of digits/letters)
6. **clientSignedP11**: Look for client signatures around page 11 or in the middle section
7. **clientDatedP11**: Look for dates near signatures around page 11 or in the middle section
8. **clientSignedP14**: Look for client signatures around page 14 or near the end
9. **clientDatedP14**: Look for dates near signatures around page 14 or near the end
10. **feeType**: "Flat" (single %) or "Tiered" (multiple % levels)
11. **feeAmount**: The fee percentage or dollar amount (include % or $ symbol)
12. **advReceivedDate**: Date ADV was received (format: MM/DD/YYYY)

**CRITICAL SIGNATURE RULES:**
- These documents are COMPLETE and SIGNED - assume "Yes" for signatures unless you see a CLEARLY BLANK signature line
- Page numbers may vary - look for signatures in the general area (middle of document for P11, end for P14)
- Signatures can be handwritten, typed, electronic, or stamped - ALL count as "Yes"
- If you see ANY mark, signature, or name in a signature area, mark it as "Yes"
- Only mark as "No" if you see an EMPTY signature line with no marks at all
- Never use "Missing" for signatures - use "Yes" or "No" only

**OTHER RULES:**
- Read EVERY page carefully - this may be a scanned document
- Extract exact values you see - don't guess
- Be thorough - information may be anywhere in the document
- Look for filled-in forms, handwritten text, checkmarks, and typed text
- Assume the document is complete unless you see clear evidence otherwise

Here is the PDF document:
{{media url=pdfData}}

Extract all fields. Remember: assume signatures are present ("Yes") unless clearly blank.`,
});

const analyzeAdvisoryPdfFlow = ai.defineFlow(
    {
        name: 'analyzeAdvisoryPdfFlow',
        inputSchema: z.object({
            pdfData: z.string(),
        }),
        outputSchema: AdvisoryDataSchema,
    },
    async (input) => {
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
            throw new Error('The AI service is not configured. Set GEMINI_API_KEY.');
        }

        try {
            const { output } = await advisoryPdfPrompt({
                pdfData: input.pdfData,
            });

            return output || {
                discretionary: 'Error' as const,
                wrap: 'Error' as const,
                clientName: 'Error',
                effectiveDate: 'Error',
                clientSignedP11: 'Error' as const,
                clientDatedP11: 'Error' as const,
                accountNumber: 'Error',
                feeType: 'Error' as const,
                feeAmount: 'Error',
                advReceivedDate: 'Error',
                clientSignedP14: 'Error' as const,
                clientDatedP14: 'Error' as const,
            };
        } catch (error) {
            console.error('Error in advisory PDF analysis flow:', error);
            throw error;
        }
    }
);

/**
 * Analyzes an advisory PDF file using Gemini's native PDF support
 * @param filePath - Absolute path to the PDF file
 * @returns Extracted advisory data
 */
export async function analyzeAdvisoryPdf(filePath: string): Promise<AdvisoryData> {
    try {
        console.log(`[PDF AI] Reading PDF file: ${filePath}`);

        // Read PDF file and convert to base64
        const pdfBuffer = await fs.readFile(filePath);
        const base64Pdf = pdfBuffer.toString('base64');
        const pdfDataUrl = `data:application/pdf;base64,${base64Pdf}`;

        console.log(`[PDF AI] Analyzing PDF with Gemini (${(pdfBuffer.length / 1024).toFixed(2)} KB)...`);

        // Analyze with Gemini
        const result = await analyzeAdvisoryPdfFlow({ pdfData: pdfDataUrl });

        const filename = filePath.split('/').pop();
        console.log(`[PDF AI] ✓ Analysis complete for: ${filename}`);
        console.log(`[PDF AI] Results:`, JSON.stringify(result, null, 2));

        return result;
    } catch (error) {
        console.error(`[PDF AI] Error analyzing PDF ${filePath}:`, error);
        // Return all "Error" values on failure
        return {
            discretionary: 'Error' as const,
            wrap: 'Error' as const,
            clientName: 'Error',
            effectiveDate: 'Error',
            clientSignedP11: 'Error' as const,
            clientDatedP11: 'Error' as const,
            accountNumber: 'Error',
            feeType: 'Error' as const,
            feeAmount: 'Error',
            advReceivedDate: 'Error',
            clientSignedP14: 'Error' as const,
            clientDatedP14: 'Error' as const,
        };
    }
}
