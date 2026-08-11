const NO_RECORD_SENTINEL = 'No record!';

/**
 * The backend returns the literal string "No record!" (not null/empty)
 * for absent optional fields on GET /users rows (image_url, team_name).
 * Normalizes that sentinel — and any other falsy/blank value — to null so
 * callers can treat it the same as a real "no value".
 */
export function normalizeSentinel(value: string | null | undefined): string | null {
  if (!value || value === NO_RECORD_SENTINEL) return null;
  return value;
}
