// src/app/api/reports/3m-cash/merge/route.ts
import { type NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

export const runtime = "nodejs";

async function fileToRows(f: File) {
  const buf = Buffer.from(await f.arrayBuffer());
  // Read first sheet (CSV or XLSX both supported)
  const wb = XLSX.read(buf, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: "" });
}

const norm = (v: any) => String(v ?? "").trim();

export async function POST(req: NextRequest) {
  try {
    const fd = await req.formData();
    const fileA = fd.get("fileA") as File | null; // PYCASH1
    const fileB = fd.get("fileB") as File | null; // PYCASH2
    const fileC = fd.get("fileC") as File | null; // PYPI

    if (!fileA || !fileB || !fileC) {
      return NextResponse.json({ error: "Missing required files" }, { status: 400 });
    }

    // Parse rows
    const [rowsA, rowsB, rowsC] = await Promise.all([fileToRows(fileA), fileToRows(fileB), fileToRows(fileC)]);

    // Combine the two cash files
    const cash = [...rowsA, ...rowsB].map(r => ({ ...r, Account: norm((r as any).Account) }));

    // Map PYPI by Account
    const pypiMap = new Map<string, Record<string, any>>();
    for (const r of rowsC) pypiMap.set(norm((r as any).Account), { ...r });

    // Outer join on Account, suffix collisions with _pypi
    const merged: Record<string, any>[] = [];
    const seen = new Set<string>();

    for (const base of cash) {
      const key = norm(base.Account);
      const out: Record<string, any> = { ...base };
      const extra = pypiMap.get(key);
      if (extra) {
        for (const [k, v] of Object.entries(extra)) {
          if (k === "Account") continue;
          if (out[k] === undefined) out[k] = v;
          else out[`${k}_pypi`] = v;
        }
      }
      merged.push(out);
      seen.add(key);
    }

    // Add PYPI rows that had no match
    for (const [key, extra] of pypiMap.entries()) {
      if (seen.has(key)) continue;
      const out: Record<string, any> = { Account: key, ...extra };
      merged.push(out);
    }

    // Build workbook
    const ws = XLSX.utils.json_to_sheet(merged);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Merged_3M_Cash_Report");

    const format = req.nextUrl.searchParams.get("format") || "json";
    if (format === "xlsx") {
      const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
      return new NextResponse(buf, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="merged_report.xlsx"',
          "Cache-Control": "no-store",
        },
      });
    }

    // The old Python response returned {ok: true, rows: ...}, but the new one returns the JSON directly.
    // The client component (`ReportScaffold`) is already set up to handle a direct JSON array response.
    return NextResponse.json(merged);
  } catch (e: any) {
    return NextResponse.json(
      { error: "Merge failed", details: String(e?.message || e) },
      { status: 500 }
    );
  }
}
