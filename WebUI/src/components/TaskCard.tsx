import { Link } from 'react-router-dom'
import type { FamilyMember, Task } from '../types'
import { MemberAvatar } from './MemberAvatar'
import { Badge } from './Badge'
import { categoryMeta, formatDueDate, isOverdue, priorityMeta, statusMeta } from '../utils/taskMeta'

interface TaskCardProps {
  task: Task
  assignee: FamilyMember | undefined
}

export function TaskCard({ task, assignee }: TaskCardProps) {
  const overdue = isOverdue(task.dueAt, task.status)

  return (
    <Link
      to={`/tasks/${task.id}`}
      className="group flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold leading-snug text-stone-900 group-hover:text-amber-800">
          {task.title}
        </h3>
        {assignee && <MemberAvatar member={assignee} size="sm" />}
      </div>

      {task.description && (
        <p className="line-clamp-2 text-sm text-stone-500">{task.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        <Badge tone={statusMeta[task.status].tone}>{statusMeta[task.status].label}</Badge>
        <Badge tone={priorityMeta[task.priority].tone}>{priorityMeta[task.priority].label}</Badge>
        <Badge tone="neutral">{categoryMeta[task.category].label}</Badge>
      </div>

      <div className="mt-auto flex items-center justify-between text-xs">
        <span className={overdue ? 'font-medium text-rose-600' : 'text-stone-400'}>
          {overdue ? 'Overdue · ' : ''}
          {formatDueDate(task.dueAt)}
        </span>
        {task.reminder.enabled && (
          <span className="inline-flex items-center gap-1 text-stone-400">
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM8.5 16a1.5 1.5 0 003 0h-3z" />
            </svg>
            Reminder
          </span>
        )}
      </div>
    </Link>
  )
}
