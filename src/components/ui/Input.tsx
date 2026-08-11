import { forwardRef, type InputHTMLAttributes } from 'react';
import { inputBaseClasses } from '@/components/ui/inputStyles';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

/**
 * Forwarding the ref is required for react-hook-form's `register()` to
 * attach directly to the underlying <input> element.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = '', ...rest }, ref) => {
    return (
      <input
        ref={ref}
        aria-invalid={Boolean(error)}
        className={`${inputBaseClasses(error)} ${className}`}
        {...rest}
      />
    );
  },
);

Input.displayName = 'Input';
