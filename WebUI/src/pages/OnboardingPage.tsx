import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { completeOnboarding as completeOnboardingRequest } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export function OnboardingPage() {
  const { pendingToken, completeOnboarding } = useAuth()
  const [name, setName] = useState('')
  const [familyName, setFamilyName] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)
  const [familyNameError, setFamilyNameError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!pendingToken) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    let hasError = false
    if (!name.trim()) {
      setNameError('Enter your name.')
      hasError = true
    }
    if (!familyName.trim()) {
      setFamilyNameError('Give your household a name.')
      hasError = true
    }
    if (hasError) return

    setSubmitError(null)
    setIsSubmitting(true)
    try {
      const result = await completeOnboardingRequest({
        pendingToken: pendingToken!,
        name: name.trim(),
        familyName: familyName.trim(),
      })
      completeOnboarding(result.member, result.sessionToken)
      // Hard navigation (not client-side routing) so the app remounts cleanly
      // at "/" with the freshly authenticated session, matching AuthCallbackPage.
      window.location.replace('/')
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-lg font-bold text-white">
          H
        </span>
        <h1 className="mt-4 text-center text-xl font-semibold text-stone-900">
          Welcome to Hearth
        </h1>
        <p className="mt-1 text-center text-sm text-stone-500">
          Let's set up your household.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium text-stone-700">
              Your name
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
              placeholder="e.g. Meera"
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
            />
            {nameError && <p className="text-sm text-rose-600">{nameError}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="familyName" className="text-sm font-medium text-stone-700">
              Family name
            </label>
            <input
              id="familyName"
              type="text"
              value={familyName}
              onChange={(event) => {
                setFamilyName(event.target.value)
                if (familyNameError) setFamilyNameError(null)
              }}
              placeholder="e.g. The Sharma Family"
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
            />
            {familyNameError && <p className="text-sm text-rose-600">{familyNameError}</p>}
          </div>

          {submitError && <p className="text-sm text-rose-600">{submitError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Setting up…' : 'Create household'}
          </button>
        </form>
      </div>
    </div>
  )
}
