import React, { memo } from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string | undefined;
  required?: boolean;
  'aria-describedby'?: string;
}

export const Input: React.FC<InputProps> = memo(({ 
  label, 
  error, 
  required = false, 
  type = 'text',
  id,
  className = '',
  'aria-describedby': ariaDescribedBy,
  ...props 
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${inputId}-error`;

  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="obrigatório">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : ariaDescribedBy}
        className={`w-full px-3 py-3 sm:py-4 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors touch-manipulation ${
          error 
            ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
            : ''
        } ${className}`}
        style={{
          backgroundColor: error ? undefined : 'var(--input-bg)',
          color: 'var(--input-text)',
          borderColor: error ? 'var(--input-border-error)' : 'var(--input-border)',
          minHeight: '44px'
        }}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});