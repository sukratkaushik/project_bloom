import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from './utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helper?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helper, error, id, className, ...rest }, ref) => {
    const inputId = id ?? `inp-${Math.random().toString(36).slice(2, 9)}`;
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={inputId} className="text-caption font-semibold text-charcoal">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'h-11 px-4 rounded-md bg-white text-body-app text-charcoal placeholder:text-light',
            'border transition-colors duration-fast',
            error ? 'border-critical focus:ring-2 focus:ring-critical' : 'border-border focus:border-sage focus:ring-2 focus:ring-sage-pale',
            'focus:outline-none',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={helper || error ? `${inputId}-help` : undefined}
          {...rest}
        />
        {(helper || error) && (
          <span id={`${inputId}-help`} className={cn('text-caption', error ? 'text-critical' : 'text-medium')}>
            {error || helper}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
