'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { getErrorMessage } from '@/lib/api-client';
import {
  emptyLeaveValues,
  leaveToSubmission,
  validateLeave,
  type LeaveFormErrors,
  type LeaveFormValues,
} from '@/lib/forms/leave';
import type { LeaveSubmission } from '@/lib/types';
import { FormActions, FormAlert, FormField } from '@/components/ui/Form';

interface LeaveFormProps {
  submitLabel: string;
  onSubmit: (submission: LeaveSubmission) => Promise<void>;
  onCancel: () => void;
}

/** Leave request form used by the "New request" dialog on /leave. */
export function LeaveForm({ submitLabel, onSubmit, onCancel }: LeaveFormProps) {
  const [values, setValues] = useState<LeaveFormValues>(emptyLeaveValues);
  const [errors, setErrors] = useState<LeaveFormErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (attempt === 0) return;
    const firstInvalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    firstInvalid?.focus();
  }, [attempt]);

  const set = <K extends keyof LeaveFormValues>(key: K, value: LeaveFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));
    setSubmitError('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError('');
    const found = validateLeave(values);
    setErrors(found);
    if (Object.values(found).some(Boolean)) {
      setAttempt((n) => n + 1);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(leaveToSubmission(values));
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Could not submit the leave request.'));
      setAttempt((n) => n + 1);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="form-stack">
      {submitError && <FormAlert>{submitError}</FormAlert>}

      <div className="form-grid">
        <FormField
          label="Start date"
          type="date"
          required
          value={values.startDate}
          onChange={(e) => set('startDate', e.target.value)}
          error={errors.startDate}
          disabled={submitting}
        />
        <FormField
          label="End date"
          type="date"
          required
          value={values.endDate}
          onChange={(e) => set('endDate', e.target.value)}
          error={errors.endDate}
          hint="Must be on or after the start date."
          disabled={submitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="leave-reason" className="form-label">
          Reason
          <span aria-hidden="true" style={{ color: 'var(--danger)', marginLeft: 2 }}>
            *
          </span>
        </label>
        <textarea
          id="leave-reason"
          className="form-input form-textarea"
          value={values.reason}
          onChange={(e) => set('reason', e.target.value)}
          aria-invalid={errors.reason ? true : undefined}
          aria-describedby={errors.reason ? 'leave-reason-error' : 'leave-reason-hint'}
          placeholder="Annual leave, medical appointment, family event…"
          rows={4}
          maxLength={1000}
          disabled={submitting}
        />
        <span className="form-hint" id="leave-reason-hint">
          Required, up to 1000 characters. Submitted as your own request — the record is
          attributed to your signed-in account.
        </span>
        {errors.reason && (
          <span className="form-error" id="leave-reason-error" role="alert">
            {errors.reason}
          </span>
        )}
      </div>

      <FormActions>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Submitting…' : submitLabel}
        </button>
      </FormActions>
    </form>
  );
}
