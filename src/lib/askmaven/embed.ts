let _embedder: any | null = null;
let _useFallback = false;

function hashEmbed(text: string, dims = 256): number[] {
  // simple hashing TF-IDF-ish embedding; normalized
  const vec = new Float32Array(dims);
  const tokens = (text.toLowerCase().match(/[a-z0-9]+/g) || []).slice(0, 2048);
  for (const tok of tokens) {
    let h = 2166136261 >>> 0; // FNV-1a
    for (let i = 0; i < tok.length; i++) {
      h ^= tok.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    const idx = h % dims;
    vec[idx] += 1;
  }
  // L2 normalize
  let norm = 0; for (let i = 0; i < dims; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < dims; i++) vec[i] /= norm;
  return Array.from(vec);
}

export async function getEmbedder() {
  if (typeof window === 'undefined') throw new Error('embedder must run in browser');
  if (_embedder || _useFallback) return _embedder;

  try {
    const { pipeline } = await import('@xenova/transformers');
    _embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  } catch (e) {
    console.warn('[AskMaven] transformers.js model unavailable; using local hashing embedder for now.', e);
    _useFallback = true;
  }
  return _embedder;
}

// Returns a normalized embedding vector (number[])
export async function embed(text: string): Promise<number[]> {
  if (_useFallback) return hashEmbed(text);
  const emb = await getEmbedder();
  const out = await emb(text, { pooling: 'mean', normalize: true });
  return Array.from(out.data) as number[];
}

export function cosine(a: number[], b: number[]) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}
