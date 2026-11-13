import React, { forwardRef } from 'react';

/**
 * Reusable Input component with optional label, helper text, error message, and prefix/suffix icons.
 */
export const Input = forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  id,
  type = 'text',
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-echo-muted uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-echo-subtle">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`echo-input ${Icon ? 'pl-9' : ''} ${error ? 'border-echo-rose focus:border-echo-rose focus:ring-echo-rose/30' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-echo-rose font-medium mt-1">{error}</p>
      )}
      {!error && helperText && (
        <p className="text-xs text-echo-subtle mt-1">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
