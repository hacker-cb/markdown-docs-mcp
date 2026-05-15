// Shared utilities for line/offset conversions.
// Used by builder + comment/pdf-page parsers to avoid repeated O(N) re-scans.

export function computeLineOffsets(content: string): number[] {
  const offsets: number[] = [0];
  for (let i = 0; i < content.length; i++) {
    if (content.charCodeAt(i) === 10) {
      offsets.push(i + 1);
    }
  }
  return offsets;
}

// Returns the 1-based line number containing the given char offset.
// Precondition: offset >= 0. Typical callers pass an offset within
// [0, content.length); offset === content.length still returns a coherent
// line number (the last entry of lineOffsets, or the trailing-newline
// phantom line) — no clamping needed. For offset === 0 returns 1; for
// offset === lineOffsets[i] returns i + 1.
export function lineOfOffsetBinary(
  lineOffsets: number[],
  offset: number
): number {
  // Find the largest index i such that lineOffsets[i] <= offset.
  let lo = 0;
  let hi = lineOffsets.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >>> 1;
    if (lineOffsets[mid]! <= offset) lo = mid;
    else hi = mid - 1;
  }
  return lo + 1;
}
