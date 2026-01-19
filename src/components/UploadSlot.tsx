// components/UploadSlot.tsx
"use client";
import { useState } from "react";

type Props = {
  title: string;
  onUpload: (file: File | null) => Promise<void>; // your existing uploader
};

export default function UploadSlot({ title, onUpload }: Props) {
  const [status, setStatus] = useState<"idle" | "busy" | "success" | "error">("idle");
  const [err, setErr] = useState("");

  async function handleFile(file?: File) {
    if (!file) return;
    setStatus("busy"); setErr("");
    try {
      await onUpload(file);          // <-- plug in your upload logic
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3500); // auto-hide
    } catch (e: any) {
      setStatus("error"); setErr(e?.message || "Upload failed");
      setTimeout(() => setStatus("idle"), 4000);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-4">
      <div className="mb-2 text-sm opacity-80">{title}</div>

      <label className="block cursor-pointer rounded-xl border border-white/10 p-6 text-center hover:border-primary/50 hover:bg-muted/10 transition-colors">
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <div className="text-sm opacity-80">Drop file here</div>
        <div className="text-xs opacity-60">.xlsx, .xls, or .csv</div>
      </label>

      {status === "success" && (
        <p className="mt-2 text-xs font-semibold text-emerald-400" aria-live="polite">
          Success
        </p>
      )}
      {status === "error" && (
        <p className="mt-2 text-xs font-semibold text-red-400" aria-live="assertive">
          {err}
        </p>
      )}
    </div>
  );
}
