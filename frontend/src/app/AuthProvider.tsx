import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/services'
import { AuthContext } from './authContext'
import {
  clearTokens,
  getSessionEmail,
  hasSession,
  saveSessionEmail,
  saveTokens,
} from '../api/client'
import type { TokenResponse } from '../api/types'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(hasSession)
  const [email, setEmail] = useState(getSessionEmail)
  const navigate = useNavigate()

  const acceptSession = useCallback((tokens: TokenResponse) => {
    saveTokens(tokens)
    saveSessionEmail(tokens.email)
    setEmail(tokens.email)
    setIsAuthenticated(true)
  }, [])

  const login = useCallback(
    async (username: string, password: string) => {
      const tokens = await authApi.login(username, password)
      acceptSession(tokens)
    },
    [acceptSession],
  )

  const logout = useCallback(async () => {
    const refreshToken = sessionStorage.getItem('hrms.refreshToken')
    try {
      if (refreshToken) await authApi.logout(refreshToken)
    } finally {
      clearTokens()
      sessionStorage.removeItem('hrms.email')
      setIsAuthenticated(false)
      setEmail('')
      navigate('/login', { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    const handleExpired = () => {
      clearTokens()
      sessionStorage.removeItem('hrms.email')
      setIsAuthenticated(false)
      setEmail('')
      navigate('/login', { replace: true, state: { expired: true } })
    }
    window.addEventListener('hrms:session-expired', handleExpired)
    return () => window.removeEventListener('hrms:session-expired', handleExpired)
  }, [navigate])

  const value = useMemo(
    () => ({ email, isAuthenticated, login, logout }),
    [email, isAuthenticated, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
