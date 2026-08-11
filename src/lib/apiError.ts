import type { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

const FALLBACK_ERROR_MESSAGE = 'Something went wrong. Please try again.';

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error;
}

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
 * Extracts a message from an RTK Query error for display in the UI. The
 * backend uses `{ error: string }` for most failures but `{ errors: [...] }`
 * for validation errors (confirmed live on POST /users/{id}/profile) —
 * falls back to a generic message for network failures or unexpected shapes.
 */
export function getApiErrorMessage(error: unknown): string {
  if (isFetchBaseQueryError(error)) {
    if (hasErrorMessage(error.data)) return error.data.error;
    if (hasErrorsList(error.data)) return error.data.errors.join(', ');
  }
  return FALLBACK_ERROR_MESSAGE;
}

/**
 * True only for a genuine 401 (the token itself was rejected). Other
 * failures — 500s, network errors — mean the request failed, not that the
 * session is invalid, so callers should not log the user out for those.
 */
export function isUnauthorizedError(error: unknown): boolean {
  return isFetchBaseQueryError(error) && error.status === 401;
}
