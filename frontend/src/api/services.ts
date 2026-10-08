import { api } from './client'
import type {
  AttendanceRecord,
  BiometricLog,
  Department,
  Employee,
  HealthResponse,
  LeaveRequest,
  PageResponse,
  TokenResponse,
} from './types'

export const authApi = {
  async login(email: string, password: string) {
    const { data } = await api.post<TokenResponse>('/api/auth/login', { email, password })
    return data
  },
  async logout(refreshToken: string) {
    await api.post('/api/auth/logout', { refreshToken })
  },
}

export const healthApi = {
  async get() {
    const { data } = await api.get<HealthResponse>('/api/health')
    return data
  },
}

export const employeeApi = {
  async list() {
    const { data } = await api.get<Employee[]>('/api/employees')
    return data
  },
  async get(id: string) {
    const { data } = await api.get<Employee>(`/api/employees/${id}`)
    return data
  },
}

export const departmentApi = {
  async list() {
    const { data } = await api.get<Department[]>('/api/departments')
    return data
  },
}

export const attendanceApi = {
  async list(page = 0, size = 20) {
    const { data } = await api.get<PageResponse<AttendanceRecord>>('/api/attendance', {
      params: { page, size },
    })
    return data
  },
}

export const biometricApi = {
  async list(page = 0, size = 20) {
    const { data } = await api.get<PageResponse<BiometricLog>>('/api/biometric/logs', {
      params: { page, size },
    })
    return data
  },
}

export const leaveApi = {
  async list() {
    const { data } = await api.get<LeaveRequest[]>('/api/leaves')
    return data
  },
}
