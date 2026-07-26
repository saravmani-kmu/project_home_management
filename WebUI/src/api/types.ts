import type {
  MemberColor,
  ReminderFrequency,
  RelationshipType,
  TaskCategory,
  TaskPriority,
  TaskStatus,
} from '../types'

export interface ApiFamilyMember {
  id: string
  name: string
  role: 'admin' | 'member'
  color: MemberColor
  avatar_initials: string
  relationship: RelationshipType
  relationship_other: string | null
  has_invite: boolean
  created_at: string
}

export interface ApiMemberInvite {
  token: string
  created_at: string
}

export interface ApiTaskReminder {
  enabled: boolean
  remind_at: string | null
  frequency: ReminderFrequency
}

export interface ApiTask {
  id: string
  title: string
  description: string
  assignee_id: string
  created_by_id: string
  priority: TaskPriority
  status: TaskStatus
  category: TaskCategory
  due_at: string | null
  reminder: ApiTaskReminder
  created_at: string
}

export interface ApiMemberInput {
  name: string
  role: 'admin' | 'member'
  relationship: RelationshipType
  relationship_other?: string | null
}

export interface ApiTaskInput {
  title: string
  description: string
  assignee_id: string
  priority: TaskPriority
  status: TaskStatus
  category: TaskCategory
  due_at: string | null
  reminder: ApiTaskReminder
}
