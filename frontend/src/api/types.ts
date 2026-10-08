export interface Employee {
  id: string
  employeeCode: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  departmentId: string | null
  departmentName: string | null
  joiningDate: string | null
  status: 'ACTIVE' | 'INACTIVE' | 'TERMINATED' | string
}

export interface Department {
  id: string
  companyId: string
  companyCode: string
  code: string
  name: string
}

export interface AttendanceRecord {
  id: string
  employeeId: string
  employeeCode: string
  employeeName: string
  deviceCode: string
  punchTime: string
  direction: 'IN' | 'OUT' | 'UNKNOWN' | string
}

export interface BiometricLog {
  id: string
  deviceCode: string
  employeeCode: string
  punchTime: string
  direction: 'IN' | 'OUT' | 'UNKNOWN' | string
  status: 'ACCEPTED' | 'UNKNOWN_EMPLOYEE' | string
  rawPayload: string | null
}

export interface LeaveRequest {
  id: string
  employeeId: string
  employeeCode: string
  startDate: string
  endDate: string
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string
  reviewedAt: string | null
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface TokenResponse {
  accessToken: string
  accessTokenExpiresAt: string
  refreshToken: string
  refreshTokenExpiresAt: string
  email: string
  roles: string[]
}

export interface HealthResponse {
  status: string
  product: string
  timestamp: string
}
