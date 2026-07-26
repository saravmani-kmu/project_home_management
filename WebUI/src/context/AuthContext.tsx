import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { fetchCurrentAdmin } from '../api/auth'
import { clearSessionToken, getSessionToken, setSessionToken } from '../api/client'
import type { FamilyMember } from '../types'

export type AuthStatus = 'checking' | 'unauthenticated' | 'pending' | 'authenticated'

interface AuthContextValue {
  status: AuthStatus
  admin: FamilyMember | null
  pendingToken: string | null
  beginSession: (token: string) => void
  beginPendingOnboarding: (pendingToken: string) => void
  completeOnboarding: (admin: FamilyMember, sessionToken: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const PENDING_TOKEN_KEY = 'hearth.pendingToken'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<FamilyMember | null>(null)
  const [pendingToken, setPendingToken] = useState<string | null>(() =>
    sessionStorage.getItem(PENDING_TOKEN_KEY),
  )
  const [status, setStatus] = useState<AuthStatus>('checking')

  useEffect(() => {
    let cancelled = false

    if (!getSessionToken()) {
      setStatus(pendingToken ? 'pending' : 'unauthenticated')
      return
    }

    fetchCurrentAdmin()
      .then((current) => {
        if (cancelled) return
        setAdmin(current)
        setStatus('authenticated')
      })
      .catch(() => {
        if (cancelled) return
        clearSessionToken()
        setAdmin(null)
        setStatus(pendingToken ? 'pending' : 'unauthenticated')
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const beginSession = useCallback((token: string) => {
    setSessionToken(token)
    sessionStorage.removeItem(PENDING_TOKEN_KEY)
    setPendingToken(null)
    setStatus('checking')
    fetchCurrentAdmin()
      .then((current) => {
        setAdmin(current)
        setStatus('authenticated')
      })
      .catch(() => {
        clearSessionToken()
        setStatus('unauthenticated')
      })
  }, [])

  const beginPendingOnboarding = useCallback((token: string) => {
    sessionStorage.setItem(PENDING_TOKEN_KEY, token)
    setPendingToken(token)
    setStatus('pending')
  }, [])

  const completeOnboarding = useCallback((newAdmin: FamilyMember, sessionToken: string) => {
    setSessionToken(sessionToken)
    sessionStorage.removeItem(PENDING_TOKEN_KEY)
    setPendingToken(null)
    setAdmin(newAdmin)
    setStatus('authenticated')
  }, [])

  const logout = useCallback(() => {
    clearSessionToken()
    sessionStorage.removeItem(PENDING_TOKEN_KEY)
    setPendingToken(null)
    setAdmin(null)
    setStatus('unauthenticated')
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      admin,
      pendingToken,
      beginSession,
      beginPendingOnboarding,
      completeOnboarding,
      logout,
    }),
    [status, admin, pendingToken, beginSession, beginPendingOnboarding, completeOnboarding, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useRequireAdmin(): FamilyMember {
  const { admin } = useAuth()
  if (!admin) {
    throw new Error('useRequireAdmin called outside an authenticated route')
  }
  return admin
}
