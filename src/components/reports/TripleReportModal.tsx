"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle2, AlertTriangle, Trash2 } from "lucide-react";

/** REQUIRED REPORTS (edit labels/patterns to match your exports) */
const REQUIRED: Array<{
  id: "positions" | "activity" | "fees";
  label: string;
  patterns: RegExp[];          // filename matchers to auto-recognize
}> = [
  { id: "positions", label: "Household Positions", patterns: [/position/i, /positions/i] },
  { id: "activity",  label: "Account Activity",    patterns: [/activity/i, /txn|transaction/i] },
  { id: "fees",      label: "Fee Schedule",        patterns: [/fee/i, /schedule/i] },
];

const ACCEPT = ".xlsx,.xls";   // add ".csv" if needed

type TripleFiles = { positions?: File; activity?: File; fees?: File };

export default function TripleReportModal({
  open,
  onOpenChange,
  onComplete,
  title = "SELECT FILES",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onComplete: (files: { positions: File; activity: File; fees: File }) => void;
  title?: string;
}) {
  const [files, setFiles] = React.useState<TripleFiles>({});
  const [unknown, setUnknown] = React.useState<File[]>([]); // files we couldn't auto-map
  const inputRef = React.useRef<HTMLInputElement>(null);

  const ready = Boolean(files.positions && files.activity && files.fees);

  const reset = () => { setFiles({}); setUnknown([]); };

  const openPicker = () => inputRef.current?.click();

  function acceptFileList(list: FileList | null) {
    if (!list?.length) return;
    const incoming = Array.from(list);
    for (const f of incoming) placeFile(f);
  }

  /** Try to auto-place a file by filename; if ambiguous, put it in the Unknown queue. */
  function placeFile(file: File) {
    const name = file.name.toLowerCase();
    let matchedId: TripleFiles[keyof TripleFiles] | keyof TripleFiles | null = null;

    for (const r of REQUIRED) {
      if (files[r.id]) continue; // already filled
      if (r.patterns.some(rx => rx.test(name))) {
        matchedId = r.id;
        break;
      }
    }

    if (matchedId && (matchedId === "positions" || matchedId === "activity" || matchedId === "fees")) {
      setFiles(prev => ({ ...prev, [matchedId!]: file }));
    } else {
      setUnknown(prev => [...prev, file]);
    }
  }

  /** Manually assign an unknown file */
  function assignUnknown(index: number, targetId: "positions" | "activity" | "fees") {
    const f = unknown[index];
    if (!f) return;
    setFiles(prev => ({ ...prev, [targetId]: f }));
    setUnknown(prev => prev.filter((_, i) => i !== index));
  }

  /** Remove a placed file */
  function clearSlot(targetId: "positions" | "activity" | "fees") {
    setFiles(prev => ({ ...prev, [targetId]: undefined }));
  }

  // Auto-close & return when ready (optional: comment out if you prefer a Continue button)
  React.useEffect(() => {
    if (!open || !ready) return;
    const t = setTimeout(() => {
      onComplete({ positions: files.positions!, activity: files.activity!, fees: files.fees! });
      onOpenChange(false);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-3xl bg-[#0b0b0b] text-white border-0">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-white/70 -mt-1 mb-3">
          Upload <b>three separate Excel files</b> required for this Test report.
        </p>

        {/* Big central drop area */}
        <div
          className="rounded-2xl bg-[#0c0c0c] border-0 px-5 py-10 flex flex-col items-center justify-center text-center cursor-pointer"
          onClick={openPicker}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); acceptFileList(e.dataTransfer.files); }}
          aria-label="Browse or Drop File"
        >
          <Upload className="h-7 w-7 text-emerald-400 mb-2" />
          <div className="text-sm font-medium text-white/90">Browse or Drop File</div>
          <div className="text-xs text-white/55 mt-1">Accepted: {ACCEPT.replaceAll(".", "").toUpperCase()}</div>

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            multiple
            className="hidden"
            onChange={(e) => { acceptFileList(e.target.files); e.currentTarget.value = ""; }}
          />
        </div>

        {/* Status list for the three required reports */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          {REQUIRED.map(({ id, label }) => {
            const file = files[id as keyof TripleFiles] as File | undefined;
            const ok = Boolean(file);
            return (
              <div key={id} className="rounded-xl bg-[#0c0c0c] border-0 px-3 py-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-white/90">{label}</div>
                  {ok ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                  )}
                </div>
                <div className="text-xs text-white/60 truncate mt-1">
                  {ok ? file!.name : "Not uploaded"}
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 rounded-full"
                    onClick={() => openPicker()}
                  >
                    {ok ? "Replace" : "Browse"}
                  </Button>
                  {ok && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 rounded-full"
                      onClick={() => clearSlot(id as any)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Clear
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Unknown files that need manual mapping */}
        {!!unknown.length && (
          <div className="mt-4 rounded-xl bg-[#0c0c0c] px-3 py-3">
            <div className="text-sm font-medium text-white/90 mb-2">Unrecognized files</div>
            <div className="space-y-2">
              {unknown.map((f, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <div className="text-xs text-white/70 truncate">{f.name}</div>
                  <div className="flex gap-2">
                    {REQUIRED.filter(r => !files[r.id as keyof TripleFiles]).map(r => (
                      <Button
                        key={r.id}
                        size="sm"
                        className="h-8 rounded-full"
                        onClick={() => assignUnknown(i, r.id as any)}
                      >
                        Map to {r.label}
                      </Button>
                    ))}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 rounded-full"
                      onClick={() => setUnknown(prev => prev.filter((_, j) => j !== i))}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="mt-2">
          <div className="text-xs text-white/60 mr-auto">
            {Number(!!files.positions) + Number(!!files.activity) + Number(!!files.fees)}/3 uploaded
          </div>
          <Button variant="secondary" className="rounded-full" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}