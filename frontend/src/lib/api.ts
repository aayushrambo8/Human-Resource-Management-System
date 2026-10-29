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

export const authApi = {
  async login(email: string, password: string) {
    const { data } = await api.post<TokenResponse>('/api/auth/login', { email, password });
    return data;
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
};

export const biometricApi = {
  async list(page = 0, size = 20) {
    const { data } = await api.get<PageResponse<BiometricLog>>('/api/biometric/logs', {
      params: { page, size },
    });
    return data;
  },
};

export const leaveApi = {
  async list() {
    const { data } = await api.get<LeaveRequest[]>('/api/leaves');
    return data;
  },
  /**
   * POST /api/leaves — 201 Created, returns the persisted request.
   * The employee is derived server-side from the authenticated principal,
   * so the payload carries no employeeId.
   */
  async submit(body: LeaveSubmission) {
    const { data } = await api.post<LeaveRequest>('/api/leaves', body);
    return data;
  },
  /** PATCH /api/leaves/{id}/decision — 200 OK, returns the reviewed request. */
  async decide(id: string, body: LeaveDecision) {
    const { data } = await api.patch<LeaveRequest>(`/api/leaves/${id}/decision`, body);
    return data;
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