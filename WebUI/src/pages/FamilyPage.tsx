import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useActiveMember } from '../context/ActiveMemberContext'
import { useTaskStore } from '../context/TaskStoreContext'
import { MemberAvatar } from '../components/MemberAvatar'
import { InviteModal } from '../components/InviteModal'
import { formatRelationship } from '../utils/relationshipMeta'
import type { FamilyMember } from '../types'

export function FamilyPage() {
  const { members, activeMember, invites, memberIdsWithInvite, loadInvite, generateInvite } =
    useActiveMember()
  const { tasks } = useTaskStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const inviteMemberId = searchParams.get('invite')

  const isAdmin = activeMember.role === 'admin'

  const openTaskCountByMember = useMemo(() => {
    const counts = new Map<string, number>()
    for (const task of tasks) {
      if (task.status === 'done') continue
      counts.set(task.assigneeId, (counts.get(task.assigneeId) ?? 0) + 1)
    }
    return counts
  }, [tasks])

  async function openInvite(member: FamilyMember) {
    if (!invites[member.id]) {
      if (memberIdsWithInvite.has(member.id)) {
        await loadInvite(member.id)
      } else {
        await generateInvite(member.id)
      }
    }
    setSearchParams({ invite: member.id }, { replace: true })
  }

  function closeInvite() {
    searchParams.delete('invite')
    setSearchParams(searchParams, { replace: true })
  }

  const inviteMember = members.find((member) => member.id === inviteMemberId)
  const invite = inviteMemberId ? invites[inviteMemberId] : undefined

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Family members</h1>
          <p className="text-sm text-stone-500">
            Everyone in your household.
            {!isAdmin && ' Only the admin can add members or generate invite codes.'}
          </p>
        </div>
        {isAdmin && (
          <Link
            to="/family/new"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10 4a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4V5a1 1 0 011-1z" />
            </svg>
            Add family member
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <div
            key={member.id}
            className={`flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm ${
              member.id === activeMember.id ? 'border-amber-300 ring-1 ring-amber-100' : 'border-stone-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <MemberAvatar member={member} size="lg" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-stone-900">{member.name}</p>
                <p className="text-xs text-stone-400">
                  <span className="uppercase tracking-wide">
                    {member.role === 'admin' ? 'Admin' : 'Family member'}
                  </span>
                  <span className="mx-1">·</span>
                  {formatRelationship(member)}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {openTaskCountByMember.get(member.id) ?? 0} open task
                  {(openTaskCountByMember.get(member.id) ?? 0) === 1 ? '' : 's'}
                </p>
              </div>
              {member.id === activeMember.id && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-800">
                  You
                </span>
              )}
            </div>

            {isAdmin && (
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to={`/family/${member.id}/edit`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-600 transition hover:border-stone-300 hover:bg-stone-50"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit
                </Link>
                {member.role !== 'admin' && (
                  <button
                    type="button"
                    onClick={() => openInvite(member)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-600 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-800"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 1v2h2V5H5zm6-2a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V4a1 1 0 00-1-1h-4zm1 2v2h2V5h-2zM3 12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zm2 1v2h2v-2H5zm7-2a1 1 0 00-1 1v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1v-1a1 1 0 00-1-1zm3 5a1 1 0 100 2h.01a1 1 0 100-2H15z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {memberIdsWithInvite.has(member.id) ? 'View invite' : 'Generate invite'}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {inviteMember && invite && (
        <InviteModal
          member={inviteMember}
          invite={invite}
          onClose={closeInvite}
          onRegenerate={() => generateInvite(inviteMember.id)}
        />
      )}
    </div>
  )
}
