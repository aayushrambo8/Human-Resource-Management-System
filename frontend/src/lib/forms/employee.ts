import type { Employee, EmployeeRequest, EmploymentStatus } from '@/lib/types';
import { EMPLOYMENT_STATUSES } from '@/lib/types';

export interface EmployeeFormValues {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  departmentId: string;
  joiningDate: string;
  status: EmploymentStatus;
}

export type EmployeeFormErrors = Partial<Record<keyof EmployeeFormValues, string>>;

export const emptyEmployeeValues: EmployeeFormValues = {
  employeeCode: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  departmentId: '',
  joiningDate: '',
  status: 'ACTIVE',
};

export function employeeToValues(employee: Employee): EmployeeFormValues {
  return {
    employeeCode: employee.employeeCode,
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email ?? '',
    phone: employee.phone ?? '',
    departmentId: employee.departmentId ?? '',
    joiningDate: employee.joiningDate ?? '',
    status: (EMPLOYMENT_STATUSES as string[]).includes(employee.status)
      ? (employee.status as EmploymentStatus)
      : 'ACTIVE',
  };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Client-side validation mirroring the backend's constraints on EmployeeRequest
 * (@NotBlank employeeCode/firstName/lastName, @Email @Size(max=180) email,
 * @Size(max=32) phone, @NotNull status). Empty optional fields are sent as null
 * rather than "" so Jackson never has to parse an empty UUID/LocalDate.
 */
export function validateEmployee(values: EmployeeFormValues): EmployeeFormErrors {
  const errors: EmployeeFormErrors = {};

  if (!values.employeeCode.trim()) errors.employeeCode = 'Employee code is required.';
  else if (values.employeeCode.trim().length > 40) errors.employeeCode = 'Employee code must be 40 characters or fewer.';

  if (!values.firstName.trim()) errors.firstName = 'First name is required.';
  else if (values.firstName.length > 80) errors.firstName = 'First name must be 80 characters or fewer.';

  if (!values.lastName.trim()) errors.lastName = 'Last name is required.';
  else if (values.lastName.length > 80) errors.lastName = 'Last name must be 80 characters or fewer.';

  const email = values.email.trim();
  if (email) {
    if (email.length > 180) errors.email = 'Email must be 180 characters or fewer.';
    else if (!EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address.';
  }

  if (values.phone.trim().length > 32) errors.phone = 'Phone must be 32 characters or fewer.';

  const joiningDate = values.joiningDate.trim();
  if (joiningDate && !DATE_ONLY.test(joiningDate)) errors.joiningDate = 'Enter a valid date (yyyy-MM-dd).';

  if (!EMPLOYMENT_STATUSES.includes(values.status)) errors.status = 'Select a valid status.';

  return errors;
}

export function employeeToRequest(values: EmployeeFormValues): EmployeeRequest {
  const email = values.email.trim();
  const phone = values.phone.trim();
  const joiningDate = values.joiningDate.trim();
  return {
    employeeCode: values.employeeCode.trim(),
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: email || null,
    phone: phone || null,
    departmentId: values.departmentId || null,
    joiningDate: joiningDate || null,
    status: values.status,
  };
}
