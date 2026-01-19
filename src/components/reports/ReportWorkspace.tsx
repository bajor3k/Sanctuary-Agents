// src/components/reports/ReportWorkspace.tsx
"use client";
import React from "react";
import { Brain, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  left: React.ReactNode;     // report table/cards
  right: React.ReactNode;    // AskMaven panel
  className?: string;
  isMavenOpen: boolean;
  setIsMavenOpen: (open: boolean) => void;
};

export default function ReportWorkspace({ left, right, className, isMavenOpen, setIsMavenOpen }: Props) {
  return (
    <div className={cn("report-card rounded-2xl p-0 overflow-hidden", className)}>
      <div className="flex min-h-[70vh]">
        {/* LEFT: report content */}
        <div className={cn(
          "flex-1 min-w-0 transition-all duration-300 ease-in-out",
          isMavenOpen ? "w-[calc(100%-400px)]" : "w-full"
        )}>
          <div className="p-4 h-full overflow-y-auto">
            {left}
          </div>
        </div>

        {/* RIGHT: AskMaven panel */}
        <aside
          className={cn(
            "border-l border-white/10 bg-transparent transition-all duration-300 ease-in-out shrink-0",
            isMavenOpen ? "w-[400px] opacity-100" : "w-12 opacity-90"
          )}
        >
          <div className="flex flex-col h-full">
            {isMavenOpen ? (
                // When OPEN, the content inside `right` (MavenChat) will have its own close button.
                 <div className="flex-1 min-h-0 relative">
                    <div className="h-full">{right}</div>
                </div>
            ) : (
                // When COLLAPSED, show only the brain icon as the trigger
                <button
                  className="w-full h-full flex items-center justify-center text-zinc-500 hover:text-zinc-300"
                  onClick={() => setIsMavenOpen(true)}
                  aria-label="Open Ask Maven"
                >
                  <Brain className="h-5 w-5" />
                </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
