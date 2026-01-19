
"use client";

import { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import React from "react";
import { Upload, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type UploadCardProps = {
  file: File | null;
  onFileChange: (file: File | null) => void;
  dropzoneText?: string;
  className?: string;
  accept?: string;
  slot?: number;
};

export default function UploadCard({
  file,
  onFileChange,
  dropzoneText = "Drop file here",
  className,
  accept,
  slot,
}: UploadCardProps) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleFileChange = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        console.warn("File rejected:", fileRejections);
        setStatus("error");
        setTimeout(() => setStatus("idle"), 4000);
      }
      if (acceptedFiles.length > 0) {
        onFileChange(acceptedFiles[0]);
        setStatus("success");
        setTimeout(() => setStatus("idle"), 3500);
      }
    },
    [onFileChange]
  );
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileChange,
    multiple: false,
    accept: accept ? { 'application/vnd.ms-excel': ['.xls', '.xlsx'], 'text/csv': ['.csv'] } : undefined,
    noKeyboard: false,
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileChange(null);
    setStatus("idle");
  };
  
  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative flex flex-col items-center justify-center text-center gap-2",
        "rounded-2xl bg-card border",
        "px-6 py-5 cursor-pointer transition-colors",
        "hover:border-primary/50",
        isDragActive
          ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
          : "",
        className
      )}
      aria-label={`Upload file ${slot}`}
    >
      <input {...getInputProps()} />

      <div className="absolute top-2 left-0 right-0 flex items-center justify-center">
        {file ? (
          <button
            type="button"
            onClick={handleRemove}
            aria-label={`Remove file from slot ${slot}`}
            className="p-1 rounded hover:bg-destructive/10"
          >
            <Trash2 className="w-5 h-5 text-destructive" />
          </button>
        ) : (
          <Upload className="w-6 h-6 text-primary" />
        )}
      </div>

      {!file ? (
        <p className="mt-5 text-base font-semibold leading-tight text-foreground">
          {dropzoneText}
        </p>
      ) : (
        <p className="mt-6 text-sm font-medium text-primary leading-tight truncate max-w-full px-2">
          {file.name}
        </p>
      )}

      {status === "success" && file && (
        <p className="mt-1 text-xs font-semibold text-emerald-400 flex items-center gap-1" aria-live="polite">
          <CheckCircle className="h-3 w-3"/> Success
        </p>
      )}

      {status === "error" && (
         <p className="mt-1 text-xs font-semibold text-red-400 flex items-center gap-1" aria-live="polite">
          <AlertCircle className="h-3 w-3"/> Failed. Try again.
        </p>
      )}
    </div>
  );
}
