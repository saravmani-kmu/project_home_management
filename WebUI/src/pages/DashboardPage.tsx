import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTaskStore } from '../context/TaskStoreContext'
import { useActiveMember } from '../context/ActiveMemberContext'
import { TaskCard } from '../components/TaskCard'
import { MemberAvatar } from '../components/MemberAvatar'
import type { TaskStatus } from '../types'
import { statusMeta, statusOrder } from '../utils/taskMeta'

type AssigneeFilter = 'all' | 'mine' | string

const statusFilters: Array<{ value: TaskStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  ...statusOrder.map((status) => ({ value: status, label: statusMeta[status].label })),
]

export function DashboardPage() {
  const { tasks } = useTaskStore()
  const { activeMember, members } = useActiveMember()
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [assigneeFilter, setAssigneeFilter] = useState<AssigneeFilter>('all')

  const membersById = useMemo(() => {
    const map = new Map(members.map((member) => [member.id, member]))
    return map
  }, [members])

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (statusFilter !== 'all' && task.status !== statusFilter) return false
      if (assigneeFilter === 'mine' && task.assigneeId !== activeMember.id) return false
      if (
        assigneeFilter !== 'all' &&
        assigneeFilter !== 'mine' &&
        task.assigneeId !== assigneeFilter
      ) {
        return false
      }
      return true
    })
  }, [tasks, statusFilter, assigneeFilter, activeMember.id])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Household tasks</h1>
          <p className="text-sm text-stone-500">
            Viewing as <span className="font-medium text-stone-700">{activeMember.name}</span>
          </p>
        </div>
        <Link
          to="/tasks/new"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10 4a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4V5a1 1 0 011-1z" />
          </svg>
          New task
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-1.5">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                statusFilter === filter.value
                  ? 'bg-stone-900 text-white'
                  : 'bg-white text-stone-500 ring-1 ring-inset ring-stone-200 hover:bg-stone-100'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setAssigneeFilter('all')}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              assigneeFilter === 'all'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-white text-stone-500 ring-1 ring-inset ring-stone-200 hover:bg-stone-100'
            }`}
          >
            Everyone
          </button>
          <button
            type="button"
            onClick={() => setAssigneeFilter('mine')}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              assigneeFilter === 'mine'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-white text-stone-500 ring-1 ring-inset ring-stone-200 hover:bg-stone-100'
            }`}
          >
            My tasks
          </button>
          {members.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => setAssigneeFilter(member.id)}
              className={`flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3 text-sm font-medium transition ${
                assigneeFilter === member.id
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-white text-stone-500 ring-1 ring-inset ring-stone-200 hover:bg-stone-100'
              }`}
            >
              <MemberAvatar member={member} size="sm" />
              {member.name}
            </button>
          ))}
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center">
          <p className="text-sm font-medium text-stone-600">No tasks match these filters</p>
          <p className="mt-1 text-sm text-stone-400">
            Try a different filter, or create a new task for the household.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} assignee={membersById.get(task.assigneeId)} />
          ))}
        </div>
      )}
    </div>
  )
}
