/** Shared base styling for text-like inputs; used by Input and PasswordInput. */
export const inputBaseClasses = (error?: string) =>
  `h-10 w-full rounded-md border px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600/50 ${
    error ? 'border-danger-500' : 'border-border'
  }`;
