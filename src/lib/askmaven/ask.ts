import { cosine, embed } from './embed';
import { loadKB } from './storage';

export type AskResult = { answer: string; evidence: string[] };

// Try to coerce strings like "$6,546.00" to numbers
function asNum(v: any) {
  if (typeof v === 'number') return v;
  const s = String(v ?? '').replace(/[$,%\s,]/g, '');
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : NaN;
}

// Pick the numeric columns from a row
function numericColumns(row: Record<string, any>) {
  return Object.keys(row).filter(k => Number.isFinite(asNum(row[k])));
}

export async function askMaven(question: string): Promise<AskResult> {
  const kb = await loadKB();
  if (!kb?.rows?.length) {
    return { answer: 'No uploaded data found. Run the report first.', evidence: [] };
  }

  // 1) Retrieve relevant rows to the free-form question
  const qVec = await embed(question);
  const ranked = kb.rows
    .map(x => ({ ...x, s: cosine(qVec, x.e) }))
    .sort((a, b) => b.s - a.s);

  const top = ranked.slice(0, 20);                 // evidence pool
  const evidence = top.slice(0, 8).map(x => x.t);  // compact receipts

  // 2) Lightweight, generic analysis (no presets)
  //    Aggregate over any numeric columns present in the evidence rows.
  const rows = top.map(x => x.r);
  const cols = rows.length ? numericColumns(rows[0]) : [];
  const summary: string[] = [];

  for (const col of cols) {
    const nums = rows.map(r => asNum(r[col])).filter(n => Number.isFinite(n));
    if (!nums.length) continue;

    const count = nums.length;
    const sum   = nums.reduce((a, b) => a + b, 0);
    const avg   = sum / count;
    const min   = Math.min(...nums);
    const max   = Math.max(...nums);

    summary.push(
      `${col}: count ${count}, sum ${sum.toLocaleString()}, avg ${avg.toLocaleString()}, min ${min.toLocaleString()}, max ${max.toLocaleString()}`
    );
  }

  // 3) Build a free-form answer with receipts
  const header = summary.length
    ? `Here’s a quick take based on the most relevant rows to your question:\n` +
      summary.join('\n')
    : `I pulled the most relevant rows to your question.`;

  const ans =
    header +
    `\n\nTop matches:\n` +
    evidence.join('\n');

  return { answer: ans, evidence };
}
