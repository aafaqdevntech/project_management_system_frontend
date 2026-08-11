/**
 * Centralized access to build-time environment variables.
 * Keeping this in one place avoids scattering `import.meta.env.VITE_*`
 * (and its untyped strings) across the codebase.
 */
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string,
} as const;
