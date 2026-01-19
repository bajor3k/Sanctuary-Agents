"use client";

import * as React from "react";
import { Upload } from "lucide-react"; // green icon to match your drop cards
import { Button } from "@/components/ui/button";

type Props = {
  /** keep the button aesthetic (no native picker) */
  disablePicker?: boolean;
  /** what to do on click (e.g., open modal) */
  onClick?: () => void;
  className?: string;
};

export default function UploadBrowse({ disablePicker = true, onClick, className = "" }: Props) {
  const kill = (e: React.SyntheticEvent) => { e.preventDefault(); e.stopPropagation(); };

  return (
    <Button
      type="button"
      onClick={(e) => { kill(e); onClick?.(); }}   // <-- open your modal
      onMouseDown={kill}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); onClick?.(); } }}
      aria-disabled="false"
      className={`rounded-full bg-[#0c0c0c] hover:bg-[#121212] text-white px-4 h-9 shadow-none border-0 ${className}`}
    >
      <Upload className="mr-2 h-4 w-4 text-emerald-400" aria-hidden />
      Browse
    </Button>
  );
}
