import { Navigate, useParams } from 'react-router-dom'
import { TaskForm } from '../components/TaskForm'
import { useTaskStore } from '../context/TaskStoreContext'

export function EditTaskPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const { getTaskById } = useTaskStore()
  const task = taskId ? getTaskById(taskId) : undefined

  if (!task) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-stone-900">Edit task</h1>
        <p className="text-sm text-stone-500">Update the details for “{task.title}”.</p>
      </div>
      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <TaskForm initialTask={task} />
      </div>
    </div>
  )
}
