const FALLBACK = ['#98CEF3','#B9E0FF','#D0E6FB','#E6D6FD','#E4C5FB','#D2ACFB'];

export function getBabyBluePalette(): string[] {
  if (typeof window === "undefined") return FALLBACK; // SSR fallback
  const root = getComputedStyle(document.documentElement);
  const read = (v: string, d: string) => (root.getPropertyValue(v)?.trim() || d);

  // If you defined CSS vars, they’ll be used; else fallback
  return [
    read('--palette-1', FALLBACK[0]),
    read('--palette-2', FALLBACK[1]),
    read('--palette-3', FALLBACK[2]),
    read('--palette-4', FALLBACK[3]),
    read('--palette-5', FALLBACK[4]),
    read('--palette-6', FALLBACK[5]),
  ];
}

export const kpiColor = () => getBabyBluePalette()[0];
export const cycleColors = (n: number) => {
  const p = getBabyBluePalette();
  return Array.from({ length: n }, (_, i) => p[i % p.length]);
};
