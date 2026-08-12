import axios from 'axios';

const FALLBACK_ERROR_MESSAGE = 'Something went wrong. Please try again.';

function hasErrorMessage(data: unknown): data is { error: string } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'error' in data &&
    typeof (data as { error: unknown }).error === 'string'
  );
}

function hasErrorsList(data: unknown): data is { errors: string[] } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'errors' in data &&
    Array.isArray((data as { errors: unknown }).errors)
  );
}

/**
 * Extracts a message from an Axios error for display in the UI. The
 * backend uses `{ error: string }` for most failures but `{ errors: [...] }`
 * for validation errors (confirmed live on POST /users/{id}/profile) —
 * falls back to a generic message for network failures or unexpected shapes.
 */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (hasErrorMessage(data)) return data.error;
    if (hasErrorsList(data)) return data.errors.join(', ');
  }
  return FALLBACK_ERROR_MESSAGE;
}

/**
 * True for a 403 — used where a specific endpoint's only 403 cause has a
 * known meaning (e.g. GET /projects: the caller has no team) so the UI can
 * show a targeted message instead of a generic "couldn't load" + retry.
 */
export function isForbiddenError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 403;
}
