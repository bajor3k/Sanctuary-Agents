
'use server';
/**
 * @fileOverview A Genkit flow to analyze portfolio items, focusing on missed opportunities.
 *
 * - analyzePortfolioItems - A function that calls the Genkit flow to analyze portfolio items.
 * - PortfolioItem - The type for an individual portfolio item.
 * - AnalyzePortfolioInput - The type for the input to the analysis flow.
 * - AnalyzePortfolioOutput - The type for the output from the analysis flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PortfolioItemSchema = z.object({
  ticker: z.string().describe('The stock ticker symbol.'),
  name: z.string().describe('The name of the asset or fund.'),
  category: z.string().describe('The category of the asset (e.g., Equity, Fixed Income).'),
  value: z.string().describe('The current market value of the holding.'),
  weight: z.string().describe('The weight of this holding in the portfolio.'),
  ytdReturn: z.string().describe('The Year-to-Date return of the holding.'),
});
export type PortfolioItem = z.infer<typeof PortfolioItemSchema>;

const AnalyzePortfolioInputSchema = z.object({
  portfolioId: z.string().optional().describe('The ID of the portfolio being analyzed.'),
  missedOpportunities: z.array(PortfolioItemSchema).describe('An array of portfolio items identified as missed opportunities or underperforming assets.'),
});
export type AnalyzePortfolioInput = z.infer<typeof AnalyzePortfolioInputSchema>;

const AnalyzePortfolioOutputSchema = z.object({
  analysis: z.string().describe('A textual analysis providing insights or suggestions regarding the provided portfolio items.'),
});
export type AnalyzePortfolioOutput = z.infer<typeof AnalyzePortfolioOutputSchema>;

export async function analyzePortfolioItems(input: AnalyzePortfolioInput): Promise<AnalyzePortfolioOutput> {
  return analyzePortfolioFlow(input);
}

const portfolioAnalysisPrompt = ai.definePrompt({
  name: 'portfolioAnalysisPrompt',
  input: {schema: AnalyzePortfolioInputSchema},
  output: {schema: AnalyzePortfolioOutputSchema},
  prompt: `You are Maven, an expert financial analyst AI.
You have been provided with a list of portfolio items that are considered "missed opportunities" or are underperforming.
Your task is to provide a concise analysis for portfolio ID: {{portfolioId}}. If no portfolio ID is provided, state that the analysis is for a general set of items.

Focus on the following items:
{{#each missedOpportunities}}
- Asset: {{name}} ({{ticker}})
  Category: {{category}}
  YTD Return: {{ytdReturn}}
  Portfolio Weight: {{weight}}
  Current Value: {{value}}
{{/each}}

Based on this data, provide:
1. A brief, high-level summary of the situation.
2. Identify any common themes or potential reasons for underperformance if discernible from the data (e.g., sector concentration, market trends affecting specific categories).
3. Suggest 1-2 general areas for the advisor to investigate further for these holdings.

Keep your analysis professional, insightful, and actionable. Do not give specific financial advice to buy or sell.
Your output must be a single string under the 'analysis' field.
`,
});

const analyzePortfolioFlow = ai.defineFlow(
  {
    name: 'analyzePortfolioFlow',
    inputSchema: AnalyzePortfolioInputSchema,
    outputSchema: AnalyzePortfolioOutputSchema,
  },
  async (input) => {
    const {output} = await portfolioAnalysisPrompt(input);
    if (!output) {
      return { analysis: "Could not generate analysis at this time." };
    }
    return output;
  }
);
