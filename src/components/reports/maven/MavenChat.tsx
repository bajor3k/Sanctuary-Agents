
"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { askMaven } from "@/lib/askmaven/ask";

export function MavenChat({ onClose, initialMessage }: { onClose: () => void; initialMessage?: string }) {
  const [msg, setMsg] = useState("");
  // TODO: wire messages state to your backend
  const [messages, setMessages] = useState<{ id: string; role: "user" | "assistant"; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const handleAsk = async (question: string) => {
    if (!question) return;
    setLoading(true);
    setMessages(prev => [...prev, { id: String(Date.now()), role: 'user', text: question }]);
    try {
      const result = await askMaven(question);
      setMessages(prev => [...prev, { id: String(Date.now()), role: 'assistant', text: result.answer }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { id: String(Date.now()), role: 'assistant', text: "Sorry, I had trouble with that question." }]);
    } finally {
      setLoading(false);
    }
  }

  // Auto-ask initial message if provided
  if (initialMessage && !hasInitialized) {
    setHasInitialized(true);
    handleAsk(initialMessage);
  }

  return (
    <aside
      className="report-pane relative z-20 rounded-2xl border border-white/10 bg-[#0c0c0c] p-4
                 xl:sticky xl:top-20 overflow-hidden flex flex-col"
      aria-label="Ask Maven panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold opacity-80">Ask Maven</div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Ask Maven"
          className="rounded-md p-1.5 hover:bg-white/5"
        >
          <X className="h-4 w-4 opacity-70" />
        </button>
      </div>

      {/* Messages */}
      <div className="mt-3 flex-1 report-scroll scroll-invisible pr-1 space-y-2">
        {messages.length === 0 ? (
          <p className="text-xs opacity-60">
            Ask me a question about the data in this report. For example: “Which accounts are short on cash?”
          </p>
        ) : (
          messages.map(m => (
            <div key={m.id} className={m.role === "user" ? "text-right" : ""}>
              <span className="inline-block rounded-xl border border-white/10 px-3 py-2 text-xs">
                {m.text}
              </span>
            </div>
          ))
        )}
        {loading && <div className="text-xs opacity-60">Thinking...</div>}
      </div>

      {/* Composer (always inside the card) */}
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => { e.preventDefault(); if (!msg.trim()) return; handleAsk(msg); setMsg(""); }}
      >
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Ask about fees, accounts, status…"
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-transparent p-3 text-sm outline-none"
        />
        <button type="submit" className="shrink-0 rounded-xl border border-white/10 px-3 py-2 text-sm">
          Ask
        </button>
      </form>
    </aside>
  );
}
