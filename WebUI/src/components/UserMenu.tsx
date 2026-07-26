import { useEffect, useRef, useState } from 'react'
import { useAuth, useRequireAdmin } from '../context/AuthContext'
import { MemberAvatar } from './MemberAvatar'

export function UserMenu() {
  const admin = useRequireAdmin()
  const { logout } = useAuth()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full border border-stone-200 bg-white py-1 pl-1 pr-3 text-sm font-medium text-stone-700 shadow-sm transition hover:border-stone-300"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MemberAvatar member={admin} size="sm" />
        <span>{admin.name}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg"
        >
          <div className="border-b border-stone-100 px-3 py-2">
            <p className="text-sm font-medium text-stone-800">{admin.name}</p>
            <p className="text-xs text-stone-400">Admin</p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={logout}
            className="w-full px-3 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
