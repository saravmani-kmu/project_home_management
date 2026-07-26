import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useActiveMember } from '../context/ActiveMemberContext'
import { useTaskStore } from '../context/TaskStoreContext'
import type { ReminderFrequency, Task, TaskCategory, TaskPriority, TaskStatus } from '../types'
import { categoryMeta, priorityMeta, statusMeta } from '../utils/taskMeta'

interface TaskFormProps {
  initialTask?: Task
}

function toDatetimeLocal(value: string | null): string {
  if (!value) return ''
  return value.slice(0, 16)
}

export function TaskForm({ initialTask }: TaskFormProps) {
  const navigate = useNavigate()
  const { members, activeMember } = useActiveMember()
  const { addTask, updateTask } = useTaskStore()
  const isEditing = Boolean(initialTask)

  const [title, setTitle] = useState(initialTask?.title ?? '')
  const [description, setDescription] = useState(initialTask?.description ?? '')
  const [assigneeId, setAssigneeId] = useState(initialTask?.assigneeId ?? activeMember.id)
  const [priority, setPriority] = useState<TaskPriority>(initialTask?.priority ?? 'medium')
  const [status, setStatus] = useState<TaskStatus>(initialTask?.status ?? 'todo')
  const [category, setCategory] = useState<TaskCategory>(initialTask?.category ?? 'chores')
  const [dueAt, setDueAt] = useState(toDatetimeLocal(initialTask?.dueAt ?? null))
  const [reminderEnabled, setReminderEnabled] = useState(initialTask?.reminder.enabled ?? false)
  const [remindAt, setRemindAt] = useState(toDatetimeLocal(initialTask?.reminder.remindAt ?? null))
  const [frequency, setFrequency] = useState<ReminderFrequency>(
    initialTask?.reminder.frequency ?? 'none',
  )
  const [titleError, setTitleError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) {
      setTitleError('Give the task a title so your family knows what it is.')
      return
    }

    const taskInput = {
      title: title.trim(),
      description: description.trim(),
      assigneeId,
      createdById: initialTask?.createdById ?? activeMember.id,
      priority,
      status,
      category,
      dueAt: dueAt ? new Date(dueAt).toISOString() : null,
      reminder: {
        enabled: reminderEnabled,
        remindAt: reminderEnabled && remindAt ? new Date(remindAt).toISOString() : null,
        frequency: reminderEnabled ? frequency : ('none' as ReminderFrequency),
      },
    }

    setSubmitError(null)
    setIsSubmitting(true)
    try {
      if (isEditing && initialTask) {
        await updateTask(initialTask.id, taskInput)
        navigate(`/tasks/${initialTask.id}`)
      } else {
        const created = await addTask(taskInput)
        navigate(`/tasks/${created.id}`)
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong.')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm font-medium text-stone-700">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value)
            if (titleError) setTitleError(null)
          }}
          placeholder="e.g. Pick up dry cleaning"
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
        />
        {titleError && <p className="text-sm text-rose-600">{titleError}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-medium text-stone-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          placeholder="Add any details the assignee should know"
          className="resize-none rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="assignee" className="text-sm font-medium text-stone-700">
            Assign to
          </label>
          <select
            id="assignee"
            value={assigneeId}
            onChange={(event) => setAssigneeId(event.target.value)}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
          >
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="category" className="text-sm font-medium text-stone-700">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(event) => setCategory(event.target.value as TaskCategory)}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
          >
            {Object.entries(categoryMeta).map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="priority" className="text-sm font-medium text-stone-700">
            Priority
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value as TaskPriority)}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
          >
            {Object.entries(priorityMeta).map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="status" className="text-sm font-medium text-stone-700">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(event) => setStatus(event.target.value as TaskStatus)}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
          >
            {Object.entries(statusMeta).map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="dueAt" className="text-sm font-medium text-stone-700">
            Due date & time
          </label>
          <input
            id="dueAt"
            type="datetime-local"
            value={dueAt}
            onChange={(event) => setDueAt(event.target.value)}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
          />
        </div>
      </div>

      <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-4">
        <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
          <input
            type="checkbox"
            checked={reminderEnabled}
            onChange={(event) => setReminderEnabled(event.target.checked)}
            className="h-4 w-4 rounded border-stone-300 text-amber-500 focus:ring-amber-400"
          />
          Set a reminder
        </label>

        {reminderEnabled && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="remindAt" className="text-sm font-medium text-stone-700">
                Remind at
              </label>
              <input
                id="remindAt"
                type="datetime-local"
                value={remindAt}
                onChange={(event) => setRemindAt(event.target.value)}
                className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="frequency" className="text-sm font-medium text-stone-700">
                Repeat
              </label>
              <select
                id="frequency"
                value={frequency}
                onChange={(event) => setFrequency(event.target.value as ReminderFrequency)}
                className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {submitError && <p className="text-sm text-rose-600">{submitError}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Saving…' : isEditing ? 'Save changes' : 'Create task'}
        </button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-lg px-4 py-2 text-sm font-medium text-stone-500 transition hover:bg-stone-100"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
