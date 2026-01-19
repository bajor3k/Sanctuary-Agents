
export type SourceLite = { id?: string; title?: string; page?: number };
export type TrainingEvent = {
  sessionId?: string;
  model?: string;
  appVersion?: string;
  promptId?: string;

  question: string;
  answer: string;
  confidence?: number;        // 0..100
  tokensIn?: number;
  tokensOut?: number;
  latencyMs?: number;

  sources?: SourceLite[];

  feedback?: {
    helpful: boolean;
    issues?: Array<"hallucination"|"missing_steps"|"wrong_tone"|"too_long"|"too_short"|"other">;
    correction?: string;
    citationsOk?: boolean;
    sourcesOk?: boolean;
    badSourceIds?: string[];
  };

  ui?: { variant?: "simple"|"bullets"|"detailed" };
  ts: number; // Date.now()
};

// In-memory queue; swap with Azure Cosmos DB/Event Hub later.
const queue: TrainingEvent[] = [];

export function enqueueTrainingEvent(ev: TrainingEvent) {
  queue.push(ev);
  // For now just log; later POST to your collector or write to Azure Cosmos DB
  // Feature-flag so we can enable/disable POST without code changes
  if (process.env.NEXT_PUBLIC_SEND_FEEDBACK === "1") {
    fetch("/api/feedback", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(ev) })
      .catch(() => {});
  }
  // Always log for local debugging
  /* eslint-disable no-console */
  console.log("[training-event]", ev);
}

export function getTrainingQueueSnapshot() {
  return [...queue];
}
