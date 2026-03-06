'use client';

import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  children: ReactNode;
  counter?: ReactNode;
}

/**
 * Consistent form field wrapper with label, required asterisk, error message,
 * help text, and optional character counter.
 */
export function FormField({ label, required, error, helpText, children, counter }: FormFieldProps) {
  return (
    <div data-field-error={error ? 'true' : undefined}>
      <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'system-ui' }}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'system-ui' }}>{error}</p>
      )}
      {!error && helpText && (
        <p className="text-gray-400 text-xs mt-1 italic" style={{ fontFamily: 'system-ui' }}>{helpText}</p>
      )}
      {counter && <div className="mt-1">{counter}</div>}
    </div>
  );
}
