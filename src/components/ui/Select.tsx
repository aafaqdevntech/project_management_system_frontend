import { forwardRef, type SelectHTMLAttributes } from 'react';
import { inputBaseClasses } from '@/components/ui/inputStyles';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

/**
 * Forwarding the ref is required for react-hook-form's `register()` to
 * attach directly to the underlying <select> element.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, className = '', ...rest }, ref) => {
    return (
      <select
        ref={ref}
        aria-invalid={Boolean(error)}
        className={`${inputBaseClasses(error)} ${className}`}
        {...rest}
      />
    );
  },
);

Select.displayName = 'Select';
