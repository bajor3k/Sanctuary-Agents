
"use client";

import { useMemo, useState } from "react";
import { enqueueTrainingEvent, type TrainingEvent, type SourceLite } from "@/lib/training";

type Props = {
  question: string;
  answer: string;
  confidence?: number;            // 0..1 or 0..100
  sources?: SourceLite[];
  uiVariant?: "simple"|"bullets"|"detailed";
  model?: string;
  appVersion?: string;
  promptId?: string;
  onRegenerate?: (seedText?: string) => void; // optional
};

function norm(p?: number) {
  if (p == null || Number.isNaN(p)) return undefined;
  return p <= 1 ? Math.round(Math.max(0, Math.min(1, p)) * 100) : Math.round(Math.max(0, Math.min(100, p)));
}

type FeedbackIssues = NonNullable<NonNullable<TrainingEvent["feedback"]>["issues"]>[number];

export default function ResponseFeedback(props: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [issues, setIssues] = useState<Array<FeedbackIssues>>([]);
  const [correction, setCorrection] = useState("");
  const [citationsOk, setCitationsOk] = useState<boolean | null>(null);
  const [sourcesOk, setSourcesOk] = useState<boolean | null>(null);
  const [badSourceIds, setBadSourceIds] = useState<string[]>([]);

  const pct = useMemo(() => norm(props.confidence), [props.confidence]);
  const srcs = props.sources ?? [];

  function toggleIssue(k: FeedbackIssues) {
    setIssues((arr) => (arr.includes(k) ? arr.filter(x => x !== k) : [...arr, k]));
  }

  async function submit() {
    if (helpful === null) return;
    enqueueTrainingEvent({
      sessionId: undefined,
      model: props.model,
      appVersion: props.appVersion,
      promptId: props.promptId,
      question: props.question,
      answer: props.answer,
      confidence: pct,
      sources: srcs,
      feedback: {
        helpful,
        issues: helpful ? [] : issues,
        correction: helpful ? undefined : (correction?.trim() || undefined),
        citationsOk: helpful ? true : citationsOk ?? undefined,
        sourcesOk: helpful ? true : sourcesOk ?? undefined,
        badSourceIds: helpful ? [] : badSourceIds,
      },
      ui: { variant: props.uiVariant },
      ts: Date.now(),
    });
    setSubmitted(true);
  }

  if (submitted) {
    return <div className="mt-3 text-xs text-gray-500">Thanks for the feedback.</div>;
  }

  return (
    <div className="mt-4 border-t border-white/10 pt-3">
      {/* Primary row */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
        <span className="mr-2">Feedback:</span>
        <button
          onClick={() => setHelpful(true)}
          className={`px-2 py-1 rounded border ${helpful === true ? "border-emerald-500 text-emerald-400" : "border-white/10 hover:text-emerald-300"}`}
        >
          👍 Helpful
        </button>
        <button
          onClick={() => setHelpful(false)}
          className={`px-2 py-1 rounded border ${helpful === false ? "border-rose-500 text-rose-400" : "border-white/10 hover:text-rose-300"}`}
        >
          👎 Not Helpful
        </button>

        {helpful === true && (
          <button onClick={submit} className="ml-auto text-emerald-400 hover:text-emerald-300">Submit</button>
        )}
      </div>

      {/* Expanded editor for negative feedback */}
      {helpful === false && (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap gap-2">
            {[
              ["hallucination","Hallucination"],
              ["missing_steps","Missing steps"],
              ["wrong_tone","Wrong tone"],
              ["too_long","Too long"],
              ["too_short","Too short"],
              ["other","Other"],
            ].map(([k,label]) => (
              <button
                key={k}
                onClick={() => toggleIssue(k as any)}
                className={`text-xs px-2 py-1 rounded border ${issues.includes(k as any) ? "border-amber-500 text-amber-400" : "border-white/10 hover:text-amber-300"}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <label className="text-xs text-gray-400 flex items-center gap-2">
              Citations ok?
              <select
                value={citationsOk === null ? "" : citationsOk ? "yes" : "no"}
                onChange={(e) => setCitationsOk(e.target.value === "" ? null : e.target.value === "yes")}
                className="bg-black/40 border border-white/10 rounded px-2 py-1 text-gray-200"
              >
                <option value="">—</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>

            <label className="text-xs text-gray-400 flex items-center gap-2">
              Used correct docs?
              <select
                value={sourcesOk === null ? "" : sourcesOk ? "yes" : "no"}
                onChange={(e) => setSourcesOk(e.target.value === "" ? null : e.target.value === "yes")}
                className="bg-black/40 border border-white/10 rounded px-2 py-1 text-gray-200"
              >
                <option value="">—</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>
          </div>

          {/* When sources not ok, allow selecting the bad ones */}
          {sourcesOk === false && srcs.length > 0 && (
            <div className="text-xs text-gray-400">
              <div className="mb-1">Which sources were wrong?</div>
              <div className="flex flex-wrap gap-2">
                {srcs.map((s, i) => {
                  const id = s.id ?? String(i);
                  const active = badSourceIds.includes(id);
                  return (
                    <button
                      key={id}
                      onClick={() => setBadSourceIds(active ? badSourceIds.filter(x=>x!==id) : [...badSourceIds, id])}
                      className={`px-2 py-1 rounded border ${active ? "border-rose-500 text-rose-400" : "border-white/10 hover:text-rose-300"}`}
                      title={s.title}
                    >
                      {s.title ?? `Source ${i+1}`}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <textarea
              placeholder="Provide the correct answer or missing details (recommended)."
              value={correction}
              onChange={(e)=>setCorrection(e.target.value)}
              className="w-full min-h-[80px] rounded bg-black/40 border border-white/10 p-2 text-gray-200"
            />
            {props.onRegenerate && (
              <div className="mt-2 text-right">
                <button
                  onClick={() => props.onRegenerate?.(correction)}
                  className="text-blue-400 hover:text-blue-300 text-xs mr-4"
                >
                  Regenerate with my correction
                </button>
              </div>
            )}
          </div>

          <div className="text-right">
            <button onClick={submit} className="text-emerald-400 hover:text-emerald-300 text-xs">
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
