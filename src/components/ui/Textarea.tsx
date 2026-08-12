import { forwardRef, type TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

/** Forwarding the ref is required for react-hook-form's `register()` to attach directly to the underlying <textarea>. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className = '', ...rest }, ref) => {
    return (
      <textarea
        ref={ref}
        aria-invalid={Boolean(error)}
        className={`min-h-[80px] w-full rounded-md border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600/50 ${
          error ? 'border-danger-500' : 'border-border'
        } ${className}`}
        {...rest}
      />
    );
  },
);

Textarea.displayName = 'Textarea';
