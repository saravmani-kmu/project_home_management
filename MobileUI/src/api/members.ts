import { apiGet } from './client'
import { mapMember } from './mappers'
import type { ApiFamilyMember } from './types'
import type { FamilyMember } from '../types'

export async function fetchMembers(): Promise<FamilyMember[]> {
  const members = await apiGet<ApiFamilyMember[]>('/members')
  return members.map(mapMember)
}
