import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useAuth } from './authContext'
import { AppLayout } from '../layouts/AppLayout'
import { LoginPage } from '../features/auth/LoginPage'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { EmployeeListPage } from '../features/employees/EmployeeListPage'
import { EmployeeDetailPage } from '../features/employees/EmployeeDetailPage'
import { DepartmentPage } from '../features/departments/DepartmentPage'
import { AttendancePage } from '../features/attendance/AttendancePage'
import { BiometricPage } from '../features/biometric/BiometricPage'
import { LeavePage } from '../features/leave/LeavePage'
import { SettingsPage } from '../pages/SettingsPage'

function ProtectedLayout() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />
}

function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<ProtectedLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="/employees" element={<EmployeeListPage />} />
          <Route path="/employees/:id" element={<EmployeeDetailPage />} />
          <Route path="/departments" element={<DepartmentPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/biometric" element={<BiometricPage />} />
          <Route path="/leave" element={<LeavePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
