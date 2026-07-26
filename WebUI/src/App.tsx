import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { ActiveMemberProvider } from './context/ActiveMemberContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { TaskStoreProvider } from './context/TaskStoreContext'
import { ToastProvider } from './context/ToastContext'
import { AuthCallbackPage } from './pages/AuthCallbackPage'
import { LandingPage } from './pages/LandingPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { DashboardPage } from './pages/DashboardPage'
import { NewTaskPage } from './pages/NewTaskPage'
import { TaskDetailPage } from './pages/TaskDetailPage'
import { EditTaskPage } from './pages/EditTaskPage'
import { FamilyPage } from './pages/FamilyPage'
import { NewFamilyMemberPage } from './pages/NewFamilyMemberPage'
import { EditFamilyMemberPage } from './pages/EditFamilyMemberPage'

function AuthGate() {
  const { status } = useAuth()

  if (status === 'checking') {
    return (
      <div className="flex min-h-svh items-center justify-center bg-stone-50 text-sm text-stone-500">
        Loading…
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return <LandingPage />
  }

  if (status === 'pending') {
    return <OnboardingPage />
  }

  return (
    <ActiveMemberProvider>
      <TaskStoreProvider>
        <ToastProvider>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<DashboardPage />} />
              <Route path="tasks/new" element={<NewTaskPage />} />
              <Route path="tasks/:taskId" element={<TaskDetailPage />} />
              <Route path="tasks/:taskId/edit" element={<EditTaskPage />} />
              <Route path="family" element={<FamilyPage />} />
              <Route path="family/new" element={<NewFamilyMemberPage />} />
              <Route path="family/:memberId/edit" element={<EditFamilyMemberPage />} />
            </Route>
          </Routes>
        </ToastProvider>
      </TaskStoreProvider>
    </ActiveMemberProvider>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="auth/callback" element={<AuthCallbackPage />} />
        <Route
          path="*"
          element={
            <AuthProvider>
              <AuthGate />
            </AuthProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
