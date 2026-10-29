export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  departmentId: string | null;
  departmentName: string | null;
  joiningDate: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'TERMINATED' | string;
}

export interface Department {
  id: string;
  companyId: string;
  companyCode: string;
  code: string;
  name: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  deviceCode: string;
  punchTime: string;
  direction: 'IN' | 'OUT' | 'UNKNOWN' | string;
}

export interface BiometricLog {
  id: string;
  deviceCode: string;
  employeeCode: string;
  punchTime: string;
  direction: 'IN' | 'OUT' | 'UNKNOWN' | string;
  status: 'ACCEPTED' | 'UNKNOWN_EMPLOYEE' | string;
  rawPayload: string | null;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeCode: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  reviewedAt: string | null;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface TokenResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  email: string;
  roles: string[];
}

export interface HealthResponse {
  status: string;
  product: string;
  timestamp: string;
}

/* ---------------------------------------------------------------------------
   Write-path request DTOs.
   Every shape below is copied from the backend's validated request records
   (EmployeeRequest, DepartmentRequest, LeaveSubmission, LeaveDecision,
   CreateAccountRequest) — nothing is invented. Nullable/optional fields match
   the backend's absence of a @NotNull/@NotBlank constraint.
   --------------------------------------------------------------------------- */

/** Mirrors backend `EmploymentStatus` (ACTIVE | INACTIVE | RESIGNED | TERMINATED). */
export type EmploymentStatus = 'ACTIVE' | 'INACTIVE' | 'RESIGNED' | 'TERMINATED';

export const EMPLOYMENT_STATUSES: EmploymentStatus[] = [
  'ACTIVE',
  'INACTIVE',
  'RESIGNED',
  'TERMINATED',
];

/** `POST /api/employees` and `PUT /api/employees/{id}` body (EmployeeRequest). */
export interface EmployeeRequest {
  employeeCode: string;
  firstName: string;
  lastName: string;
  /** `@Email` but not `@NotBlank` — may be omitted. */
  email?: string | null;
  phone?: string | null;
  /** Free UUID; may be omitted to leave the employee unassigned. */
  departmentId?: string | null;
  /** `yyyy-MM-dd`; not constrained by the backend. */
  joiningDate?: string | null;
  status: EmploymentStatus;
}

/** `POST /api/departments` and `PUT /api/departments/{id}` body (DepartmentRequest). */
export interface DepartmentRequest {
  companyId: string;
  code: string;
  name: string;
}

/** `POST /api/leaves` body (LeaveSubmission). Employee comes from the principal. */
export interface LeaveSubmission {
  startDate: string;
  endDate: string;
  reason: string;
}

/** `PATCH /api/leaves/{id}/decision` body (LeaveDecision). */
export interface LeaveDecision {
  status: 'APPROVED' | 'REJECTED';
}

/** `POST /api/accounts` body (CreateAccountRequest) — ADMIN only. */
export interface CreateAccountRequest {
  email: string;
  /** 12-72 chars, and at most 72 UTF-8 bytes (bcrypt limit). */
  password: string;
  roles: string[];
  /** Optional link to an existing directory record. */
  employeeCode?: string | null;
}

/** Role codes the backend seeds (V3 migration). */
export type RoleCode = 'ADMIN' | 'HR' | 'EMPLOYEE';

export const ROLE_CODES: RoleCode[] = ['ADMIN', 'HR', 'EMPLOYEE'];

/** `GET /api/companies` item (CompanySummary) — needed to pick a department's company. */
export interface Company {
  id: string;
  code: string;
  name: string;
  active: boolean;
}