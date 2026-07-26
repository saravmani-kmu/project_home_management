import type { TaskCategory, TaskPriority, TaskStatus } from '../types'

export type BadgeTone = 'neutral' | 'amber' | 'rose' | 'teal' | 'slate'

export const priorityMeta: Record<TaskPriority, { label: string; tone: BadgeTone }> = {
  low: { label: 'Low priority', tone: 'slate' },
  medium: { label: 'Medium priority', tone: 'amber' },
  high: { label: 'High priority', tone: 'rose' },
}

export const statusMeta: Record<TaskStatus, { label: string; tone: BadgeTone }> = {
  todo: { label: 'To do', tone: 'neutral' },
  in_progress: { label: 'In progress', tone: 'amber' },
  done: { label: 'Done', tone: 'teal' },
}

export const categoryMeta: Record<TaskCategory, { label: string }> = {
  chores: { label: 'Chores' },
  bills: { label: 'Bills' },
  shopping: { label: 'Shopping' },
  maintenance: { label: 'Maintenance' },
  other: { label: 'Other' },
}

export const statusOrder: TaskStatus[] = ['todo', 'in_progress', 'done']

export function formatDueDate(dueAt: string | null): string {
  if (!dueAt) return 'No due date'
  const date = new Date(dueAt)
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function isOverdue(dueAt: string | null, status: TaskStatus): boolean {
  if (!dueAt || status === 'done') return false
  return new Date(dueAt).getTime() < Date.now()
}
