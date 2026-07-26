import { apiGet } from './client'
import { mapTask } from './mappers'
import type { ApiTask } from './types'
import type { Task } from '../types'

export async function fetchTasks(): Promise<Task[]> {
  const tasks = await apiGet<ApiTask[]>('/tasks')
  return tasks.map(mapTask)
}
