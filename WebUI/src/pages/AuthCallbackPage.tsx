import { useEffect, useState } from 'react'
import { setSessionToken } from '../api/client'

const PENDING_TOKEN_KEY = 'hearth.pendingToken'

export function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : ''
    const params = new URLSearchParams(hash)
    const token = params.get('token')
    const pending = params.get('pending')

    if (token) {
      setSessionToken(token)
      sessionStorage.removeItem(PENDING_TOKEN_KEY)
      // Full reload (not client-side navigation) so AuthProvider re-runs its
      // initial session check from a clean mount.
      window.location.replace('/')
      return
    }

    if (pending) {
      sessionStorage.setItem(PENDING_TOKEN_KEY, pending)
      window.location.replace('/onboarding')
      return
    }

    setError('No sign-in token was returned by Google.')
  }, [])

  if (error) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-stone-50 px-4 text-center text-sm text-rose-600">
        {error}
      </div>
    )
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-stone-50 text-sm text-stone-500">
      Signing you in…
    </div>
  )
}
