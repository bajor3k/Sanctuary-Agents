export const runtime = "nodejs";

import OpenAI from "openai";

// This is a placeholder, you should use a real OpenAI client if you have one.
// Since there's no openai library in package.json, this will cause an error if not handled.
// For now, we will mock the client.

const mockClient = {
  responses: {
    create: async (params: any) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mode = params.input.find((p: any) => p.role === "user").content.match(/OUTPUT REQUIREMENTS:\n(.*?)$/s)?.[1];
      
      let draft = "This is a mock response.";
      if (mode?.includes("simple")) {
        draft = "Subject: Mock Simple Response\n\nThis is a short and simple mock response."
      } else if (mode?.includes("bullets")) {
         draft = "Subject: Mock Bullet Points\n\nHere are some points:\n- Point 1\n- Point 2"
      } else if (mode?.includes("detailed")) {
         draft = "Subject: Mock Detailed Response\n\nThis is a longer, more detailed mock response that explains things thoroughly."
      }
      
      if (params.input.find((p: any) => p.role === "system")?.content.includes("0-100")) {
         return { output_text: String(Math.floor(Math.random() * 20) + 75) }; // confidence
      }

      return { output_text: draft };
    }
  }
}

const client = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY! }) 
  : mockClient as any;


type Mode = "simple" | "bullets" | "detailed";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { question, docs, mode = "simple", preferSeed } = body as {
      question?: string;
      docs?: Array<{ id?: string; title?: string; text?: string; page?: number }>;
      mode?: Mode;
      preferSeed?: string;
    };

    if (!process.env.OPENAI_API_KEY && !mockClient) return json({ error: "Missing OPENAI_API_KEY" }, 500);
    if (!question) return json({ error: "Missing 'question'." }, 400);

    // Prepare context
    const context = (docs ?? [])
      .slice(0, 6)
      .map((d, i) => `### Doc ${i + 1}${d.title ? `: ${d.title}` : ""}${d.page ? ` (p.${d.page})` : ""}\n${(d.text ?? "").slice(0, 4000)}`)
      .join("\n\n");

    const emailInstruction = buildEmailInstruction(mode);

    const system = [
      "You are an experienced operations associate at a US wealth-management firm.",
      "Write directly, professionally, and with zero fluff.",
      "Never invent procedures. Only use information from the provided documents when answering procedural questions.",
      "If the docs are insufficient, say so and keep the email short and actionable."
    ].join(" ");

    // Seed lets user nudge the draft after a 👎
    const user = [
      `QUESTION:\n${question}`,
      context ? `\n\nREFERENCE MATERIAL:\n${context}` : "",
      preferSeed ? `\n\nUSER CORRECTION / SEED (optional):\n${preferSeed}` : "",
      `\n\nOUTPUT REQUIREMENTS:\n${emailInstruction}`
    ].join("");

    const modelToUse = client === mockClient ? 'mock-model' : 'gpt-4o-mini';

    const resp = await client.responses.create({
      model: modelToUse,
      input: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    const draft = resp.output_text?.trim() ?? "";

    // quick self-score (optional; keeps your confidence badge fed)
    const scoreResp = await client.responses.create({
      model: modelToUse,
      input: [
        { role: "system", content: "Return only an integer 0-100 for confidence considering correctness, clarity, and doc-grounding." },
        { role: "user", content: draft }
      ],
    });

    const confidence = Number((scoreResp.output_text || "0").replace(/[^\d]/g, "")) || 80;

    const used = (docs ?? []).slice(0, 6).map(d => ({ id: d.id, title: d.title, page: d.page }));

    return json({ draft, sources: used, confidence });
  } catch (err: any) {
    console.error("API /generate error:", err);
    return json({ error: err?.message || "Server error" }, 500);
  }
}

function json(obj: any, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// ---------- MODED EMAIL PROMPT BUILDER ----------
function buildEmailInstruction(mode: "simple" | "bullets" | "detailed") {
  if (mode === "simple") {
    return [
      "Write a short email.",
      "Structure:",
      "- Subject: <clear subject>",
      "- Body: 2–4 concise sentences max.",
      "Tone: professional, plain English, no filler.",
      "No lists. No headers beyond Subject.",
      "If docs are insufficient, say so and state the next step in one sentence."
    ].join("\n");
  }

  if (mode === "bullets") {
    return [
      "Write an email with bullet-point instructions.",
      "Structure:",
      "- Subject: <clear subject>",
      "- Intro: 1 sentence max.",
      "- Bullets: actionable steps (• or -), each 1 line, ordered logically.",
      "- Optional closing: 1 short line.",
      "Include required forms, exact menu paths, and who to contact if applicable.",
      "Keep to 6–10 bullets. No long paragraphs."
    ].join("\n");
  }

  // detailed
  return [
    "Write a detailed email response.",
    "Structure:",
    "- Subject: <clear subject>",
    "- Opening: 1–2 sentences with the quick summary.",
    "- Numbered Steps: clear, complete, cite exact menu paths/fields, and required forms.",
    "- Notes: edge cases, approvals, or SLA caveats (if present in docs).",
    "- Closing: offer help / next action.",
    "Target length: 150–220 words. Avoid fluff.",
    "If information is missing in the docs, call it out explicitly and suggest the minimal next step."
  ].join("\n");
}
