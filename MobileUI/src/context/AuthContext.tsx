import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { fetchCurrentAdmin } from '../api/auth'
import { clearSessionToken, getSessionToken, setSessionToken } from '../api/client'
import type { FamilyMember } from '../types'

export type AuthStatus = 'checking' | 'unauthenticated' | 'pending' | 'authenticated'

interface AuthContextValue {
  status: AuthStatus
  admin: FamilyMember | null
  pendingToken: string | null
  beginSession: (token: string) => Promise<void>
  beginPendingOnboarding: (pendingToken: string) => void
  completeOnboarding: (admin: FamilyMember, sessionToken: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<FamilyMember | null>(null)
  const [pendingToken, setPendingToken] = useState<string | null>(null)
  const [status, setStatus] = useState<AuthStatus>('checking')

  useEffect(() => {
    let cancelled = false

    getSessionToken().then((token) => {
      if (cancelled) return
      if (!token) {
        setStatus('unauthenticated')
        return
      }
      fetchCurrentAdmin()
        .then((current) => {
          if (cancelled) return
          setAdmin(current)
          setStatus('authenticated')
        })
        .catch(async () => {
          if (cancelled) return
          await clearSessionToken()
          setAdmin(null)
          setStatus('unauthenticated')
        })
    })

    return () => {
      cancelled = true
    }
  }, [])

  const beginSession = useCallback(async (token: string) => {
    await setSessionToken(token)
    setPendingToken(null)
    setStatus('checking')
    try {
      const current = await fetchCurrentAdmin()
      setAdmin(current)
      setStatus('authenticated')
    } catch {
      await clearSessionToken()
      setStatus('unauthenticated')
    }
  }, [])

  const beginPendingOnboarding = useCallback((token: string) => {
    setPendingToken(token)
    setStatus('pending')
  }, [])

  const completeOnboarding = useCallback(async (newAdmin: FamilyMember, sessionToken: string) => {
    await setSessionToken(sessionToken)
    setPendingToken(null)
    setAdmin(newAdmin)
    setStatus('authenticated')
  }, [])

  const logout = useCallback(async () => {
    await clearSessionToken()
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
