import { memberColorMap } from '../utils/memberColors'
import type { FamilyMember } from '../types'

interface MemberAvatarProps {
  member: FamilyMember
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-14 w-14 text-base',
}

export function MemberAvatar({ member, size = 'md' }: MemberAvatarProps) {
  const colors = memberColorMap[member.color]
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${colors.bg} ${sizeClasses[size]}`}
      title={member.name}
    >
      {member.avatarInitials}
    </span>
  )
}
