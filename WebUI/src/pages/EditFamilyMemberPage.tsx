import { Navigate, useParams } from 'react-router-dom'
import { useActiveMember } from '../context/ActiveMemberContext'
import { MemberForm } from '../components/MemberForm'

export function EditFamilyMemberPage() {
  const { memberId } = useParams<{ memberId: string }>()
  const { activeMember, members } = useActiveMember()

  if (activeMember.role !== 'admin') {
    return <Navigate to="/family" replace />
  }

  const member = members.find((candidate) => candidate.id === memberId)
  if (!member) {
    return <Navigate to="/family" replace />
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-stone-900">Edit family member</h1>
        <p className="text-sm text-stone-500">Update {member.name}'s details.</p>
      </div>
      <MemberForm initialMember={member} />
    </div>
  )
}
