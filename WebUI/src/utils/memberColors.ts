import type { MemberColor } from '../types'

interface ColorTokens {
  bg: string
  text: string
  ring: string
  dot: string
  chipBg: string
  chipText: string
}

export const memberColorMap: Record<MemberColor, ColorTokens> = {
  amber: {
    bg: 'bg-amber-500',
    text: 'text-amber-700',
    ring: 'ring-amber-300',
    dot: 'bg-amber-500',
    chipBg: 'bg-amber-50',
    chipText: 'text-amber-800',
  },
  teal: {
    bg: 'bg-teal-500',
    text: 'text-teal-700',
    ring: 'ring-teal-300',
    dot: 'bg-teal-500',
    chipBg: 'bg-teal-50',
    chipText: 'text-teal-800',
  },
  rose: {
    bg: 'bg-rose-500',
    text: 'text-rose-700',
    ring: 'ring-rose-300',
    dot: 'bg-rose-500',
    chipBg: 'bg-rose-50',
    chipText: 'text-rose-800',
  },
  violet: {
    bg: 'bg-violet-500',
    text: 'text-violet-700',
    ring: 'ring-violet-300',
    dot: 'bg-violet-500',
    chipBg: 'bg-violet-50',
    chipText: 'text-violet-800',
  },
  sky: {
    bg: 'bg-sky-500',
    text: 'text-sky-700',
    ring: 'ring-sky-300',
    dot: 'bg-sky-500',
    chipBg: 'bg-sky-50',
    chipText: 'text-sky-800',
  },
  lime: {
    bg: 'bg-lime-500',
    text: 'text-lime-700',
    ring: 'ring-lime-300',
    dot: 'bg-lime-500',
    chipBg: 'bg-lime-50',
    chipText: 'text-lime-800',
  },
}
