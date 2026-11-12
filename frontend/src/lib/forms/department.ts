import type { Department, DepartmentRequest } from '@/lib/types';

export interface DepartmentFormValues {
  companyId: string;
  code: string;
  name: string;
}

export type DepartmentFormErrors = Partial<Record<keyof DepartmentFormValues, string>>;

export const emptyDepartmentValues: DepartmentFormValues = { companyId: '', code: '', name: '' };

export function departmentToValues(department: Department): DepartmentFormValues {
  return {
    companyId: department.companyId,
    code: department.code,
    name: department.name,
  };
}

/**
 * Mirrors DepartmentRequest: @NotNull companyId, @NotBlank @Size(max=32) code,
 * @NotBlank @Size(max=120) name.
 */
export function validateDepartment(values: DepartmentFormValues): DepartmentFormErrors {
  const errors: DepartmentFormErrors = {};

  if (!values.companyId) errors.companyId = 'Select a company.';
  if (!values.code.trim()) errors.code = 'Department code is required.';
  else if (values.code.trim().length > 32) errors.code = 'Code must be 32 characters or fewer.';
  if (!values.name.trim()) errors.name = 'Department name is required.';
  else if (values.name.trim().length > 120) errors.name = 'Name must be 120 characters or fewer.';

  return errors;
}

export function departmentToRequest(values: DepartmentFormValues): DepartmentRequest {
  return {
    companyId: values.companyId,
    code: values.code.trim(),
    name: values.name.trim(),
  };
}
