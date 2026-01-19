/** 
 * Matches any 9-digit sequence, with optional single hyphens or spaces between digits.
 * Examples flagged: 658-74-7854, 98-7485699, 456748569
 * Not flagged: part of longer digit runs (10+), e.g., 1234567890
 */
const NINE_DIGIT_REGEX = /(?<!\d)(?:\d[ -]?){9}(?!\d)/g;

/** Regex-based check (fast). Some older browsers lack lookbehind; we include a fallback. */
export function hasNineDigitSequence(text: string): boolean {
  try {
    return NINE_DIGIT_REGEX.test(text);
  } catch {
    // Fallback for environments without lookbehind
    return hasNineDigitSequenceFallback(text);
  }
}

/** Fallback: scan characters; count digits, ignore hyphens/spaces, reset on other chars. */
export function hasNineDigitSequenceFallback(text: string): boolean {
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch >= "0" && ch <= "9") {
      count++;
      // If we just hit 9 digits, ensure next char isn't a digit (to avoid 10+)
      if (count === 9) {
        const next = text[i + 1];
        if (!(next && next >= "0" && next <= "9")) return true;
        // If next is also a digit, this is part of 10+, keep counting
      }
    } else if (ch === "-" || ch === " ") {
      // ignore separators inside the 9-count
    } else {
      // non-digit, non-separator breaks the run
      count = 0;
    }
  }
  return false;
}

/** Optional: return the exact matches (useful if you already highlight or log). */
export function findNineDigitSequences(text: string): string[] {
  try {
    const matches = text.match(NINE_DIGIT_REGEX);
    return matches ? Array.from(matches) : [];
  } catch {
    // simple split by whitespace to avoid cross-token joins in fallback
    const hits: string[] = [];
    for (const token of text.split(/\s+/)) {
      if (hasNineDigitSequenceFallback(token)) hits.push(token);
    }
    return hits;
  }
}
