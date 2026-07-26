import { TaskForm } from '../components/TaskForm'

export function NewTaskPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-stone-900">New task</h1>
        <p className="text-sm text-stone-500">Add something for the household to take care of.</p>
      </div>
      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <TaskForm />
      </div>
    </div>
  )
}
