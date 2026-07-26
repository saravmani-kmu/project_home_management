import * as SecureStore from 'expo-secure-store'
import { env } from '../config/env'

const TOKEN_STORAGE_KEY = 'hearth.sessionToken'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

export function getSessionToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_STORAGE_KEY)
}

export function setSessionToken(token: string): Promise<void> {
  return SecureStore.setItemAsync(TOKEN_STORAGE_KEY, token)
}

export function clearSessionToken(): Promise<void> {
  return SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY)
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getSessionToken()
  const response = await fetch(`${env.apiUrl}/api${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })

  if (!response.ok) {
    let detail = response.statusText
    try {
      const body = await response.json()
      detail = body.detail ?? detail
    } catch {
      // response body wasn't JSON — fall back to statusText
    }
    throw new ApiError(response.status, detail)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path)
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined })
}

export function apiPut<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'PUT', body: JSON.stringify(body) })
}

export function apiDelete(path: string): Promise<void> {
  return request<void>(path, { method: 'DELETE' })
}
