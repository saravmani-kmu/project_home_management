import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useTaskStore } from '../context/TaskStoreContext'
import { useActiveMember } from '../context/ActiveMemberContext'
import { useToast } from '../context/ToastContext'
import { MemberAvatar } from '../components/MemberAvatar'
import { Badge } from '../components/Badge'
import { categoryMeta, formatDueDate, isOverdue, priorityMeta, statusMeta } from '../utils/taskMeta'
import { sendReminder } from '../api/tasks'

const frequencyLabel: Record<string, string> = {
  none: 'Does not repeat',
  daily: 'Repeats daily',
  weekly: 'Repeats weekly',
  monthly: 'Repeats monthly',
}

export function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const { getTaskById, removeTask } = useTaskStore()
  const { members, activeMember } = useActiveMember()
  const { showToast } = useToast()

  const task = taskId ? getTaskById(taskId) : undefined

  if (!task) {
    return <Navigate to="/" replace />
  }

  const assignee = members.find((member) => member.id === task.assigneeId)
  const creator = members.find((member) => member.id === task.createdById)
  const overdue = isOverdue(task.dueAt, task.status)
  const isAdmin = activeMember.role === 'admin'

  async function handleDelete() {
    if (!task) return
    const confirmed = window.confirm(`Delete "${task.title}"? This cannot be undone.`)
    if (confirmed) {
      await removeTask(task.id)
      navigate('/')
    }
  }

  async function handleSendReminder() {
    if (!task) return
    try {
      const result = await sendReminder(task.id)
      showToast(
        result.assigneeName
          ? `Reminder sent to ${result.assigneeName}`
          : 'Reminder sent — task has no assignee yet',
      )
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not send reminder')
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-stone-500 hover:text-stone-700"
      >
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M12.79 5.23a.75.75 0 010 1.06L9.06 10l3.73 3.71a.75.75 0 11-1.06 1.06l-4.25-4.25a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 0z"
            clipRule="evenodd"
          />
        </svg>
        Back to tasks
      </Link>

      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-semibold text-stone-900">{task.title}</h1>
          <div className="flex shrink-0 gap-2">
            {isAdmin && (
              <button
                type="button"
                onClick={handleSendReminder}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600"
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM8.5 16a1.5 1.5 0 003 0h-3z" />
                </svg>
                Send reminder
              </button>
            )}
            <Link
              to={`/tasks/${task.id}/edit`}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 ring-1 ring-inset ring-stone-200 transition hover:bg-stone-100"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-rose-600 ring-1 ring-inset ring-rose-200 transition hover:bg-rose-50"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge tone={statusMeta[task.status].tone}>{statusMeta[task.status].label}</Badge>
          <Badge tone={priorityMeta[task.priority].tone}>{priorityMeta[task.priority].label}</Badge>
          <Badge tone="neutral">{categoryMeta[task.category].label}</Badge>
        </div>

        {task.description && (
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-stone-600">
            {task.description}
          </p>
        )}

        <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-stone-100 pt-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">
              Assigned to
            </dt>
            <dd className="mt-1.5 flex items-center gap-2">
              {assignee && <MemberAvatar member={assignee} size="sm" />}
              <span className="text-sm text-stone-700">{assignee?.name ?? 'Unassigned'}</span>
            </dd>
          </div>

          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">
              Created by
            </dt>
            <dd className="mt-1.5 flex items-center gap-2">
              {creator && <MemberAvatar member={creator} size="sm" />}
              <span className="text-sm text-stone-700">{creator?.name ?? 'Unknown'}</span>
            </dd>
          </div>

          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">
              Due date
            </dt>
            <dd className={`mt-1.5 text-sm ${overdue ? 'font-medium text-rose-600' : 'text-stone-700'}`}>
              {overdue ? 'Overdue · ' : ''}
              {formatDueDate(task.dueAt)}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">
              Reminder
            </dt>
            <dd className="mt-1.5 text-sm text-stone-700">
              {task.reminder.enabled ? (
                <>
                  {formatDueDate(task.reminder.remindAt)}
                  <span className="text-stone-400"> · {frequencyLabel[task.reminder.frequency]}</span>
                </>
              ) : (
                <span className="text-stone-400">No reminder set</span>
              )}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
