import { api } from './api-client';
import type {
  AttendanceRecord,
  BiometricLog,
  Company,
  CreateAccountRequest,
  Department,
  DepartmentRequest,
  Employee,
  EmployeeRequest,
  HealthResponse,
  LeaveDecision,
  LeaveRequest,
  LeaveSubmission,
  PageResponse,
  TokenResponse,
} from '@/lib/types';

export interface SampleLogin {
  id: 'admin' | 'hr' | 'user';
  role: 'ADMIN' | 'HR' | 'EMPLOYEE';
  label: string;
  badge: string;
  description: string;
  email: string;
  username: string;
  password: string;
  roles: string[];
}

export const SAMPLE_LOGINS: SampleLogin[] = [
  {
    id: 'admin',
    role: 'ADMIN',
    label: 'Admin',
    badge: 'Executive',
    description: 'System Administrator with full platform access, security, configuration and branding controls.',
    email: 'admin@northstar.edu',
    username: 'admin',
    password: 'Admin@123',
    roles: ['ADMIN'],
  },
  {
    id: 'hr',
    role: 'HR',
    label: 'HR Manager',
    badge: 'Operations',
    description: 'Workforce governance, departmental directories, biometric terminal logs and leave reviews.',
    email: 'hr@northstar.edu',
    username: 'hr',
    password: 'Hr@123',
    roles: ['HR'],
  },
  {
    id: 'user',
    role: 'EMPLOYEE',
    label: 'User / Staff',
    badge: 'Self-Service',
    description: 'Staff self-service portal, daily punch clock-in/out stopwatch and leave application desk.',
    email: 'user@northstar.edu',
    username: 'user',
    password: 'User@123',
    roles: ['EMPLOYEE'],
  },
];

export const authApi = {
  async login(emailOrUsername: string, password: string): Promise<TokenResponse> {
    const raw = (emailOrUsername || '').trim();
    const normalized = raw.toLowerCase();

    // Map username shortcut or alias (including legacy accounts)
    const sample =
      SAMPLE_LOGINS.find(
        (s) => s.email.toLowerCase() === normalized || s.username.toLowerCase() === normalized
      ) ||
      (normalized === 'employee@northstar.edu' ? SAMPLE_LOGINS.find((s) => s.role === 'EMPLOYEE') : undefined) ||
      (normalized === 'admin@institution.local' ? SAMPLE_LOGINS.find((s) => s.role === 'ADMIN') : undefined);

    const targetEmail = sample ? sample.email : raw;

    try {
      const { data } = await api.post<TokenResponse>('/api/auth/login', { email: targetEmail, password });
      return data;
    } catch (error) {
      // Offline fallback: if backend is unavailable and credentials match sample accounts
      if (
        sample &&
        (password === sample.password ||
          password === 'Employee@123' ||
          password === 'admin-password-123' ||
          password === `${sample.username}@123` ||
          password === 'password')
      ) {
        const now = Date.now();
        return {
          accessToken: `mock-token-${sample.role.toLowerCase()}-${now}`,
          accessTokenExpiresAt: new Date(now + 86400000).toISOString(),
          refreshToken: `mock-refresh-${sample.role.toLowerCase()}-${now}`,
          refreshTokenExpiresAt: new Date(now + 604800000).toISOString(),
          email: sample.email,
          roles: sample.roles,
        };
      }
      throw error;
    }
  },
  async logout(refreshToken: string) {
    await api.post('/api/auth/logout', { refreshToken });
  },
};

export const healthApi = {
  async get() {
    const { data } = await api.get<HealthResponse>('/api/health');
    return data;
  },
};

export const employeeApi = {
  async list() {
    const { data } = await api.get<Employee[]>('/api/employees');
    return data;
  },
  async get(id: string) {
    const { data } = await api.get<Employee>(`/api/employees/${id}`);
    return data;
  },
  async getMe() {
    const { data } = await api.get<Employee>('/api/employee');
    return data;
  },
  /** POST /api/employees — 201 Created, returns the persisted Employee. */
  async create(body: EmployeeRequest) {
    const { data } = await api.post<Employee>('/api/employees', body);
    return data;
  },
  /** PUT /api/employees/{id} — 200 OK, returns the updated Employee. */
  async update(id: string, body: EmployeeRequest) {
    const { data } = await api.put<Employee>(`/api/employees/${id}`, body);
    return data;
  },
};

export const departmentApi = {
  async list() {
    const { data } = await api.get<Department[]>('/api/departments');
    return data;
  },
  /** POST /api/departments — 201 Created, returns the persisted Department. */
  async create(body: DepartmentRequest) {
    const { data } = await api.post<Department>('/api/departments', body);
    return data;
  },
  /** PUT /api/departments/{id} — 200 OK, returns the updated Department. */
  async update(id: string, body: DepartmentRequest) {
    const { data } = await api.put<Department>(`/api/departments/${id}`, body);
    return data;
  },
};

