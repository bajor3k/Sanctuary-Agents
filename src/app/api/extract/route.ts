// src/app/api/extract/route.ts
export const runtime = "nodejs";
import pdfParse from "pdf-parse";

type DocChunk = { id: string; title: string; page?: number; text: string };

function chunkText(text: string, size = 1400, overlap = 150): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < text.length) {
    out.push(text.slice(i, i + size));
    i += size - overlap;
  }
  return out;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const files = form.getAll("files") as File[];
    if (!files || files.length === 0) {
      return Response.json({ error: "No files provided" }, { status: 400 });
    }

    const all: DocChunk[] = [];

    for (const f of files) {
      if (!f || f.type !== "application/pdf") continue;
      const buf = Buffer.from(await f.arrayBuffer());
      const parsed = await pdfParse(buf);

      // pdf-parse gives a single text blob. We’ll still label chunks by pseudo-page markers.
      // If you need exact page splits later, move to pdfjs-dist—this is good enough for now.
      const title = f.name.replace(/\.pdf$/i, "");
      const raw = parsed.text || "";
      const pages = raw.split(/\n\s*?\f\s*\n|\n(?=Page \d+\sof\s\d+)/gi); // weak page split fallback

      // If page split failed, chunk whole doc; else chunk per page.
      if (pages.length <= 1) {
        const chunks = chunkText(raw);
        chunks.forEach((t, idx) => {
          all.push({ id: crypto.randomUUID(), title: `${title} • chunk ${idx + 1}`, text: t });
        });
      } else {
        pages.forEach((pg, pIdx) => {
          chunkText(pg).forEach((t, cIdx) => {
            all.push({
              id: crypto.randomUUID(),
              title: `${title} • p.${pIdx + 1}`,
              page: pIdx + 1,
              text: t,
            });
          });
        });
      }
    }

    // Cap to something sane; you can tune this.
    const capped = all.slice(0, 60);
    return Response.json({ chunks: capped });
  } catch (e: any) {
    console.error("extract error:", e);
    return Response.json({ error: e?.message || "extract failed" }, { status: 500 });
  }
}
