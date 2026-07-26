import { Navigate } from 'react-router-dom'
import { useActiveMember } from '../context/ActiveMemberContext'
import { MemberForm } from '../components/MemberForm'

export function NewFamilyMemberPage() {
  const { activeMember } = useActiveMember()

  if (activeMember.role !== 'admin') {
    return <Navigate to="/family" replace />
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-stone-900">Add family member</h1>
        <p className="text-sm text-stone-500">
          Add someone to your household. You can generate their invite code next.
        </p>
      </div>
      <MemberForm />
    </div>
  )
}