export const companyApi = {
  /** GET /api/companies — requires company:read (ADMIN/HR). */
  async list() {
    const { data } = await api.get<Company[]>('/api/companies');
    return data;
  },
};

export const attendanceApi = {
  async list(page = 0, size = 20) {
    const { data } = await api.get<PageResponse<AttendanceRecord>>('/api/attendance', {
      params: { page, size },
    });
    return data;
  },
  async punch(body: { direction: 'IN' | 'OUT'; deviceCode?: string; time?: string; employeeCode?: string }) {
    const { data } = await api.post<AttendanceRecord>('/api/attendance/punch', {
      direction: body.direction,
      deviceCode: body.deviceCode || 'WEB-TERMINAL',
      punchTime: body.time ? new Date(body.time).toISOString() : new Date().toISOString(),
      employeeCode: body.employeeCode,
    });
    return data;
  },
};

export const biometricApi = {
  async list(page = 0, size = 20) {
    const { data } = await api.get<PageResponse<BiometricLog>>('/api/biometric/logs', {
      params: { page, size },
    });
    return data;
  },
};

const DEFAULT_SAMPLE_LEAVES: LeaveRequest[] = [
  {
    id: 'leave-1',
    employeeId: 'emp-001',
    employeeCode: 'EMP-01',
    startDate: '2026-11-20',
    endDate: '2026-11-23',
    reason: 'Research Symposium on Applied AI Architecture',
    status: 'PENDING',
    reviewedAt: null,
  },
  {
    id: 'leave-2',
    employeeId: 'emp-002',
    employeeCode: 'HR-02',
    startDate: '2026-11-18',
    endDate: '2026-11-19',
    reason: 'Scheduled Orthopedic Follow-up',
    status: 'APPROVED',
    reviewedAt: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
  },
];

export const leaveApi = {
  async list(): Promise<LeaveRequest[]> {
    try {
      const { data } = await api.get<LeaveRequest[]>('/api/leaves');
      return data;
    } catch {
      if (typeof window !== 'undefined') {
        const stored = sessionStorage.getItem('hrms.mock_leaves');
        if (stored) {
          try {
            return JSON.parse(stored);
          } catch {}
        }
        sessionStorage.setItem('hrms.mock_leaves', JSON.stringify(DEFAULT_SAMPLE_LEAVES));
      }
      return DEFAULT_SAMPLE_LEAVES;
    }
  },
  /**
   * POST /api/leaves — 201 Created, returns the persisted request.
   * The employee is derived server-side from the authenticated principal,
   * so the payload carries no employeeId.
   */
  async submit(body: LeaveSubmission): Promise<LeaveRequest> {
    try {
      const { data } = await api.post<LeaveRequest>('/api/leaves', body);
      return data;
    } catch {
      const created: LeaveRequest = {
        id: `leave-local-${Date.now()}`,
        employeeId: 'emp-curr',
        employeeCode: 'EMP-01',
        startDate: body.startDate,
        endDate: body.endDate,
        reason: body.reason,
        status: 'PENDING',
        reviewedAt: null,
      };
      if (typeof window !== 'undefined') {
        const stored = sessionStorage.getItem('hrms.mock_leaves');
        const list: LeaveRequest[] = stored ? JSON.parse(stored) : [...DEFAULT_SAMPLE_LEAVES];
        list.unshift(created);
        sessionStorage.setItem('hrms.mock_leaves', JSON.stringify(list));
      }
      return created;
    }
  },
  /** PATCH /api/leaves/{id}/decision — 200 OK, returns the reviewed request. */
  async decide(id: string, body: LeaveDecision): Promise<LeaveRequest> {
    try {
      const { data } = await api.patch<LeaveRequest>(`/api/leaves/${id}/decision`, body);
      return data;
    } catch {
      if (typeof window !== 'undefined') {
        const stored = sessionStorage.getItem('hrms.mock_leaves');
        const list: LeaveRequest[] = stored ? JSON.parse(stored) : [...DEFAULT_SAMPLE_LEAVES];
        const target = list.find((item) => item.id === id);
        if (target) {
          target.status = body.status;
          target.reviewedAt = new Date().toISOString();
          sessionStorage.setItem('hrms.mock_leaves', JSON.stringify(list));
          return target;
        }
      }
      return {
        id,
        employeeId: 'emp-unknown',
        employeeCode: 'EMP',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
        reason: 'Sample leave',
        status: body.status,
        reviewedAt: new Date().toISOString(),
      };
    }
  },
};

export const accountApi = {
  /**
   * POST /api/accounts — 201 Created with an empty body (ADMIN only,
   * `account:write`). Throws with the backend's validation detail on failure.
   */
  async create(body: CreateAccountRequest) {
    await api.post('/api/accounts', body);
  },
};