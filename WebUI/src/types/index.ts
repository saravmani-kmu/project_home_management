export type MemberColor =
  | 'amber'
  | 'teal'
  | 'rose'
  | 'violet'
  | 'sky'
  | 'lime'

export type RelationshipType =
  | 'wife'
  | 'husband'
  | 'son'
  | 'daughter'
  | 'mother'
  | 'father'
  | 'grandmother'
  | 'grandfather'
  | 'other'

export interface FamilyMember {
  id: string
  name: string
  role: 'admin' | 'member'
  color: MemberColor
  avatarInitials: string
  relationship: RelationshipType
  relationshipOther?: string
}

export interface MemberInvite {
  token: string
  createdAt: string
}

export type TaskPriority = 'low' | 'medium' | 'high'

export type TaskStatus = 'todo' | 'in_progress' | 'done'

export type TaskCategory =
  | 'chores'
  | 'bills'
  | 'shopping'
  | 'maintenance'
  | 'other'

export type ReminderFrequency = 'none' | 'daily' | 'weekly' | 'monthly'

export interface TaskReminder {
  enabled: boolean
  remindAt: string | null
  frequency: ReminderFrequency
}

export interface Task {
  id: string
  title: string
  description: string
  assigneeId: string
  createdById: string
  priority: TaskPriority
  status: TaskStatus
  category: TaskCategory
  dueAt: string | null
  reminder: TaskReminder
  createdAt: string
}
