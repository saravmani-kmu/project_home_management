import type { FamilyMember, RelationshipType } from '../types'

export const relationshipLabel: Record<RelationshipType, string> = {
  wife: 'Wife',
  husband: 'Husband',
  son: 'Son',
  daughter: 'Daughter',
  mother: 'Mother',
  father: 'Father',
  grandmother: 'Grandmother',
  grandfather: 'Grandfather',
  other: 'Other',
}

export function formatRelationship(member: FamilyMember): string {
  if (member.relationship === 'other' && member.relationshipOther?.trim()) {
    return member.relationshipOther.trim()
  }
  return relationshipLabel[member.relationship]
}
