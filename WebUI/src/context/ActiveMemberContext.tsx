import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as membersApi from '../api/members'
import { useRequireAdmin } from './AuthContext'
import type { FamilyMember, MemberInvite, RelationshipType } from '../types'

export interface MemberInput {
  name: string
  relationship: RelationshipType
  relationshipOther?: string
  role: 'admin' | 'member'
}

interface ActiveMemberContextValue {
  activeMember: FamilyMember
  members: FamilyMember[]
  addMember: (input: MemberInput) => Promise<FamilyMember>
  updateMember: (id: string, input: MemberInput) => Promise<void>
  invites: Record<string, MemberInvite>
  memberIdsWithInvite: Set<string>
  loadInvite: (memberId: string) => Promise<MemberInvite | null>
  generateInvite: (memberId: string) => Promise<MemberInvite>
}

const ActiveMemberContext = createContext<ActiveMemberContextValue | null>(null)

function toApiInput(input: MemberInput) {
  return {
    name: input.name,
    role: input.role,
    relationship: input.relationship,
    relationship_other: input.relationship === 'other' ? input.relationshipOther : undefined,
  }
}

interface ActiveMemberProviderProps {
  children: ReactNode
}

export function ActiveMemberProvider({ children }: ActiveMemberProviderProps) {
  const admin = useRequireAdmin()
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [invites, setInvites] = useState<Record<string, MemberInvite>>({})
  const [memberIdsWithInvite, setMemberIdsWithInvite] = useState<Set<string>>(new Set())
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    membersApi
      .fetchMembers()
      .then(({ members: fetched, memberIdsWithInvite: withInvite }) => {
        if (cancelled) return
        setMembers(fetched)
        setMemberIdsWithInvite(new Set(withInvite))
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

  const loadInvite = useCallback(async (memberId: string) => {
    const invite = await membersApi.fetchInvite(memberId)
    if (invite) {
      setInvites((prev) => ({ ...prev, [memberId]: invite }))
    }
    return invite
  }, [])

  const addMember = useCallback(async (input: MemberInput) => {
    const member = await membersApi.createMember(toApiInput(input))
    setMembers((prev) => [...prev, member])
    return member
  }, [])

  const updateMember = useCallback(async (id: string, input: MemberInput) => {
    const updated = await membersApi.updateMember(id, toApiInput(input))
    setMembers((prev) => prev.map((member) => (member.id === id ? updated : member)))
  }, [])

  const generateInvite = useCallback(async (memberId: string) => {
    const invite = await membersApi.generateInvite(memberId)
    setInvites((prev) => ({ ...prev, [memberId]: invite }))
    setMemberIdsWithInvite((prev) => new Set(prev).add(memberId))
    return invite
  }, [])

  const value = useMemo<ActiveMemberContextValue>(
    () => ({
      activeMember: admin,
      members,
      addMember,
      updateMember,
      invites,
      memberIdsWithInvite,
      loadInvite,
      generateInvite,
    }),
    [admin, members, addMember, updateMember, invites, memberIdsWithInvite, loadInvite, generateInvite],
  )

  if (status === 'loading') {
    return (
      <div className="flex min-h-svh items-center justify-center bg-stone-50 text-sm text-stone-500">
        Loading household…
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-svh items-center justify-center bg-stone-50 px-4 text-center text-sm text-rose-600">
        Could not load family members from the server.
        {error ? ` (${error})` : ''}
      </div>
    )
  }

  return <ActiveMemberContext.Provider value={value}>{children}</ActiveMemberContext.Provider>
}

export function useActiveMember() {
  const context = useContext(ActiveMemberContext)
  if (!context) {
    throw new Error('useActiveMember must be used within an ActiveMemberProvider')
  }
  return context
}
