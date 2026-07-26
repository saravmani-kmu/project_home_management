import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import { googleLoginUrl } from './auth'

export type GoogleAuthOutcome =
  | { type: 'session'; token: string }
  | { type: 'pending'; token: string }
  | { type: 'cancelled' }

export async function signInWithGoogle(intent: 'login' | 'signup'): Promise<GoogleAuthOutcome> {
  const redirectUrl = Linking.createURL('auth/callback')
  const result = await WebBrowser.openAuthSessionAsync(
    googleLoginUrl(intent, redirectUrl),
    redirectUrl,
  )

  if (result.type !== 'success') {
    return { type: 'cancelled' }
  }

  const fragment = result.url.split('#')[1] ?? ''
  const params = new URLSearchParams(fragment)
  const token = params.get('token')
  const pending = params.get('pending')

  if (token) return { type: 'session', token }
  if (pending) return { type: 'pending', token: pending }
  return { type: 'cancelled' }
}
