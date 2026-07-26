import { useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import type { FamilyMember, MemberInvite } from '../types'
import { MemberAvatar } from './MemberAvatar'
import { useToast } from '../context/ToastContext'

interface InviteModalProps {
  member: FamilyMember
  invite: MemberInvite
  onClose: () => void
  onRegenerate: () => void
}

export function InviteModal({ member, invite, onClose, onRegenerate }: InviteModalProps) {
  const { showToast } = useToast()

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(invite.token)
      showToast('Invite code copied')
    } catch {
      showToast('Could not copy — copy it manually')
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-stone-900/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-modal-title"
      >
        <div className="flex items-center gap-3">
          <MemberAvatar member={member} size="md" />
          <div>
            <h2 id="invite-modal-title" className="text-base font-semibold text-stone-900">
              Invite {member.name}
            </h2>
            <p className="text-xs text-stone-500">Scan the code or enter it to log in</p>
          </div>
        </div>

        <div className="mt-5 flex justify-center rounded-xl border border-stone-100 bg-stone-50 p-6">
          <QRCodeSVG value={invite.token} size={176} bgColor="transparent" fgColor="#292524" />
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 rounded-lg border border-dashed border-stone-300 bg-stone-50 px-3 py-2">
          <span className="font-mono text-sm font-semibold tracking-widest text-stone-800">
            {invite.token}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-amber-700 transition hover:bg-amber-50"
          >
            Copy
          </button>
        </div>

        <div className="mt-5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onRegenerate}
            className="text-sm font-medium text-stone-500 transition hover:text-stone-700"
          >
            Regenerate code
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
