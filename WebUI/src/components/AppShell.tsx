import { NavLink, Outlet } from 'react-router-dom'
import { UserMenu } from './UserMenu'

const navItems = [
  { to: '/', label: 'Tasks', end: true },
  { to: '/family', label: 'Family' },
]

export function AppShell() {
  return (
    <div className="min-h-svh bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-sm font-bold text-white">
              H
            </span>
            <span className="text-base font-semibold text-stone-900">Hearth</span>
          </div>

          <nav className="hidden items-center gap-1 sm:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-amber-50 text-amber-800'
                      : 'text-stone-500 hover:bg-stone-100 hover:text-stone-700'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <UserMenu />
        </div>

        <nav className="flex items-center gap-1 border-t border-stone-100 px-4 py-2 sm:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  isActive ? 'bg-amber-50 text-amber-800' : 'text-stone-500 hover:bg-stone-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}
