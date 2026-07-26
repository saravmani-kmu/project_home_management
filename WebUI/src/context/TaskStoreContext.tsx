import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as tasksApi from '../api/tasks'
import type { Task } from '../types'

type NewTaskInput = Omit<Task, 'id' | 'createdAt'>

interface TaskStoreContextValue {
  tasks: Task[]
  status: 'loading' | 'ready' | 'error'
  error: string | null
  getTaskById: (id: string) => Task | undefined
  addTask: (input: NewTaskInput) => Promise<Task>
  updateTask: (id: string, input: NewTaskInput) => Promise<void>
  removeTask: (id: string) => Promise<void>
}

const TaskStoreContext = createContext<TaskStoreContextValue | null>(null)

function toApiInput(input: NewTaskInput) {
  return {
    title: input.title,
    description: input.description,
    assignee_id: input.assigneeId,
    priority: input.priority,
    status: input.status,
    category: input.category,
    due_at: input.dueAt,
    reminder: {
      enabled: input.reminder.enabled,
      remind_at: input.reminder.remindAt,
      frequency: input.reminder.frequency,
    },
  }
}

export function TaskStoreProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    tasksApi
      .fetchTasks()
      .then((fetched) => {
        if (cancelled) return
        setTasks(fetched)
        setStatus('ready')
      })
      .catch((err: Error) => {
        if (cancelled) return
        setError(err.message)
        setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const addTask = useCallback(async (input: NewTaskInput) => {
    const created = await tasksApi.createTaskAs(input.createdById, toApiInput(input))
    setTasks((prev) => [created, ...prev])
    return created
  }, [])

  const updateTask = useCallback(async (id: string, input: NewTaskInput) => {
    const updated = await tasksApi.updateTask(id, toApiInput(input))
    setTasks((prev) => prev.map((task) => (task.id === id ? updated : task)))
  }, [])

  const removeTask = useCallback(async (id: string) => {
    await tasksApi.deleteTask(id)
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }, [])

  const getTaskById = useCallback(
    (id: string) => tasks.find((task) => task.id === id),
    [tasks],
  )

  const value = useMemo(
    () => ({ tasks, status, error, getTaskById, addTask, updateTask, removeTask }),
    [tasks, status, error, getTaskById, addTask, updateTask, removeTask],
  )

  return <TaskStoreContext.Provider value={value}>{children}</TaskStoreContext.Provider>
}

export function useTaskStore() {
  const context = useContext(TaskStoreContext)
  if (!context) {
    throw new Error('useTaskStore must be used within a TaskStoreProvider')
  }
  return context
}
