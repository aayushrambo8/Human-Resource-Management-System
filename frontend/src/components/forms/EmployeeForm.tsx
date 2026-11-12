'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { departmentApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/api-client';
import {
  emptyEmployeeValues,
  employeeToRequest,
  employeeToValues,
  validateEmployee,
  type EmployeeFormErrors,
  type EmployeeFormValues,
} from '@/lib/forms/employee';
import { EMPLOYMENT_STATUSES, type Employee, type EmployeeRequest, type EmploymentStatus } from '@/lib/types';
import { FormActions, FormAlert, FormField, FormSelect } from '@/components/ui/Form';

interface EmployeeFormProps {
  /** Present → edit mode, used to prefill and shown in the submit label. */
  initialValues?: Employee;
  submitLabel: string;
  onSubmit: (request: EmployeeRequest) => Promise<void>;
  onCancel: () => void;
}

/**
 * Create/edit employee form shared by /employees/new and the edit dialog on
 * the detail page. Owns validation, submit state and error surfacing; the
 * caller owns the actual mutation and cache invalidation.
 */
export function EmployeeForm({ initialValues, submitLabel, onSubmit, onCancel }: EmployeeFormProps) {
  const [values, setValues] = useState<EmployeeFormValues>(() =>
    initialValues ? employeeToValues(initialValues) : emptyEmployeeValues,
  );
  const [errors, setErrors] = useState<EmployeeFormErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  // Department dropdown — department:read, which every role that can reach
  // this form (employee:write = ADMIN/HR) also holds.
  const departments = useQuery({ queryKey: ['departments'], queryFn: departmentApi.list });

  // Move focus to the first field that failed so keyboard and screen-reader
  // users land on the problem instead of hunting for it.
  useEffect(() => {
    if (attempt === 0) return;
    const firstInvalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    firstInvalid?.focus();
  }, [attempt]);

  const set = <K extends keyof EmployeeFormValues>(key: K, value: EmployeeFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));
    setSubmitError('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError('');
    const found = validateEmployee(values);
    setErrors(found);
    if (Object.values(found).some(Boolean)) {
      setAttempt((n) => n + 1);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(employeeToRequest(values));
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Could not save the employee.'));
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
          label="Employee code"
          required
          placeholder="e.g. EMP-001"
          value={values.employeeCode}
          onChange={(e) => set('employeeCode', e.target.value)}
          error={errors.employeeCode}
          hint="Unique within the directory (max 40 characters)."
          maxLength={40}
          autoComplete="off"
          disabled={submitting}
        />
        <FormSelect
          label="Status"
          required
          value={values.status}
          onChange={(e) => set('status', e.target.value as EmploymentStatus)}
          error={errors.status}
          disabled={submitting}
        >
          {EMPLOYMENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </FormSelect>

        <FormField
          label="First name"
          required
          placeholder="e.g. Jane"
          value={values.firstName}
          onChange={(e) => set('firstName', e.target.value)}
          error={errors.firstName}
          maxLength={80}
          autoComplete="given-name"
          disabled={submitting}
        />
        <FormField
          label="Last name"
          required
          placeholder="e.g. Doe"
          value={values.lastName}
          onChange={(e) => set('lastName', e.target.value)}
          error={errors.lastName}
          maxLength={80}
          autoComplete="family-name"
          disabled={submitting}
        />

        <FormField
          label="Email"
          type="email"
          placeholder="e.g. jane.doe@company.com"
          value={values.email}
          onChange={(e) => set('email', e.target.value)}
          error={errors.email}
          hint="Optional — must be a valid address if provided."
          maxLength={180}
          autoComplete="email"
          disabled={submitting}
        />
        <FormField
          label="Phone"
          type="tel"
          placeholder="e.g. +1 555-0123"
          value={values.phone}
          onChange={(e) => set('phone', e.target.value)}
          error={errors.phone}
          hint="Optional (max 32 characters)."
          maxLength={32}
          autoComplete="tel"
          disabled={submitting}
        />

        <FormSelect
          label="Department"
          value={values.departmentId}
          onChange={(e) => set('departmentId', e.target.value)}
          error={errors.departmentId}
          hint="Optional — leave unassigned to skip the team mapping."
          disabled={submitting || departments.isLoading}
        >
          <option value="">
            {departments.isLoading ? 'Loading departments…' : 'Unassigned'}
          </option>
          {departments.data?.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name} ({department.code})
            </option>
          ))}
        </FormSelect>
        <FormField
          label="Joining date"
          type="date"
          value={values.joiningDate}
          onChange={(e) => set('joiningDate', e.target.value)}
          error={errors.joiningDate}
          hint="Optional."
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
