import { StyleSheet, Text, View } from 'react-native'
import type { FamilyMember } from '../types'
import { memberColorHex } from '../utils/theme'

interface MemberAvatarProps {
  member: Pick<FamilyMember, 'color' | 'avatarInitials'>
  size?: number
}

export function MemberAvatar({ member, size = 32 }: MemberAvatarProps) {
  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: memberColorHex[member.color],
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.4 }]}>{member.avatarInitials}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#ffffff',
    fontWeight: '600',
  },
})
