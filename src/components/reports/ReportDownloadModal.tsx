// src/components/reports/ReportDownloadModal.tsx
"use client";

import React, { useRef, useState } from "react";
import { CheckCircle2, Trash2, Upload } from "lucide-react";

type ReportDownloadModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (files: File[]) => void;
  requiredFileCount?: number;
  title?: string;
};

const ACCEPT =
  ".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel";

export default function ReportDownloadModal({
  open,
  onOpenChange,
  onComplete,
  requiredFileCount = 1,
  title = "Select Files"
}: ReportDownloadModalProps) {
  const [files, setFiles] = useState<(File | null)[]>(Array(requiredFileCount).fill(null));
  const inputRefs = Array.from({ length: requiredFileCount }, () => useRef<HTMLInputElement>(null));

  const allSelected = files.every(Boolean);

  const pick = (ref: React.RefObject<HTMLInputElement>) => ref.current?.click();

  const onPick =
    (index: number) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      setFiles(prev => {
        const newFiles = [...prev];
        newFiles[index] = file;
        return newFiles;
      });
    };

  const clear = (index: number) => {
    setFiles(prev => {
        const newFiles = [...prev];
        newFiles[index] = null;
        return newFiles;
    });
    const ref = inputRefs[index];
    if (ref.current) ref.current.value = "";
  };
  
  const resetAndClose = () => {
    setFiles(Array(requiredFileCount).fill(null));
    onOpenChange(false);
  }

  const done = () => {
    const validFiles = files.filter(f => f !== null) as File[];
    if (validFiles.length === requiredFileCount) {
      onComplete(validFiles);
      resetAndClose();
    }
  };

  return (
     <div className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={resetAndClose} />

      {/* Modal */}
      <div className="relative w-[720px] max-w-[92vw] rounded-2xl border border-border bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-foreground tracking-wide">{title.toUpperCase()}</h2>
          <button
            onClick={resetAndClose}
            className="text-muted-foreground hover:text-foreground transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* CONTENT */}
        <div className="px-5 pt-5 pb-3">
          <div className={`grid grid-cols-1 gap-4 md:grid-cols-${requiredFileCount > 1 ? '3' : '1'}`}>
            {Array.from({ length: requiredFileCount }).map((_, index) => (
                <FileTile
                    key={index}
                    label={`File ${index + 1}`}
                    file={files[index]}
                    onPick={() => pick(inputRefs[index])}
                    onClear={() => clear(index)}
                />
            ))}
          </div>

          {/* Hidden inputs */}
          {inputRefs.map((ref, index) => (
             <input key={index} ref={ref} type="file" accept={ACCEPT} onChange={onPick(index)} className="hidden" />
          ))}

          {/* Progress hint */}
          <div className="mt-4 text-sm text-muted-foreground">
            {files.filter(Boolean).length}/{requiredFileCount} uploaded
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border">
          <button
            onClick={resetAndClose}
            className="px-4 py-2 rounded-full border border-border bg-background text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            onClick={done}
            disabled={!allSelected}
            className={`px-4 py-2 rounded-full border border-border bg-background transition text-foreground disabled:text-muted-foreground disabled:cursor-not-allowed`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function FileTile({
  label,
  file,
  onPick,
  onClear,
}: {
  label: string;
  file: File | null;
  onPick: () => void;
  onClear: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-foreground">{label}</span>
        {file ? (
          <button onClick={onClear} className="text-muted-foreground hover:text-destructive transition-colors p-1 -mr-1" aria-label="Clear file">
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {/* Clickable area */}
      <button
        onClick={onPick}
        className="w-full rounded-lg border border-border bg-card px-3 py-10 text-center text-muted-foreground hover:text-foreground transition flex flex-col items-center justify-center"
      >
        {file ? (
          <span className="block truncate text-foreground">{file.name}</span>
        ) : (
          <>
            <Upload className="h-6 w-6 mb-2" />
            <span className="block">Browse</span>
          </>
        )}
      </button>
      
      {file && (
        <div className="mt-2 flex items-center justify-center gap-1 text-xs font-semibold text-emerald-400" aria-live="polite">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Success</span>
        </div>
      )}
    </div>
  );
}
