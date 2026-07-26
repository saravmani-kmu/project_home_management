import type { MemberColor } from '../types'
import type { BadgeTone } from './taskMeta'

export const colors = {
  bg: '#fafaf9',
  card: '#ffffff',
  border: '#e7e5e4',
  textPrimary: '#1c1917',
  textSecondary: '#78716c',
  textMuted: '#a8a29e',
  accent: '#f59e0b',
  accentDark: '#d97706',
  danger: '#e11d48',
}

export const memberColorHex: Record<MemberColor, string> = {
  amber: '#f59e0b',
  teal: '#14b8a6',
  rose: '#f43f5e',
  violet: '#8b5cf6',
  sky: '#0ea5e9',
  lime: '#84cc16',
}

export const badgeToneColors: Record<BadgeTone, { bg: string; text: string }> = {
  neutral: { bg: '#f5f5f4', text: '#57534e' },
  amber: { bg: '#fef3c7', text: '#92400e' },
  rose: { bg: '#ffe4e6', text: '#9f1239' },
  teal: { bg: '#ccfbf1', text: '#115e59' },
  slate: { bg: '#f1f5f9', text: '#475569' },
}
