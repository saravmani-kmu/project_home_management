import { apiDelete, apiGet, apiPost, apiPut } from './client'
import { mapTask } from './mappers'
import type { ApiTask, ApiTaskInput } from './types'
import type { Task } from '../types'

export async function fetchTasks(): Promise<Task[]> {
  const tasks = await apiGet<ApiTask[]>('/tasks')
  return tasks.map(mapTask)
}

export async function createTaskAs(createdById: string, input: ApiTaskInput): Promise<Task> {
  const task = await apiPost<ApiTask>('/tasks', { ...input, created_by_id: createdById })
  return mapTask(task)
}

export async function updateTask(id: string, input: ApiTaskInput): Promise<Task> {
  const task = await apiPut<ApiTask>(`/tasks/${id}`, input)
  return mapTask(task)
}

export function deleteTask(id: string): Promise<void> {
  return apiDelete(`/tasks/${id}`)
}

export interface SendReminderResult {
  taskId: string
  assigneeId: string
  assigneeName: string | null
  sent: boolean
}

export async function sendReminder(taskId: string): Promise<SendReminderResult> {
  const result = await apiPost<{
    task_id: string
    assignee_id: string
    assignee_name: string | null
    sent: boolean
  }>(`/tasks/${taskId}/send-reminder`)
  return {
    taskId: result.task_id,
    assigneeId: result.assignee_id,
    assigneeName: result.assignee_name,
    sent: result.sent,
  }
}
