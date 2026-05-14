const ANNEX_RE = /^Annex\s+([A-Z](?:\.\d+)*)\s+/;
const NUMERIC_RE = /^(\d+(?:\.\d+)*)\s+/;
const ALPHA_RE = /^([A-Z]+(?:\.\d+)*)\s+/;

export function extractNumbering(title: string): string | null {
  const annexMatch = ANNEX_RE.exec(title);
  if (annexMatch) {
    return annexMatch[1] ?? null;
  }
  const numericMatch = NUMERIC_RE.exec(title);
  if (numericMatch) {
    return numericMatch[1] ?? null;
  }
  const alphaMatch = ALPHA_RE.exec(title);
  if (alphaMatch) {
    return alphaMatch[1] ?? null;
  }
  return null;
}
