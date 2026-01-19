// This component is no longer used and can be deleted.
// The functionality has been merged into UploadCard.tsx to keep the dropzone visible after upload.
import React from "react";
import { cn } from "@/lib/utils";

type UploadedFileDisplayProps = {
  name: string;
  onReplace?: () => void;
  onRemove?: () => void;
  successText?: string;
  hasError?: boolean;
};

export function UploadedFileDisplay({
  name,
  onReplace,
  onRemove,
  successText = "File uploaded successfully.",
  hasError = false,
}: UploadedFileDisplayProps) {
  return (
    <div className="flex flex-col gap-1 p-0 m-0 bg-transparent border-0 shadow-none outline-none ring-0">
      <div className="text-sm md:text-base font-medium text-white/90 leading-tight">
        {name}
      </div>

      <div className={cn(
        "text-xs md:text-sm leading-tight",
        hasError ? "text-red-400" : "text-[var(--success-green,#22c55e)]"
      )}>
        {successText}
      </div>

      <div className="file-actions">
        {onRemove && (
          <button
            className="icon-btn danger remove-btn"
            title="Remove file"
            aria-label="Remove file"
            onClick={onRemove}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 3h6m-8 3h10m-1 0-.8 13.2a2 2 0 0 1-2 1.8H9.8a2 2 0 0 1-2-1.8L7 6"
                    stroke="#e5e7eb" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        {onReplace && (
          <button
            type="button"
            onClick={onReplace}
            className="link-btn"
          >
            Replace
          </button>
        )}
      </div>
    </div>
  );
}
