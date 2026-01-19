// components/reports/InsightsChatCard.tsx
"use client";

import React from "react";
import { Send } from "lucide-react";

export default function InsightsChatCard({
  className,
  messages = [],
  onAsk,
  fixedHeightClass = "h-[360px] md:h-[420px]", // fixed height—scroll inside
}: {
  className?: string;
  messages?: Array<{ role: "user" | "assistant"; content: string }>;
  onAsk?: (q: string) => void;
  fixedHeightClass?: string;
}) {
  const [q, setQ] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  // Always scroll to latest message
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  return (
    <section
      className={[
        "rounded-2xl border bg-white dark:bg-[#101010]",
        "border-[#e5e7eb] dark:border-white/10",
        "flex flex-col overflow-hidden",
        fixedHeightClass,
        className || "",
      ].join(" ")}
      aria-label="Ask about this report"
    >
      {/* Scrollable conversation */}
      <div
        ref={scrollRef}
        className="
          flex-1 min-h-0 overflow-y-auto
          px-3 md:px-4 pt-3 pb-2
          space-y-3 md:space-y-4
        "
      >
        {messages.length === 0 ? (
          <div className="text-sm md:text-base text-black/60 dark:text-white/60">
            Ask a question about the report (fees, accounts, flagged short, etc.).
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={
                // Keep bubbles away from edges via container padding; align by role
                m.role === "user"
                  ? "w-full flex justify-end"
                  : "w-full flex justify-start"
              }
            >
              <p
                className={[
                  // Minimal bubble (theme-aware)
                  "inline-block max-w-[92%] md:max-w-[80%] px-3.5 py-2.5 rounded-xl",
                  "border border-[#e5e7eb] dark:border-white/10",
                  m.role === "user"
                    ? "bg-[#f2f3f5] text-[#111827] dark:bg-[#171717] dark:text-white"
                    : "bg-[#fcfbfb] text-[#111827] dark:bg-[#121212] dark:text-white/90",
                  "whitespace-pre-wrap break-words leading-relaxed",
                  // Small breathing room so the bubble never kisses the card edge
                  m.role === "user" ? "mr-0.5" : "ml-0.5",
                ].join(" ")}
              >
                {m.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Composer pinned bottom */}
      <form
        className="mt-1 md:mt-2 flex items-center gap-2 px-2 pb-2"
        onSubmit={(e) => {
          e.preventDefault();
          const val = q.trim();
          if (!val) return;
          onAsk?.(val);
          setQ("");
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ask a question about the data…"
          className="
            flex-1 rounded-xl h-11 md:h-12 px-3 md:px-4
            bg-white dark:bg-[#0f0f0f]
            text-[#111827] dark:text-white
            placeholder-black/55 dark:placeholder-white/60
            border border-[#e5e7eb] dark:border-white/10
            outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10
          "
        />
        <button
          type="submit"
          disabled={!q.trim()}
          aria-label="Ask"
          className="
            inline-flex items-center gap-2 rounded-full h-11 md:h-12 px-4
            bg-black/85 text-white dark:bg-white/10 dark:text-white
            hover:bg-black dark:hover:bg-white/15
            border border-black/10 dark:border-white/10
            disabled:opacity-55 disabled:cursor-not-allowed
          "
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Ask</span>
        </button>
      </form>
    </section>
  );
}
