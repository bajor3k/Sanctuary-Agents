'use server';
/**
 * @fileOverview A Genkit flow to analyze a collection of documents based on a user's question.
 *
 * - analyzeDocuments - A function that calls the Genkit flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import pdf from "pdf-parse";

// Define a structure to hold both the URL and a clean name for each document.
const PDF_SOURCES = [
    {
        name: "Advisor Services Procedure Guide",
        url: "https://firebasestorage.googleapis.com/v0/b/matrix-y2jfw.firebasestorage.app/o/Advisor%20Services%20Procedure%20Guide.pdf?alt=media&token=7d2e1990-7ffd-4898-ad4a-d9a4271d80bd",
    },
    {
        name: "Asset Movement Grid",
        url: "https://firebasestorage.googleapis.com/v0/b/matrix-y2jfw.firebasestorage.app/o/Asset%20Movement%20Grid%20%26%20LOA%20Signature%20Requirements.pdf?alt=media&token=370d46e3-c0e2-4a03-8d3b-98ee43832544",
    },
    {
        name: "Asset Movement Procedure Guide",
        url: "https://firebasestorage.googleapis.com/v0/b/matrix-y2jfw.firebasestorage.app/o/Asset%20Movement%20Procedure%20Guide%20(3).pdf?alt=media&token=a5a1a06f-0969-4441-8d78-34c17411834f",
    },
];

// ---- helpers (add near top of the file) ----
function chunkText(txt: string, size = 1400, overlap = 180): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < txt.length) {
    out.push(txt.slice(i, i + size));
    i += size - overlap;
  }
  return out;
}

function tokenize(s: string) {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

// simple keyword score (BM25-lite)
function scoreChunk(qTokens: string[], chunk: string) {
  const tks = tokenize(chunk);
  if (!tks.length) return 0;
  let score = 0;
  const counts: Record<string, number> = {};
  for (const t of tks) counts[t] = (counts[t] || 0) + 1;
  for (const q of qTokens) {
    if (counts[q]) score += Math.log(1 + counts[q]);
  }
  // light length normalization
  return score / Math.sqrt(tks.length);
}

type PageChunk = { docName: string; pageApprox?: number; text: string };

// ---- caching (actually used) ----
let cachedDocuments: Array<{ name: string; raw: string }> | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 min

async function fetchAllPdfs(): Promise<Array<{name: string; raw: string}>> {
  // use cache if fresh
  if (cachedDocuments && cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
    return cachedDocuments;
  }

  const docs = await Promise.all(
    PDF_SOURCES.map(async (source) => {
      const res = await fetch(source.url, { cache: "no-store" });
      if (!res.ok) {
        throw Object.assign(
          new Error(`Failed to fetch ${source.url}: ${res.status} ${res.statusText}`),
          { documentName: source.name }
        );
      }
      const buf = Buffer.from(await res.arrayBuffer());
      const parsed = await pdf(buf); // pdf-parse returns one big text blob
      const raw = (parsed.text || "").trim();
      return { name: source.name, raw };
    })
  );

  cachedDocuments = docs;
  cacheTimestamp = Date.now();
  return docs;
}

// Build per-doc chunks with approximate page labels
function buildChunks(docs: Array<{name: string; raw: string}>): PageChunk[] {
  const chunks: PageChunk[] = [];
  for (const d of docs) {
    // try a page-ish split; if it fails, just chunk all
    const pages = d.raw.split(/\f|\n\s*Page\s+\d+(\s+of\s+\d+)?\s*\n/gi);
    if (pages.length <= 1) {
      const cs = chunkText(d.raw);
      cs.forEach((t, i) => chunks.push({ docName: d.name, pageApprox: i + 1, text: t }));
    } else {
      pages.forEach((p, idx) => {
        chunkText(p).forEach((t) => chunks.push({ docName: d.name, pageApprox: idx + 1, text: t }));
      });
    }
  }
  return chunks;
}

// Rank chunks by the question and return top K
function selectTopK(chunks: PageChunk[], question: string, k = 12): PageChunk[] {
  const qTokens = tokenize(question);
  const scored = chunks
    .map(c => ({ c, s: scoreChunk(qTokens, c.text) }))
    .filter(x => x.s > 0)                // drop obviously irrelevant
    .sort((a, b) => b.s - a.s)
    .slice(0, k)
    .map(x => x.c);
  // backstop: if nothing scores > 0, just take first few chunks
  return scored.length ? scored : chunks.slice(0, Math.min(k, chunks.length));
}

const DocumentPageSchema = z.object({
  pageNumber: z.number(),
  content: z.string(),
});

const DocumentSchema = z.object({
  name: z.string().describe('The name of the document.'),
  pages: z.array(DocumentPageSchema).describe("The content of the document, split by page."),
});

const AnalyzeDocumentsInputSchema = z.object({
  question: z.string().describe("The user's question about the documents."),
  mode: z.enum(["simple", "bullets", "detailed"]).describe("The desired format for the answer."),
});
export type AnalyzeDocumentsInput = z.infer<typeof AnalyzeDocumentsInputSchema>;

const AnalyzeDocumentsOutputSchema = z.object({
  answer: z.string().describe('A comprehensive answer to the user\'s question, synthesized from the provided documents.'),
  sourceDocument: z.object({
      name: z.string().describe("The name of the single document most relevant to the answer."),
      pageNumber: z.number().describe("The page number within the source document where the information was found."),
      url: z.string().describe("The public URL of the source document."),
      quote: z.string().describe("The exact quote from the source document used to generate the answer."),
  }),
  confidence: z.number().describe('A score from 0 to 100 representing the confidence in the answer.'),
});
export type AnalyzeDocumentsOutput = z.infer<typeof AnalyzeDocumentsOutputSchema>;


export async function analyzeDocuments(input: AnalyzeDocumentsInput): Promise<AnalyzeDocumentsOutput> {
  return analyzeDocumentsFlow(input);
}

async function getDocumentsAsPages(question: string): Promise<z.infer<typeof DocumentSchema>[]> {
  try {
    const fetched = await fetchAllPdfs();
    const allChunks = buildChunks(fetched);
    const top = selectTopK(allChunks, question, 12); // keep small for token safety

    // Convert selected chunks back into the schema you already use
    // We’ll group chunks by document name and synthesize "pages"
    const grouped: Record<string, { name: string; pages: Array<{pageNumber: number; content: string}> }> = {};
    for (const t of top) {
      if (!grouped[t.docName]) grouped[t.docName] = { name: t.docName, pages: [] };
      grouped[t.docName].pages.push({
        pageNumber: t.pageApprox ?? 1,
        content: t.text,
      });
    }
    // Limit pages per doc to keep prompt tight
    const docs = Object.values(grouped).map(d => ({
      name: d.name,
      pages: d.pages.slice(0, 6),
    }));

    return docs;
  } catch (error: any) {
    console.error("Error fetching or parsing PDFs:", error);
    throw new Error(
      `Sorry, I couldn't access the procedure documents. Error: ${error.documentName || "Unknown Document"} — ${error.message}`
    );
  }
}

function buildEmailInstruction(mode: "simple" | "bullets" | "detailed"): string {
  switch (mode) {
    case "simple":
      return `Write a short email:
- Subject line
- 2–4 concise sentences in the body. No lists.`;
    case "bullets":
      return `Write an email with bullet-point instructions:
- Subject line
- 1-sentence intro
- Bulleted steps with exact menu paths/forms`;
    case "detailed":
      return `Write a detailed email:
- Subject line
- Numbered steps with exact paths/fields/forms
- Notes for caveats/approvals if present`;
    default:
      return `Write an email with bullet-point instructions:
- Subject line
- 1-sentence intro
- Bulleted steps with exact menu paths/forms`;
  }
}


const documentAnalysisPrompt = ai.definePrompt({
  name: 'documentAnalysisPrompt',
  input: {schema: z.object({
      question: z.string(),
      documents: z.array(DocumentSchema),  // already reduced top-K
      outputFormat: z.string(),
  })},
  output: {schema: z.object({
    answer: z.string(),
    sourceDocumentName: z.string(),
    sourcePageNumber: z.number(),
    quote: z.string(),
    confidence: z.number(),
  })},
  prompt: `You are an expert financial-services operations assistant. Use only the documents below.

OUTPUT FORMAT:
{{{outputFormat}}}

After the email, determine:
- sourceDocumentName (the single best doc)
- sourcePageNumber (page number shown below, or best approximation)
- quote (verbatim sentence(s) from that page that supports the answer)
- confidence (0–100)

User Question:
"{{question}}"

Documents (already filtered to the most relevant chunks):
{{#each documents}}
---
Document Name: {{name}}
{{#each pages}}
Page: {{pageNumber}}
{{{content}}}
{{/each}}
---
{{/each}}
`,
});

const analyzeDocumentsFlow = ai.defineFlow(
  {
    name: 'analyzeDocumentsFlow',
    inputSchema: AnalyzeDocumentsInputSchema,
    outputSchema: AnalyzeDocumentsOutputSchema,
  },
  async (input) => {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
      throw new Error("The AI service is not configured. Set GEMINI_API_KEY.");
    }

    // Pull ranked pages only
    const documents = await getDocumentsAsPages(input.question);

    if (!documents.length) {
      return {
        answer: "No readable content was found in the procedure documents.",
        sourceDocument: { name: "", pageNumber: 0, url: "", quote: "" },
        confidence: 0,
      };
    }

    // Build the instruction text based on the mode
    const outputFormat = buildEmailInstruction(input.mode);

    const { output } = await documentAnalysisPrompt({
      question: input.question,
      documents,
      outputFormat,
    });

    // Guard against empty/invalid model output
    const bestName = output?.sourceDocumentName || "";
    const srcMeta = PDF_SOURCES.find(s => s.name === bestName);

    return {
      answer: output?.answer || "I couldn't form an answer from the provided chunks.",
      sourceDocument: {
        name: bestName,
        pageNumber: Number(output?.sourcePageNumber || 0),
        url: srcMeta?.url || "",
        quote: output?.quote || "",
      },
      confidence: Number(output?.confidence || 0),
    };
  }
);
