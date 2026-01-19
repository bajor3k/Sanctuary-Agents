/**
 * @fileOverview Schemas and types for the document analysis Genkit flow.
 */
import {z} from 'genkit';

// This file is currently not used by the active flow but is kept for potential future use
// if the document input is separated again.

export const DocumentInputSchema = z.object({
  name: z.string().describe('The name of the document.'),
  content: z.string().describe("The full text content of the document."),
});
export type DocumentInput = z.infer<typeof DocumentInputSchema>;

export const AnalyzeDocumentsInputSchema = z.object({
  question: z.string().describe("The user's question about the documents."),
  documents: z.array(DocumentInputSchema).describe('An array of documents to analyze.'),
});
export type AnalyzeDocumentsInput = z.infer<typeof AnalyzeDocumentsInputSchema>;

export const AnalyzeDocumentsOutputSchema = z.object({
  answer: z.string().describe('A comprehensive answer to the user\'s question, synthesized from the provided documents.'),
  sourceDocument: z.string().describe("The name of the single document most relevant to the answer."),
});
export type AnalyzeDocumentsOutput = z.infer<typeof AnalyzeDocumentsOutputSchema>;
