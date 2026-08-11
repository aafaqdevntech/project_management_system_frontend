import { format, isValid } from 'date-fns';

/**
 * Formats an ISO date string, returning `fallback` instead of throwing for
 * null/missing/unparseable input (date-fns's `format` throws on an invalid
 * Date, e.g. when the backend sends a sentinel string in place of a real
 * date for an incomplete record).
 */
export function formatDateSafe(
  value: string | null | undefined,
  pattern: string,
  fallback = '—',
): string {
  if (!value) return fallback;
  const date = new Date(value);
  return isValid(date) ? format(date, pattern) : fallback;
}
