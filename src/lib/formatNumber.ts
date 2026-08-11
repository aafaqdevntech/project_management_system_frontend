const compactFormatter = new Intl.NumberFormat('en', { notation: 'compact' });

/** Formats large counts compactly (1284 -> "1.3K"); small counts pass through unchanged. */
export function formatCompactNumber(value: number): string {
  return compactFormatter.format(value);
}
