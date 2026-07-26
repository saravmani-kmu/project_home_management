import { ApiError, apiDelete, apiGet, apiPost, apiPut } from './client'
import { mapInvite, mapMember } from './mappers'
import type { ApiFamilyMember, ApiMemberInput, ApiMemberInvite } from './types'
import type { FamilyMember, MemberInvite } from '../types'

export interface FetchMembersResult {
  members: FamilyMember[]
  memberIdsWithInvite: string[]
}

export async function fetchMembers(): Promise<FetchMembersResult> {
  const apiMembers = await apiGet<ApiFamilyMember[]>('/members')
  return {
    members: apiMembers.map(mapMember),
    memberIdsWithInvite: apiMembers.filter((member) => member.has_invite).map((member) => member.id),
  }
}

export async function createMember(input: ApiMemberInput): Promise<FamilyMember> {
  const member = await apiPost<ApiFamilyMember>('/members', input)
  return mapMember(member)
}

export async function updateMember(id: string, input: ApiMemberInput): Promise<FamilyMember> {
  const member = await apiPut<ApiFamilyMember>(`/members/${id}`, input)
  return mapMember(member)
}

export function deleteMember(id: string): Promise<void> {
  return apiDelete(`/members/${id}`)
}

export async function generateInvite(memberId: string): Promise<MemberInvite> {
  const invite = await apiPost<ApiMemberInvite>(`/members/${memberId}/invite`)
  return mapInvite(invite)
}

export async function fetchInvite(memberId: string): Promise<MemberInvite | null> {
  try {
    const invite = await apiGet<ApiMemberInvite>(`/members/${memberId}/invite`)
    return mapInvite(invite)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }
    throw error
  }
}
