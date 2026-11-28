'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { accountApi, employeeApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/api-client';
import {
  accountToRequest,
  emptyAccountValues,
  validateAccount,
  type AccountFormErrors,
  type AccountFormValues,
} from '@/lib/forms/account';
import { ROLE_CODES } from '@/lib/types';
import { FormActions, FormAlert, FormField, FormSuccess } from '@/components/ui/Form';

interface AccountFormProps {
  onCancel: () => void;
}

/**
 * ADMIN-only account provisioning form (POST /api/accounts, `account:write`).
 * On success it reports the created address, clears the secret fields and stays
 * open so several accounts can be created in one sitting.
 */
export function AccountForm({ onCancel }: AccountFormProps) {
  const [values, setValues] = useState<AccountFormValues>(emptyAccountValues);
  const [errors, setErrors] = useState<AccountFormErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  // Employee codes for the optional link (employee:read — held by ADMIN, the
  // only role that can reach this form).
  const employees = useQuery({ queryKey: ['employees'], queryFn: employeeApi.list });

  useEffect(() => {
    if (attempt === 0) return;
    const firstInvalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    firstInvalid?.focus();
  }, [attempt]);

  const setField = <K extends keyof AccountFormValues>(key: K, value: AccountFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));
    setSubmitError('');
    setSuccess('');
  };

  const selectRole = (role: string) => {
    setValues((current) => ({
      ...current,
      roles: [role],
    }));
    setErrors((current) => ({ ...current, roles: undefined }));
    setSubmitError('');
    setSuccess('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError('');
    setSuccess('');
    const found = validateAccount(values);
    setErrors(found);
    if (Object.values(found).some(Boolean)) {
      setAttempt((n) => n + 1);
      return;
    }

    setSubmitting(true);
    try {
      await accountApi.create(accountToRequest(values));
      // 201 with an empty body — confirm with a status message and clear the
      // secret fields.
      setSuccess(`Account created for ${values.email.trim()}.`);
      setValues(emptyAccountValues);
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Could not create the account.'));
      setAttempt((n) => n + 1);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="form-stack">
      {submitError && <FormAlert>{submitError}</FormAlert>}
      {success && <FormSuccess>{success}</FormSuccess>}

      <div className="form-grid">
        <FormField
          label="Email"
          type="email"
          required
          value={values.email}
          onChange={(e) => setField('email', e.target.value)}
          error={errors.email}
          placeholder="name@institution.local"
          maxLength={180}
          autoComplete="off"
          disabled={submitting}
        />

        <FormField
          label="Password"
          type="password"
          required
          value={values.password}
          onChange={(e) => setField('password', e.target.value)}
          error={errors.password}
          hint="12–72 characters (max 72 UTF-8 bytes)."
          autoComplete="new-password"
          disabled={submitting}
        />

        <fieldset className="form-fieldset" role="radiogroup">
          <legend className="form-label">
            Role
            <span aria-hidden="true" style={{ color: 'var(--color-danger, #EF4444)', marginLeft: 3, fontWeight: 700 }}>
              *
            </span>
          </legend>
          <div className="role-options">
            {ROLE_CODES.map((role) => {
              const isSelected = values.roles.includes(role);
              return (
                <label key={role} className={`role-option ${isSelected ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="account-role"
                    value={role}
                    checked={isSelected}
                    onChange={() => selectRole(role)}
                    disabled={submitting}
                    className="radio-knob"
                  />
                  <span>{role}</span>
                </label>
              );
            })}
          </div>
          {errors.roles ? (
            <span className="form-error" role="alert">
              {errors.roles}
            </span>
          ) : (
            <span className="form-hint">
              ADMIN has all access; HR has operational access; EMPLOYEE has self-service access.
            </span>
          )}
        </fieldset>

        <div>
          <FormField
            label="Employee code"
            value={values.employeeCode}
            onChange={(e) => setField('employeeCode', e.target.value)}
            error={errors.employeeCode}
            hint="Optional — links account to directory."
            list="employee-code-options"
            placeholder="e.g. EMP-001"
            maxLength={40}
            autoComplete="off"
            disabled={submitting}
          />
          <datalist id="employee-code-options">
            {employees.data?.map((employee) => (
              <option key={employee.id} value={employee.employeeCode}>
                {employee.firstName} {employee.lastName}
              </option>
            ))}
          </datalist>
        </div>
      </div>

      <FormActions>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={submitting}>
          Close
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Creating…' : 'Create account'}
        </button>
      </FormActions>
    </form>
  );
}
