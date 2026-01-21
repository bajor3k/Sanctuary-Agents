'use server';
/**
 * @fileOverview Genkit flow to analyze advisory agreement PDFs using Gemini's native PDF support.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { promises as fs } from 'fs';
import * as path from 'path';

const AdvisoryDataSchema = z.object({
    // Page 1
    discretionary: z.string().describe('Is "Discretionary" checkbox checked? Return "Discretionary" or "Non-Discretionary" or "Missing"'),
    wrap: z.string().describe('Is "Wrap" checkbox checked? Return "WRAP" or "Non-WRAP" or "Missing"'),
    advisorName: z.string().describe('Investment Advisor Representative Name'),
    repCode: z.string().describe('Rep Code'),
    clientName: z.string().describe('Client Name'),
    effectiveDate: z.string().describe('Effective Date'),
    accountHolders: z.number().describe('Number of account holders (1 or 2) - count how many names are on the agreement'),

    // Page 10
    advReceivedDate: z.string().describe('Date ADV Received'),

    // Page 11 - Client 1
    clientSignedP11: z.enum(['Yes', 'No', 'Error']).describe('Is Client 1 Signature present on Page 11?'),
    clientNameP11: z.string().describe('Client 1 Name printed on Page 11'),
    clientDateP11: z.string().describe('Client 1 Date on Page 11'),

    // Page 11 - Client 2 (optional, only for 2-holder accounts)
    client2SignedP11: z.enum(['Yes', 'No', 'Error', 'N/A']).optional().describe('Is Client 2 Signature present on Page 11? Return N/A if only 1 account holder'),
    client2NameP11: z.string().optional().describe('Client 2 Name printed on Page 11 (only if 2 holders)'),
    client2DateP11: z.string().optional().describe('Client 2 Date on Page 11 (only if 2 holders)'),

    // Page 11 - Advisor
    advisorSignedP11: z.enum(['Yes', 'No', 'Error']).describe('Is Advisor Signature present on Page 11?'),
    advisorNameP11: z.string().describe('Advisor Name printed on Page 11'),
    advisorDateP11: z.string().describe('Advisor Date on Page 11'),

    // Page 12
    accountNumber: z.string().describe('Account Number'),

    // Page 13
    feeType: z.enum(['Flat', 'Tiered', 'Error']).describe('Fee Type (Flat/Tiered)'),
    feeAmount: z.string().describe('Fee Amount'),

    // Page 14 - Client 1
    clientSignedP14: z.enum(['Yes', 'No', 'Error']).describe('Is Client 1 Signature present on Page 14?'),
    clientNameP14: z.string().describe('Client 1 Name printed on Page 14'),
    clientDateP14: z.string().describe('Client 1 Date on Page 14'),

    // Page 14 - Client 2 (optional, only for 2-holder accounts)
    client2SignedP14: z.enum(['Yes', 'No', 'Error', 'N/A']).optional().describe('Is Client 2 Signature present on Page 14? Return N/A if only 1 account holder'),
    client2NameP14: z.string().optional().describe('Client 2 Name printed on Page 14 (only if 2 holders)'),
    client2DateP14: z.string().optional().describe('Client 2 Date on Page 14 (only if 2 holders)'),

    // Page 14 - Advisor
    advisorSignedP14: z.enum(['Yes', 'No', 'Error']).describe('Is Advisor Signature present on Page 14?'),
    advisorNameP14: z.string().describe('Advisor Name printed on Page 14'),
    advisorDateP14: z.string().describe('Advisor Date on Page 14'),
});

export type AdvisoryData = z.infer<typeof AdvisoryDataSchema>;

const advisoryPdfPrompt = ai.definePrompt({
    name: 'advisoryPdfPrompt',
    input: {
        schema: z.object({
            pdfData: z.string().describe('Base64 encoded PDF data of the client document'),
            referencePdfData: z.string().optional().describe('Base64 encoded PDF data of the TEMPLATE/REFERENCE document (IGO example)'),
        })
    },
    output: { schema: AdvisoryDataSchema },
    model: 'googleai/gemini-2.0-flash-exp',
    prompt: `You are an expert financial document analyst.

I am providing you with two things:
1. **REFERENCE TEMPLATE** (Optional): A standard "IGO" (In Good Order) agreement where required fields are marked with placeholders like "XXXXXX". Use this to understand EXACTLY where data should be located.
2. **CLIENT DOCUMENT**: The actual signed agreement you need to extract data from.

**CONTEXT:**
There are 16 different advisory agreement templates based on:
- Discretion: Discretionary OR Non-Discretionary
- Wrap: WRAP OR NON-WRAP (sometimes labeled Non-WRAP)
- Fee Type: Flat OR Tiered
- Account Holders: 1 OR 2

**IMPORTANT:** Forms with 2 account holders will have ADDITIONAL signature fields compared to forms with 1 account holder. If you only see one set of client signature fields, it's a 1-holder account. If you see two sets (e.g., "Client 1" and "Client 2" or "Joint Account Holder"), it's a 2-holder account.

**YOUR TASK:**
Compare the **CLIENT DOCUMENT** against the **REFERENCE TEMPLATE** (if provided). Extract the specific data points that correspond to the "XXXXXX" or blank fields in the template.

**FIELD EXTRACTION RULES (up to 29 FIELDS - depends on account holders):**

**PAGE 1:**
1. **discretionary**: Look for the "Discretionary" checkbox. If checked, return "Discretionary". If "Non-Discretionary" is checked, return "Non-Discretionary".
2. **wrap**: Look for the "Wrap" checkbox. If checked, return "WRAP". If "Non-Wrap" is checked, return "Non-WRAP".
3. **advisorName**: Investment Advisor Representative full name (top of page)
4. **repCode**: Representative code (top of page)
5. **clientName**: Client's full legal name (for 2 holders, include both names like "John Smith & Jane Smith")
6. **effectiveDate**: Effective date (MM/DD/YYYY)
7. **accountHolders**: Count the number of account holders. Look for joint account language or multiple signature blocks. Return 1 or 2.

**PAGE 10:**
8. **advReceivedDate**: Date ADV was received (MM/DD/YYYY)

**PAGE 11 - CLIENT 1 (3 fields):**
9. **clientSignedP11**: "Yes" if client 1 signature present, "No" if missing
10. **clientNameP11**: Client 1 name printed on page 11
11. **clientDateP11**: Client 1 signature date (MM/DD/YYYY)

**PAGE 11 - CLIENT 2 (3 fields - ONLY for 2-holder accounts):**
12. **client2SignedP11**: "Yes" if client 2 signature present, "No" if missing, "N/A" if only 1 holder
13. **client2NameP11**: Client 2 name printed on page 11 (skip if only 1 holder)
14. **client2DateP11**: Client 2 signature date (MM/DD/YYYY) (skip if only 1 holder)

**PAGE 11 - ADVISOR (3 fields):**
15. **advisorSignedP11**: "Yes" if advisor signature present, "No" if missing
16. **advisorNameP11**: Advisor name printed on page 11
17. **advisorDateP11**: Advisor signature date (MM/DD/YYYY)

**PAGE 12:**
18. **accountNumber**: Account/contract number

**PAGE 13:**
19. **feeType**: "Flat" or "Tiered" (Look for checked box or fee structure table)
20. **feeAmount**: Fee percentage or dollar amount (for Flat), or "Tiered" if there's a fee schedule table

**PAGE 14 - CLIENT 1 (3 fields):**
21. **clientSignedP14**: "Yes" if client 1 signature present, "No" if missing
22. **clientNameP14**: Client 1 name printed on page 14
23. **clientDateP14**: Client 1 signature date (MM/DD/YYYY)

**PAGE 14 - CLIENT 2 (3 fields - ONLY for 2-holder accounts):**
24. **client2SignedP14**: "Yes" if client 2 signature present, "No" if missing, "N/A" if only 1 holder
25. **client2NameP14**: Client 2 name printed on page 14 (skip if only 1 holder)
26. **client2DateP14**: Client 2 signature date (MM/DD/YYYY) (skip if only 1 holder)

**PAGE 14 - ADVISOR (3 fields):**
27. **advisorSignedP14**: "Yes" if advisor signature present, "No" if missing
28. **advisorNameP14**: Advisor name printed on page 14
29. **advisorDateP14**: Advisor signature date (MM/DD/YYYY)

- **RULE**: If you see ANY mark, signature, or name in the signature block, return "Yes". Only return "No" if it is completely blank.
- **RULE**: For "XXXXXX" placeholders in reference docs, note their location. In client docs, extract the actual data from those same locations.
- **RULE**: For 1-holder accounts, omit or return "N/A" for client2 fields. For 2-holder accounts, all client2 fields must be extracted.
- **SIGNATURE DETECTION**: E-signatures can appear as:
  * Handwritten scribbles or marks
  * Typed names (e.g., "John Smith")
  * "/s/ John Smith" format
  * Any visual mark in a signature field
  * If you see ANYTHING that looks like someone signed (even if it's just a line, scribble, or initials), return "Yes"
  * ONLY return "No" if the signature box is completely empty/blank
- **IMPORTANT**: Client AND Advisor signatures should be treated the same way. If there's any mark in an advisor signature field, it counts as "Yes".

**If a Reference Template is provided:**
- Pay close attention to the structure. The Client Document should match it.
- If the Client Document is a different version but contains the same data, extract it anyway but note that it might be an NIGO risk if the form is outdated (though for this task, just extract the data).

**Input Data:**
{{#if referencePdfData}}
Reference Template (IGO Example):
{{media url=referencePdfData}}
{{/if}}

Client Document to Analyze:
{{media url=pdfData}}

Extract the data now.`,
});

const analyzeAdvisoryPdfFlow = ai.defineFlow(
    {
        name: 'analyzeAdvisoryPdfFlow',
        inputSchema: z.object({
            pdfData: z.string(),
            referencePdfData: z.string().optional(),
        }),
        outputSchema: AdvisoryDataSchema,
    },
    async (input) => {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('The AI service is not configured. Set GEMINI_API_KEY.');
        }

        try {
            const { output } = await advisoryPdfPrompt({
                pdfData: input.pdfData,
                referencePdfData: input.referencePdfData,
            });

            return output || {
                discretionary: 'Error',
                wrap: 'Error',
                advisorName: 'Error',
                repCode: 'Error',
                clientName: 'Error',
                effectiveDate: 'Error',
                accountHolders: 1,
                advReceivedDate: 'Error',
                clientSignedP11: 'Error' as const,
                clientNameP11: 'Error',
                clientDateP11: 'Error',
                client2SignedP11: 'N/A' as const,
                client2NameP11: 'N/A',
                client2DateP11: 'N/A',
                advisorSignedP11: 'Error' as const,
                advisorNameP11: 'Error',
                advisorDateP11: 'Error',
                accountNumber: 'Error',
                feeType: 'Error' as const,
                feeAmount: 'Error',
                clientSignedP14: 'Error' as const,
                clientNameP14: 'Error',
                clientDateP14: 'Error',
                client2SignedP14: 'N/A' as const,
                client2NameP14: 'N/A',
                client2DateP14: 'N/A',
                advisorSignedP14: 'Error' as const,
                advisorNameP14: 'Error',
                advisorDateP14: 'Error',
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

        // Read Client PDF
        const pdfBuffer = await fs.readFile(filePath);
        const base64Pdf = pdfBuffer.toString('base64');
        const pdfDataUrl = `data:application/pdf;base64,${base64Pdf}`;

        // Read Reference PDF (if exists)
        let referencePdfDataUrl: string | undefined;
        const referenceDir = path.join(process.cwd(), 'src/ai/reference-docs');
        try {
            const files = await fs.readdir(referenceDir);
            // Just pick the first PDF found in reference-docs for now
            const refFile = files.find(f => f.toLowerCase().endsWith('.pdf'));
            if (refFile) {
                const refPath = path.join(referenceDir, refFile);
                console.log(`[PDF AI] Found reference template: ${refFile}`);
                const refBuffer = await fs.readFile(refPath);
                referencePdfDataUrl = `data:application/pdf;base64,${refBuffer.toString('base64')}`;
            }
        } catch (e) {
            console.warn('[PDF AI] No reference docs found or could not be read:', e);
        }

        console.log(`[PDF AI] Analyzing PDF with Gemini 2.0 Flash (${(pdfBuffer.length / 1024).toFixed(2)} KB)...`);

        // Analyze with Gemini
        const result = await analyzeAdvisoryPdfFlow({
            pdfData: pdfDataUrl,
            referencePdfData: referencePdfDataUrl
        });

        const filename = filePath.split('/').pop();
        console.log(`[PDF AI] ✓ Analysis complete for: ${filename}`);
        console.log(`[PDF AI] Results:`, JSON.stringify(result, null, 2));

        return result;
    } catch (error) {
        console.error(`[PDF AI] Error analyzing PDF ${filePath}:`, error);
        // Return all "Error" values on failure
        return {
            discretionary: 'Error',
            wrap: 'Error',
            advisorName: 'Error',
            repCode: 'Error',
            clientName: 'Error',
            effectiveDate: 'Error',
            accountHolders: 1,
            advReceivedDate: 'Error',
            clientSignedP11: 'Error' as const,
            clientNameP11: 'Error',
            clientDateP11: 'Error',
            client2SignedP11: 'N/A' as const,
            client2NameP11: 'N/A',
            client2DateP11: 'N/A',
            advisorSignedP11: 'Error' as const,
            advisorNameP11: 'Error',
            advisorDateP11: 'Error',
            accountNumber: 'Error',
            feeType: 'Error' as const,
            feeAmount: 'Error',
            clientSignedP14: 'Error' as const,
            clientNameP14: 'Error',
            clientDateP14: 'Error',
            client2SignedP14: 'N/A' as const,
            client2NameP14: 'N/A',
            client2DateP14: 'N/A',
            advisorSignedP14: 'Error' as const,
            advisorNameP14: 'Error',
            advisorDateP14: 'Error',
        };
    }
}
