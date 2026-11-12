import { createContext, useContext } from 'react';

export interface AuthContextValue {
  email: string;
  /** Role codes from the login response (ADMIN, HR, EMPLOYEE). UI gating only — the API enforces authorization. */
  roles: string[];
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
