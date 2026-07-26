import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useActiveMember, type MemberInput } from '../context/ActiveMemberContext'
import { relationshipLabel } from '../utils/relationshipMeta'
import type { FamilyMember, RelationshipType } from '../types'

interface MemberFormProps {
  initialMember?: FamilyMember
}

const relationshipOptions = Object.entries(relationshipLabel) as [RelationshipType, string][]

export function MemberForm({ initialMember }: MemberFormProps) {
  const navigate = useNavigate()
  const { addMember, updateMember } = useActiveMember()
  const isEditing = Boolean(initialMember)

  const [name, setName] = useState(initialMember?.name ?? '')
  const [relationship, setRelationship] = useState<RelationshipType>(
    initialMember?.relationship ?? 'son',
  )
  const [relationshipOther, setRelationshipOther] = useState(
    initialMember?.relationshipOther ?? '',
  )
  const [role, setRole] = useState<'admin' | 'member'>(initialMember?.role ?? 'member')
  const [nameError, setNameError] = useState<string | null>(null)
  const [relationshipOtherError, setRelationshipOtherError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    let hasError = false
    if (!name.trim()) {
      setNameError('Enter a name for the family member.')
      hasError = true
    }
    if (relationship === 'other' && !relationshipOther.trim()) {
      setRelationshipOtherError('Describe the relationship.')
      hasError = true
    }
    if (hasError) return

    const input: MemberInput = {
      name: name.trim(),
      relationship,
      relationshipOther: relationship === 'other' ? relationshipOther : undefined,
      role,
    }

    setSubmitError(null)
    setIsSubmitting(true)
    try {
      if (isEditing && initialMember) {
        await updateMember(initialMember.id, input)
      } else {
        await addMember(input)
      }
      navigate('/family')
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong.')
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-stone-200 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-stone-700">
          Name
        </label>
        <input
          id="name"
          type="text"
          autoFocus
          value={name}
          onChange={(event) => {
            setName(event.target.value)
            if (nameError) setNameError(null)
          }}
          placeholder="e.g. Kavya"
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
        />
        {nameError && <p className="text-sm text-rose-600">{nameError}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="relationship" className="text-sm font-medium text-stone-700">
          Relationship
        </label>
        <select
          id="relationship"
          value={relationship}
          onChange={(event) => {
            setRelationship(event.target.value as RelationshipType)
            if (relationshipOtherError) setRelationshipOtherError(null)
          }}
          className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
        >
          {relationshipOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {relationship === 'other' && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="relationshipOther" className="text-sm font-medium text-stone-700">
            Describe relationship
          </label>
          <input
            id="relationshipOther"
            type="text"
            value={relationshipOther}
            onChange={(event) => {
              setRelationshipOther(event.target.value)
              if (relationshipOtherError) setRelationshipOtherError(null)
            }}
            placeholder="e.g. Uncle, Cousin"
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
          />
          {relationshipOtherError && (
            <p className="text-sm text-rose-600">{relationshipOtherError}</p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="role" className="text-sm font-medium text-stone-700">
          Role
        </label>
        <select
          id="role"
          value={role}
          onChange={(event) => setRole(event.target.value as 'admin' | 'member')}
          className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
        >
          <option value="member">Family member</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {submitError && <p className="text-sm text-rose-600">{submitError}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Saving…' : isEditing ? 'Save changes' : 'Add member'}
        </button>
        <button
          type="button"
          onClick={() => navigate('/family')}
          className="rounded-lg px-4 py-2 text-sm font-medium text-stone-500 transition hover:bg-stone-100"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
