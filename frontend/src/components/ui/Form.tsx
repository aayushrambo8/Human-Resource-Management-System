'use client';

import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';
import { Icon } from './Icon';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Rendered under the input; announced via aria-describedby when present. */
  error?: string;
  /** Non-error helper line (constraints, backend limits). */
  hint?: string;
}

/**
 * Labelled input wired for screen readers: htmlFor/id pairing, aria-invalid on
 * error, and aria-describedby pointing at the hint and/or error text.
 */
export function FormField({ label, error, hint, id, className = '', ...inputProps }: FormFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="form-group">
      <label htmlFor={fieldId} className="form-label">
        {label}
        {inputProps.required && (
          <span aria-hidden="true" style={{ color: 'var(--danger)', marginLeft: 2 }}>
            *
          </span>
        )}
      </label>
      <input
        {...inputProps}
        id={fieldId}
        className={`form-input ${className}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
      />
      {hint && (
        <span className="form-hint" id={hintId}>
          {hint}
        </span>
      )}
      {error && (
        <span className="form-error" id={errorId} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export function FormSelect({ label, error, hint, id, children, className = '', ...selectProps }: FormSelectProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="form-group">
      <label htmlFor={fieldId} className="form-label">
        {label}
        {selectProps.required && (
          <span aria-hidden="true" style={{ color: 'var(--danger)', marginLeft: 2 }}>
            *
          </span>
        )}
      </label>
      <select
        {...selectProps}
        id={fieldId}
        className={`form-input ${className}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
      >
        {children}
      </select>
      {hint && (
        <span className="form-hint" id={hintId}>
          {hint}
        </span>
      )}
      {error && (
        <span className="form-error" id={errorId} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

/** Blocking form-level message (backend rejection, network failure). */
export function FormAlert({ children }: { children: ReactNode }) {
  return (
    <div className="alert alert-error" role="alert">
      <Icon name="alert" size={16} />
      <span>{children}</span>
    </div>
  );
}

/** Success confirmation announced politely so it does not interrupt typing. */
export function FormSuccess({ children }: { children: ReactNode }) {
  return (
    <div className="alert alert-success" role="status">
      <Icon name="info" size={16} />
      <span>{children}</span>
    </div>
  );
}

export function FormActions({ children }: { children: ReactNode }) {
  return <div className="modal-actions">{children}</div>;
}
