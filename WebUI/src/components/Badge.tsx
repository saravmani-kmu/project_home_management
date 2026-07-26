import type { ReactNode } from 'react'

export type BadgeTone = 'neutral' | 'amber' | 'rose' | 'teal' | 'slate'

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-stone-100 text-stone-600',
  amber: 'bg-amber-100 text-amber-800',
  rose: 'bg-rose-100 text-rose-700',
  teal: 'bg-teal-100 text-teal-700',
  slate: 'bg-slate-100 text-slate-600',
}

interface BadgeProps {
  children: ReactNode
  tone?: BadgeTone
}

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]}`}
    >
      {children}
    </span>
  )
}
