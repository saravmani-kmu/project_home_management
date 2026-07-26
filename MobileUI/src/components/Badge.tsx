import { StyleSheet, Text, View } from 'react-native'
import type { BadgeTone } from '../utils/taskMeta'
import { badgeToneColors } from '../utils/theme'

interface BadgeProps {
  label: string
  tone: BadgeTone
}

export function Badge({ label, tone }: BadgeProps) {
  const palette = badgeToneColors[tone]
  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
})
