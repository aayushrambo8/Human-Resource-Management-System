'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { companyApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/api-client';
import {
  departmentToRequest,
  departmentToValues,
  emptyDepartmentValues,
  validateDepartment,
  type DepartmentFormErrors,
  type DepartmentFormValues,
} from '@/lib/forms/department';
import type { Department, DepartmentRequest } from '@/lib/types';
import { FormActions, FormAlert, FormField, FormSelect } from '@/components/ui/Form';

interface DepartmentFormProps {
  /** Present → edit mode. */
  initialValues?: Department;
  submitLabel: string;
  onSubmit: (request: DepartmentRequest) => Promise<void>;
  onCancel: () => void;
}

/**
 * Create/edit department form. The company dropdown reads GET /api/companies
 * (company:read), which every role that can reach this form (department:write =
 * ADMIN/HR) also holds.
 */
export function DepartmentForm({ initialValues, submitLabel, onSubmit, onCancel }: DepartmentFormProps) {
  const [values, setValues] = useState<DepartmentFormValues>(() =>
    initialValues ? departmentToValues(initialValues) : emptyDepartmentValues,
  );
  const [errors, setErrors] = useState<DepartmentFormErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  const companies = useQuery({ queryKey: ['companies'], queryFn: companyApi.list });

  useEffect(() => {
    if (attempt === 0) return;
    const firstInvalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    firstInvalid?.focus();
  }, [attempt]);

  const set = <K extends keyof DepartmentFormValues>(key: K, value: DepartmentFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));
    setSubmitError('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError('');
    const found = validateDepartment(values);
    setErrors(found);
    if (Object.values(found).some(Boolean)) {
      setAttempt((n) => n + 1);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(departmentToRequest(values));
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Could not save the department.'));
      setAttempt((n) => n + 1);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="form-stack">
      {submitError && <FormAlert>{submitError}</FormAlert>}

      <FormSelect
        label="Company"
        required
        value={values.companyId}
        onChange={(e) => set('companyId', e.target.value)}
        error={errors.companyId}
        hint={
          companies.isError
            ? 'Could not load the company list — close this dialog and retry.'
            : 'Required — a department belongs to exactly one company.'
        }
        disabled={submitting || companies.isLoading}
      >
        <option value="">
          {companies.isLoading ? 'Loading companies…' : companies.isError ? 'Companies unavailable' : 'Select a company'}
        </option>
        {companies.data?.map((company) => (
          <option key={company.id} value={company.id}>
            {company.name} ({company.code})
          </option>
        ))}
      </FormSelect>

      <div className="form-grid">
        <FormField
          label="Department code"
          required
          value={values.code}
          onChange={(e) => set('code', e.target.value)}
          error={errors.code}
          hint="Short unique code, max 32 characters."
          maxLength={32}
          autoComplete="off"
          disabled={submitting}
        />
        <FormField
          label="Department name"
          required
          value={values.name}
          onChange={(e) => set('name', e.target.value)}
          error={errors.name}
          hint="Display name, max 120 characters."
          maxLength={120}
          autoComplete="off"
          disabled={submitting}
        />
      </div>

      <FormActions>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </FormActions>
    </form>
  );
}
