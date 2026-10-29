import type { CreateAccountRequest } from '@/lib/types';

export interface AccountFormValues {
  email: string;
  password: string;
  roles: string[];
  employeeCode: string;
}

export type AccountFormErrors = Partial<Record<keyof AccountFormValues, string>>;

export const emptyAccountValues: AccountFormValues = { email: '', password: '', roles: [], employeeCode: '' };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Mirrors CreateAccountRequest: @NotBlank @Email @Size(max=180) email,
 * @NotBlank @Size(min=12,max=72) password plus the @AssertTrue check that the
 * password is at most 72 UTF-8 bytes (bcrypt limit), @NotEmpty roles,
 * @Size(max=40) employeeCode.
 */
export function validateAccount(values: AccountFormValues): AccountFormErrors {
  const errors: AccountFormErrors = {};

  const email = values.email.trim();
  if (!email) errors.email = 'Email is required.';
  else if (email.length > 180) errors.email = 'Email must be 180 characters or fewer.';
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address.';

  const password = values.password;
  if (!password) errors.password = 'Password is required.';
  else if (password.length < 12) errors.password = 'Password must be at least 12 characters.';
  else if (password.length > 72) errors.password = 'Password must be 72 characters or fewer.';
  else if (new TextEncoder().encode(password).length > 72) {
    errors.password = 'Password must be at most 72 UTF-8 bytes (bcrypt limit).';
  }

  if (values.roles.length === 0) errors.roles = 'Select at least one role.';

  if (values.employeeCode.trim().length > 40) {
    errors.employeeCode = 'Employee code must be 40 characters or fewer.';
  }

  return errors;
}

export function accountToRequest(values: AccountFormValues): CreateAccountRequest {
  return {
    email: values.email.trim(),
    password: values.password,
    roles: values.roles,
    employeeCode: values.employeeCode.trim() || null,
  };
}
