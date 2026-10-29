// Role → permission model, mirroring the backend's authoritative grants in
// backend/src/main/resources/db/migration/V3__authentication_and_leave.sql:
//
//   ADMIN    → every permission in the `permissions` table
//   HR       → employee:read/write, department:read/write, company:read,
//              attendance:read, biometric:read, leave:read/write/review
//              (i.e. everything except company:write and account:write)
//   EMPLOYEE → leave:write only
//
// This is UI gating only. The Spring Security `@PreAuthorize` checks on the
// backend are the enforcement truth — a hidden button is never the control.
export type Permission =
  | 'employee:read'
  | 'employee:write'
  | 'department:read'
  | 'department:write'
  | 'company:read'
  | 'company:write'
  | 'attendance:read'
  | 'biometric:read'
  | 'leave:read'
  | 'leave:write'
  | 'leave:review'
  | 'account:write';

/** Every permission the backend defines (V3 migration, lines 67-79). */
export const ALL_PERMISSIONS: Permission[] = [
  'employee:read',
  'employee:write',
  'department:read',
  'department:write',
  'company:read',
  'company:write',
  'attendance:read',
  'biometric:read',
  'leave:read',
  'leave:write',
  'leave:review',
  'account:write',
];

const HR_PERMISSIONS: Permission[] = [
  'employee:read',
  'employee:write',
  'department:read',
  'department:write',
  'company:read',
  'attendance:read',
  'biometric:read',
  'leave:read',
  'leave:write',
  'leave:review',
];

const EMPLOYEE_PERMISSIONS: Permission[] = ['leave:write'];

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  ADMIN: ALL_PERMISSIONS,
  HR: HR_PERMISSIONS,
  EMPLOYEE: EMPLOYEE_PERMISSIONS,
};

/** True when any of the given roles grants `permission`. Unknown roles grant nothing. */
export function can(roles: readonly string[], permission: Permission): boolean {
  return roles.some((role) => ROLE_PERMISSIONS[role]?.includes(permission) ?? false);
}

/** Convenience gates used by the module pages. */
export const gates = {
  canWriteEmployees: (roles: readonly string[]) => can(roles, 'employee:write'),
  canReadEmployees: (roles: readonly string[]) => can(roles, 'employee:read'),
  canWriteDepartments: (roles: readonly string[]) => can(roles, 'department:write'),
  canReadDepartments: (roles: readonly string[]) => can(roles, 'department:read'),
  canReadCompanies: (roles: readonly string[]) => can(roles, 'company:read'),
  canReadBiometric: (roles: readonly string[]) => can(roles, 'biometric:read'),
  canReviewLeaves: (roles: readonly string[]) => can(roles, 'leave:review'),
  canSubmitLeaves: (roles: readonly string[]) => can(roles, 'leave:write'),
  canCreateAccounts: (roles: readonly string[]) => can(roles, 'account:write'),
  /** Directory modules (employees/attendance/departments/biometric) are ADMIN/HR. */
  canReadDirectory: (roles: readonly string[]) => can(roles, 'employee:read'),
  canReadAttendance: (roles: readonly string[]) => can(roles, 'attendance:read'),
};
