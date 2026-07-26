import { apiGet, apiPost } from './client'
import { mapMember } from './mappers'
import type { ApiFamilyMember } from './types'
import type { FamilyMember } from '../types'
import { env } from '../config/env'

export async function fetchCurrentAdmin(): Promise<FamilyMember> {
  const member = await apiGet<ApiFamilyMember>('/auth/me')
  return mapMember(member)
}

export function googleLoginUrl(intent: 'login' | 'signup', redirectUrl: string): string {
  const params = new URLSearchParams({ intent, platform: 'mobile', redirect_uri: redirectUrl })
  return `${env.apiUrl}/api/auth/google/login?${params.toString()}`
}

export interface OnboardingInput {
  pendingToken: string
  name: string
  familyName: string
}

export interface OnboardingResult {
  member: FamilyMember
  sessionToken: string
}

export async function completeOnboarding(input: OnboardingInput): Promise<OnboardingResult> {
  const result = await apiPost<{ member: ApiFamilyMember; session_token: string }>(
    '/auth/onboarding',
    {
      pending_token: input.pendingToken,
      name: input.name,
      family_name: input.familyName,
    },
  )
  return {
    member: mapMember(result.member),
    sessionToken: result.session_token,
  }
}
