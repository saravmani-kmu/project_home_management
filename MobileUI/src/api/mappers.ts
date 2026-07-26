import type { FamilyMember, Task } from '../types'
import type { ApiFamilyMember, ApiTask } from './types'

export function mapMember(apiMember: ApiFamilyMember): FamilyMember {
  return {
    id: apiMember.id,
    name: apiMember.name,
    role: apiMember.role,
    color: apiMember.color,
    avatarInitials: apiMember.avatar_initials,
    relationship: apiMember.relationship,
    relationshipOther: apiMember.relationship_other ?? undefined,
  }
}

export function mapTask(apiTask: ApiTask): Task {
  return {
    id: apiTask.id,
    title: apiTask.title,
    description: apiTask.description,
    assigneeId: apiTask.assignee_id,
    createdById: apiTask.created_by_id,
    priority: apiTask.priority,
    status: apiTask.status,
    category: apiTask.category,
    dueAt: apiTask.due_at,
    reminder: {
      enabled: apiTask.reminder.enabled,
      remindAt: apiTask.reminder.remind_at,
      frequency: apiTask.reminder.frequency,
    },
    createdAt: apiTask.created_at,
  }
}
