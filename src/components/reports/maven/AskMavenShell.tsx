
"use client";
import { useEffect, useState } from "react";
import { Brain } from "lucide-react";
import { MavenChat } from "./MavenChat";

const KEY = "askmaven.open";

export default function AskMavenShell({
  onOpenChange,
}: {
  onOpenChange?: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(true);

  // Persist across navigations
  useEffect(() => {
    try {
        const saved = localStorage.getItem(KEY);
        if (saved !== null) setOpen(saved === "1");
    } catch(e) {
        // localStorage not available
    }
  }, []);
  
  useEffect(() => {
    try {
        localStorage.setItem(KEY, open ? "1" : "0");
    } catch(e) {
        // localStorage not available
    }
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  return (
    <>
      {open ? (
        <MavenChat onClose={() => setOpen(false)} />
      ) : null}

      {/* Floating brain appears only when closed */}
      {!open && (
        <button
          type="button"
          aria-label="Open Ask Maven"
          onClick={() => setOpen(true)}
          className="fixed right-4 top-1/2 -translate-y-1/2 z-30 rounded-full border border-white/10
                     bg-[#0c0c0c] p-3 shadow-lg hover:border-white/20"
        >
          <Brain className="h-5 w-5 opacity-80" />
        </button>
      )}
    </>
  );
}
