import { FolderKanban, Landmark, LayoutDashboard, ListTodo, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../shared/auth/AuthContext'
import { cn } from '../shared/lib/cn'

const groups = [
  {
    title: 'Overview',
    items: [{ to: '/', label: 'Overview', Icon: LayoutDashboard }],
  },
  {
    title: 'Tasks',
    items: [{ to: '/tasks', label: 'Tasks', Icon: ListTodo }],
  },
  {
    title: 'Finance',
    items: [
      { to: '/finance/dashboard', label: 'Dashboard', Icon: Landmark },
      { to: '/finance/transactions', label: 'Transactions', Icon: ListTodo },
      { to: '/finance/accounts', label: 'Accounts', Icon: FolderKanban },
    ],
  },
  {
    title: 'People',
    items: [{ to: '/hr', label: 'HR (Coming soon)', Icon: UserRound }],
  },
]

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth()
  return (
    <>
      {open && (
        <button aria-label="Close sidebar" onClick={onClose} className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden" />
      )}
      <aside
        className={cn(
          'fixed lg:sticky top-0 z-40 h-screen w-[272px] bg-card border-r border-border flex flex-col shrink-0 transition-transform duration-200',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="h-16 flex items-center px-4 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center text-[13px] font-semibold">P</div>
          <div className="ml-2.5 min-w-0">
            <p className="text-[13px] font-semibold text-foreground truncate">Personal Resource Planning</p>
            <p className="text-[11px] text-muted-foreground">Calm Operator</p>
          </div>
        </div>
        <nav className="flex-1 overflow-auto p-3 space-y-5">
          {groups.map((g) => (
            <div key={g.title}>
              <p className="px-3 mb-2 text-[11px] font-medium tracking-wide text-muted-foreground">{g.title}</p>
              <div className="space-y-1">
                {g.items.map(({ to, label, Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] leading-none transition-all',
                        isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                      )
                    }
                  >
                    <Icon size={16} strokeWidth={1.8} />
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-3">
          <div className="rounded-xl bg-muted border border-border p-3 flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-[12px] font-medium shrink-0">
              {(user?.profile?.preferred_username ?? 'U').slice(0, 1).toUpperCase()}
            </div>
            <p className="text-[12px] text-foreground truncate min-w-0">{user?.profile?.preferred_username ?? 'Signed in'}</p>
          </div>
        </div>
      </aside>
    </>
  )
}
