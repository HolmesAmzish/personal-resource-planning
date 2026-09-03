import { User } from 'oidc-client-ts'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { setAuthToken } from '../lib/apiClient'
import { getUserManager } from '../lib/auth'

interface AuthValue {
  user: User | null
  token: string | null
  ready: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
  handleCallback: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    getUserManager()
      .getUser()
      .then((u) => {
        setUser(u)
        setAuthToken(u?.access_token ?? null)
      })
      .finally(() => setReady(true))
    const on401 = () => {
      setUser(null)
      setAuthToken(null)
      getUserManager().removeUser().catch(() => undefined)
      if (window.location.pathname !== '/login') window.location.assign('/login')
    }
    window.addEventListener('prp:unauthorized', on401)
    return () => window.removeEventListener('prp:unauthorized', on401)
  }, [])

  const login = useCallback(async () => {
    await getUserManager().signinRedirect()
  }, [])

  const logout = useCallback(async () => {
    await getUserManager().signoutRedirect().catch(() => undefined)
    setUser(null)
    setAuthToken(null)
  }, [])

  const handleCallback = useCallback(async () => {
    const u = await getUserManager().signinRedirectCallback()
    setUser(u)
    setAuthToken(u?.access_token ?? null)
  }, [])

  const value = useMemo<AuthValue>(
    () => ({ user, token: user?.access_token ?? null, ready, login, logout, handleCallback }),
    [user, ready, login, logout, handleCallback],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const v = useContext(AuthContext)
  if (!v) throw new Error('useAuth must be used inside AuthProvider')
  return v
}
