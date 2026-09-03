# PRP Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild frontend/ from the Vite template into the Calm Operator personal-ERP console covering task/project and finance domains with an hr placeholder.

**Architecture:** Domain-sliced monolith: app/ (shell, router, auth) + shared/ (tokens, recipes, apiClient) + domains/task + domains/finance + domains/hr (stub). Each domain owns its api/types/pages/components; new domains copy task.

**Tech Stack:** React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + react-router-dom + axios + oidc-client-ts + lucide-react + clsx + tailwind-merge.

**Spec:** `docs/superpowers/specs/2026-09-03-prp-frontend-design.md`

## Global Constraints

- UI in Chinese; no marketing pages.
- Tailwind is the only visual implementation; no shadcn/MUI/AntD/DaisyUI.
- Pages use only semantic tokens (background, foreground, card, muted, border, primary, success, warning, danger); no hex colors in .tsx.
- Sidebar 272px, header 56px, content max-w 1280px.
- OIDC defaults: authority `https://auth.arorms.cn/realms/arorms`, client_id `prp-react`, redirect `<origin>/callback`, scope `openid profile email`.
- API base `/api` via Vite proxy to `http://localhost:8085`; backend audience `prp-backend` is server-side.
- Backend pagination is Spring `Page` (0-based); error bodies are plain text.
- No git commits by workers; leave the working tree for the user to organize.

---

### Task 1: Scaffold (deps, Tailwind v4, proxy, env, template cleanup)

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/vite.config.ts`
- Create: `frontend/src/styles/index.css`
- Modify: `frontend/src/main.tsx`
- Modify: `frontend/index.html`
- Delete: `frontend/src/App.css`
- Create: `frontend/.env.example`

**Interfaces:**
- Consumes: none.
- Produces: `index.css` semantic tokens; dev proxy `/api → http://localhost:8085`; env keys `VITE_OAUTH_AUTHORITY, VITE_OAUTH_CLIENT_ID, VITE_OAUTH_REDIRECT_URI, VITE_API_BASE_URL`.

- [ ] **Step 1: Add dependencies**

```bash
npm install tailwindcss @tailwindcss/vite react-router-dom axios oidc-client-ts lucide-react clsx tailwind-merge
```

- [ ] **Step 2: Run install to verify resolution**

Run: `npm install`
Expected: exit 0, `node_modules/` populated.

- [ ] **Step 3: Rewrite vite.config.ts with Tailwind plugin and API proxy**

```ts
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8085',
        changeOrigin: true,
      },
    },
  },
})
```

- [ ] **Step 4: Create src/styles/index.css with the canonical tokens**

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-danger: var(--danger);
  --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);
  --animate-fade-in: fadeIn 0.35s ease-out;
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }
}

:root {
  --background: #f5f5f7;
  --foreground: #1d1d1f;
  --card: #ffffff;
  --card-foreground: #1d1d1f;
  --primary: #0047ff;
  --primary-foreground: #ffffff;
  --muted: #f5f5f7;
  --muted-foreground: #86868b;
  --border: #e8e8ed;
  --input: #e8e8ed;
  --ring: #0047ff;
  --success: #15803d;
  --warning: #b45309;
  --danger: #dc2626;
  --radius: 12px;
}

.dark {
  --background: #000000;
  --foreground: #f5f5f7;
  --card: #1c1c1e;
  --card-foreground: #f5f5f7;
  --primary: #0047ff;
  --primary-foreground: #ffffff;
  --muted: #141416;
  --muted-foreground: #98989d;
  --border: #2c2c2e;
  --input: #2c2c2e;
  --ring: #0047ff;
  --success: #4ade80;
  --warning: #fbbf24;
  --danger: #f87171;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text",
    "Helvetica Neue", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  background: var(--background);
  color: var(--foreground);
}

:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
```

- [ ] **Step 5: Point main.tsx at the new stylesheet**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 6: Create .env.example**

```bash
VITE_OAUTH_AUTHORITY=https://auth.arorms.cn/realms/arorms
VITE_OAUTH_CLIENT_ID=prp-react
VITE_OAUTH_REDIRECT_URI=http://localhost:5173/callback
VITE_API_BASE_URL=/api
```

- [ ] **Step 7: Update index.html title to 个人资源管理**

Replace `<title>` line content with `个人资源管理`.

- [ ] **Step 8: Delete the template stylesheet**

```bash
rm frontend/src/App.css
```

- [ ] **Step 9: Build to verify the scaffold**

Run: `npm run build`
Expected: `tsc -b` and `vite build` succeed (App.tsx still template; rewritten in Task 3).

---

### Task 2: Shared layer (cn, apiClient, auth, format, ui recipes)

**Files:**
- Create: `frontend/src/shared/lib/cn.ts`
- Create: `frontend/src/shared/lib/apiClient.ts`
- Create: `frontend/src/shared/lib/auth.ts`
- Create: `frontend/src/shared/lib/format.ts`
- Create: `frontend/src/shared/auth/AuthContext.tsx`
- Create: `frontend/src/shared/ui.tsx`
- Create: `frontend/src/shared/hooks/usePage.ts`

**Interfaces:**
- Consumes: Task 1 tokens and env keys.
- Produces: `cn(...inputs: ClassValue[]): string`; `apiClient: AxiosInstance`; `getApiBase(): string`; `getOidcConfig(): UserManagerSettings`; `getUserManager(): UserManager`; `AuthContext {user: User|null, token: string|null, ready: boolean, login(): Promise<void>, logout(): Promise<void>, handleCallback(): Promise<void>}`; `fmtMoney(v: string|number|null, currency?: string): string`; `fmtDate(d: string|null): string`; `fmtDateTime(d: string|null): string`; UI exports `Card, Button, Input, Field, Modal, Badge, Empty, Spinner`; `usePage(initialSize?: number): {page, size, setPage}`.

- [ ] **Step 1: Create cn.ts**

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(...inputs))
}
```

- [ ] **Step 2: Create apiClient.ts**

```ts
import axios from 'axios'

export function getApiBase(): string {
  return import.meta.env.VITE_API_BASE_URL ?? '/api'
}

export const apiClient = axios.create({
  baseURL: getApiBase(),
})

export function setAuthToken(token: string | null): void {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete apiClient.defaults.headers.common.Authorization
  }
}

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('prp:unauthorized'))
    }
    return Promise.reject(err)
  },
)

export function toMessage(err: unknown): string {
  const data = (err as { response?: { data?: unknown } })?.response?.data
  if (typeof data === 'string' && data.length > 0) return data
  if (err instanceof Error) return err.message
  return '请求失败'
}
```

- [ ] **Step 3: Create auth.ts**

```ts
import { UserManager, type UserManagerSettings } from 'oidc-client-ts'

export function getOidcConfig(): UserManagerSettings {
  const redirectUri =
    import.meta.env.VITE_OAUTH_REDIRECT_URI ?? `${window.location.origin}/callback`
  return {
    authority: import.meta.env.VITE_OAUTH_AUTHORITY ?? 'https://auth.arorms.cn/realms/arorms',
    client_id: import.meta.env.VITE_OAUTH_CLIENT_ID ?? 'prp-react',
    redirect_uri: redirectUri,
    post_logout_redirect_uri: window.location.origin,
    response_type: 'code',
    scope: 'openid profile email',
  }
}

let manager: UserManager | null = null

export function getUserManager(): UserManager {
  if (!manager) manager = new UserManager(getOidcConfig())
  return manager
}
```

- [ ] **Step 4: Create format.ts**

```ts
export function fmtMoney(v: string | number | null | undefined, currency = ''): string {
  if (v === null || v === undefined || v === '') return '-'
  const n = typeof v === 'string' ? Number(v) : v
  if (Number.isNaN(n)) return String(v)
  const body = n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return currency ? `${body} ${currency}` : body
}

export function fmtDate(d: string | null | undefined): string {
  if (!d) return '-'
  return d.slice(0, 10)
}

export function fmtDateTime(d: string | null | undefined): string {
  if (!d) return '-'
  return d.replace('T', ' ').slice(0, 19)
}
```

- [ ] **Step 5: Create AuthContext.tsx**

```tsx
import { User } from 'oidc-client-ts'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { setAuthToken } from '../lib/apiClient'
import { getUserManager } from '../lib/auth'

interface AuthValue {
  user: User | null
  token: string | null
  ready: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
  handleCallback: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    getUserManager()
      .getUser()
      .then((u) => {
        setUser(u)
        setAuthToken(u?.access_token ?? null)
      })
      .finally(() => setReady(true))
    const on401 = () => {
      setUser(null)
      setAuthToken(null)
      getUserManager().removeUser().catch(() => undefined)
      if (window.location.pathname !== '/login') window.location.assign('/login')
    }
    window.addEventListener('prp:unauthorized', on401)
    return () => window.removeEventListener('prp:unauthorized', on401)
  }, [])

  const login = useCallback(async () => {
    await getUserManager().signinRedirect()
  }, [])

  const logout = useCallback(async () => {
    await getUserManager().signoutRedirect().catch(() => undefined)
    setUser(null)
    setAuthToken(null)
  }, [])

  const handleCallback = useCallback(async () => {
    const u = await getUserManager().signinRedirectCallback()
    setUser(u)
    setAuthToken(u?.access_token ?? null)
  }, [])

  const value = useMemo<AuthValue>(
    () => ({ user, token: user?.access_token ?? null, ready, login, logout, handleCallback }),
    [user, ready, login, logout, handleCallback],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const v = useContext(AuthContext)
  if (!v) throw new Error('useAuth must be used inside AuthProvider')
  return v
}
```

- [ ] **Step 6: Create ui.tsx with the six canonical recipes**

```tsx
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from './lib/cn'

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'bg-card text-card-foreground rounded-[var(--radius)] border border-border',
        'shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] dark:shadow-none',
        className,
      )}
    >
      {children}
    </div>
  )
}

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'destructive'

export function Button({
  variant = 'secondary',
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 text-[13px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
        variant === 'primary' && 'px-4 py-2.5 rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
        variant === 'secondary' && 'px-4 py-2.5 rounded-xl bg-card border border-border text-foreground hover:bg-muted',
        variant === 'danger' && 'px-4 py-2.5 rounded-full bg-danger text-white hover:bg-danger/90',
        variant === 'ghost' && 'p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground',
        variant === 'destructive' && 'p-2 rounded-lg text-muted-foreground hover:bg-danger/10 hover:text-danger',
        className,
      )}
      {...rest}
    />
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-medium text-muted-foreground mb-2">{label}</span>
      {children}
    </label>
  )
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-xl bg-muted border border-transparent px-3 py-2.5 text-[13px] text-foreground',
        'placeholder:text-muted-foreground focus:outline-none focus:bg-card focus:border-border',
        className,
      )}
      {...rest}
    />
  )
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
          <button aria-label="关闭" onClick={onClose} className="p-1.5 rounded-full text-muted-foreground hover:bg-muted">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Badge({ tone = 'neutral', children }: { tone?: 'neutral' | 'success' | 'warning' | 'danger'; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium',
        tone === 'neutral' && 'bg-muted text-muted-foreground',
        tone === 'success' && 'border border-success/25 bg-success/10 text-success',
        tone === 'warning' && 'border border-warning/25 bg-warning/10 text-warning',
        tone === 'danger' && 'border border-danger/25 bg-danger/10 text-danger',
      )}
    >
      {children}
    </span>
  )
}

export function Empty({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div className="p-10 text-center rounded-[var(--radius)] border border-border bg-card">
      <p className="text-[13px] text-muted-foreground mb-3">{message}</p>
      {action}
    </div>
  )
}

export function Spinner() {
  return <div className="w-8 h-8 rounded-full border-2 border-border border-t-primary animate-spin" role="status" aria-label="加载中" />
}
```

- [ ] **Step 7: Create usePage.ts**

```ts
import { useState } from 'react'

export function usePage(initialSize = 20) {
  const [page, setPage] = useState(0)
  const [size] = useState(initialSize)
  return { page, size, setPage }
}
```

- [ ] **Step 8: Typecheck the shared layer**

Run: `npx tsc --noEmit`
Expected: exit 0.

---

### Task 3: App shell (router, guard, sidebar, header, login/callback/overview)

**Files:**
- Modify: `frontend/src/App.tsx`
- Create: `frontend/src/app/router.tsx`
- Create: `frontend/src/app/PrivateRoute.tsx`
- Create: `frontend/src/app/AppShell.tsx`
- Create: `frontend/src/app/Sidebar.tsx`
- Create: `frontend/src/app/Header.tsx`
- Create: `frontend/src/app/pages/LoginPage.tsx`
- Create: `frontend/src/app/pages/CallbackPage.tsx`
- Create: `frontend/src/app/pages/OverviewPage.tsx`

**Interfaces:**
- Consumes: Task 2 `AuthProvider/useAuth`, `Card/Button/Spinner`, `apiClient`.
- Produces: routes `/login, /callback, /, /tasks, /finance/*, /hr`; `AppShell` layout; `OverviewPage` stat cards.

- [ ] **Step 1: Create PrivateRoute.tsx**

```tsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../shared/auth/AuthContext'
import { Spinner } from '../../shared/ui'
import type { JSX } from 'react'

export function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user, ready } = useAuth()
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return children
}
```

- [ ] **Step 2: Create Sidebar.tsx**

```tsx
import { FolderKanban, Landmark, LayoutDashboard, ListTodo, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../shared/auth/AuthContext'
import { cn } from '../../shared/lib/cn'

const groups = [
  {
    title: '概览',
    items: [{ to: '/', label: '总览', Icon: LayoutDashboard }],
  },
  {
    title: '任务',
    items: [{ to: '/tasks', label: '任务', Icon: ListTodo }],
  },
  {
    title: '财务',
    items: [
      { to: '/finance/dashboard', label: '财务看板', Icon: Landmark },
      { to: '/finance/transactions', label: '交易', Icon: ListTodo },
      { to: '/finance/accounts', label: '账户', Icon: FolderKanban },
    ],
  },
  {
    title: '人事',
    items: [{ to: '/hr', label: '人事（即将到来）', Icon: UserRound }],
  },
]

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth()
  return (
    <>
      {open && (
        <button aria-label="关闭侧边栏" onClick={onClose} className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden" />
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
            <p className="text-[13px] font-semibold text-foreground truncate">个人资源管理</p>
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
            <p className="text-[12px] text-foreground truncate min-w-0">{user?.profile?.preferred_username ?? '已登录'}</p>
          </div>
        </div>
      </aside>
    </>
  )
}
```

- [ ] **Step 3: Create Header.tsx**

```tsx
import { Menu } from 'lucide-react'

export function Header({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-20 h-[56px] bg-background/80 backdrop-blur-xl border-b border-border flex items-center gap-4 px-4 lg:px-8">
      <button aria-label="打开菜单" onClick={onMenu} className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
        <Menu size={16} />
      </button>
      <p className="text-[13px] text-muted-foreground truncate">个人ERP · 操作台</p>
    </header>
  )
}
```

- [ ] **Step 4: Create AppShell.tsx**

```tsx
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function AppShell() {
  const [open, setOpen] = useState(false)
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header onMenu={() => setOpen(true)} />
        <main className="flex-1 px-4 lg:px-8 py-6 lg:py-8 max-w-[1280px] w-full mx-auto">
          <div className="space-y-5 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create LoginPage.tsx**

```tsx
import { useAuth } from '../../../shared/auth/AuthContext'
import { Button, Card } from '../../../shared/ui'

export function LoginPage() {
  const { login } = useAuth()
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm p-6">
        <h1 className="text-[22px] font-semibold leading-tight text-foreground">个人资源管理</h1>
        <p className="text-[13px] text-muted-foreground mt-1">使用统一身份登录后进入操作台。</p>
        <Button variant="primary" className="w-full mt-5" onClick={() => void login()}>
          前往登录
        </Button>
      </Card>
    </div>
  )
}
```

- [ ] **Step 6: Create CallbackPage.tsx**

```tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../shared/auth/AuthContext'
import { Spinner } from '../../../shared/ui'

export function CallbackPage() {
  const { handleCallback } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    handleCallback()
      .then(() => navigate('/', { replace: true }))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : '登录回调失败'))
  }, [handleCallback, navigate])

  return (
    <div className="min-h-screen bg-background flex flex-col gap-3 items-center justify-center p-4">
      {error ? <p className="text-[13px] text-danger">{error}</p> : <Spinner />}
    </div>
  )
}
```

- [ ] **Step 7: Create OverviewPage.tsx**

```tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiClient, toMessage } from '../../shared/lib/apiClient'
import { Card } from '../../shared/ui'

interface Summary {
  totalIncome: string | number
  totalExpense: string | number
}

export function OverviewPage() {
  const [openTasks, setOpenTasks] = useState<number | null>(null)
  const [accounts, setAccounts] = useState<number | null>(null)
  const [monthNet, setMonthNet] = useState<string>('-')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [tasks, accs, summary] = await Promise.all([
          apiClient.get('/task', { params: { page: 0, size: 1 } }),
          apiClient.get('/accounts', { params: { page: 0, size: 1 } }),
          apiClient.get<Summary>('/statistics/summary', { params: { from: '2026-01-01', to: '2026-12-31' } }),
        ])
        if (cancelled) return
        setOpenTasks(tasks.data.totalElements ?? null)
        setAccounts(accs.data.totalElements ?? null)
        const income = Number(summary.data.totalIncome ?? 0)
        const expense = Number(summary.data.totalExpense ?? 0)
        setMonthNet((income - expense).toLocaleString('zh-CN', { minimumFractionDigits: 2 }))
      } catch (e) {
        if (!cancelled) setError(toMessage(e))
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const cards = [
    { label: '任务总数', value: openTasks === null ? '-' : String(openTasks), to: '/tasks' },
    { label: '账户总数', value: accounts === null ? '-' : String(accounts), to: '/finance/accounts' },
    { label: '年净收支', value: monthNet, to: '/finance/statistics' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold leading-tight text-foreground">总览</h1>
        <p className="text-[13px] text-muted-foreground mt-1">任务与财务的一屏摘要。</p>
      </div>
      {error && <p className="text-[12px] text-danger">{error}</p>}
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} to={c.to}>
            <Card className="p-5">
              <p className="text-[11px] font-medium text-muted-foreground mb-1">{c.label}</p>
              <p className="text-[28px] font-semibold leading-none text-foreground">{c.value}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 8: Create router.tsx**

```tsx
import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from './AppShell'
import { PrivateRoute } from './PrivateRoute'
import { CallbackPage } from './pages/CallbackPage'
import { LoginPage } from './pages/LoginPage'
import { OverviewPage } from './pages/OverviewPage'
import { TasksPage } from '../../domains/task/pages/TasksPage'
import { AccountsPage } from '../../domains/finance/pages/AccountsPage'
import { CategoriesPage } from '../../domains/finance/pages/CategoriesPage'
import { FinanceDashboardPage } from '../../domains/finance/pages/FinanceDashboardPage'
import { StatisticsPage } from '../../domains/finance/pages/StatisticsPage'
import { TransactionsPage } from '../../domains/finance/pages/TransactionsPage'
import { HrPlaceholderPage } from '../../domains/hr/HrPlaceholderPage'

function guard(el: React.JSX.Element) {
  return <PrivateRoute>{el}</PrivateRoute>
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/callback', element: <CallbackPage /> },
  {
    element: <AppShell />,
    children: [
      { path: '/', element: guard(<OverviewPage />) },
      { path: '/tasks', element: guard(<TasksPage />) },
      { path: '/finance/dashboard', element: guard(<FinanceDashboardPage />) },
      { path: '/finance/accounts', element: guard(<AccountsPage />) },
      { path: '/finance/transactions', element: guard(<TransactionsPage />) },
      { path: '/finance/categories', element: guard(<CategoriesPage />) },
      { path: '/finance/statistics', element: guard(<StatisticsPage />) },
      { path: '/hr', element: guard(<HrPlaceholderPage />) },
    ],
  },
])
```

- [ ] **Step 9: Rewrite App.tsx**

```tsx
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './shared/auth/AuthContext'
import { router } from './app/router'

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
```

- [ ] **Step 10: Typecheck shell**

Run: `npx tsc --noEmit`
Expected: exit 0 (domain pages are imported but created in Task 4/5; if running now, expect missing-module errors — then proceed to Task 4 immediately).

---

### Task 4: Task domain (types, api, tasks page + project sidebar)

**Files:**
- Create: `frontend/src/domains/task/types.ts`
- Create: `frontend/src/domains/task/api.ts`
- Create: `frontend/src/domains/task/components/ProjectSidebar.tsx`
- Create: `frontend/src/domains/task/components/TaskItem.tsx`
- Create: `frontend/src/domains/task/components/EditTaskModal.tsx`
- Create: `frontend/src/domains/task/pages/TasksPage.tsx`

**Interfaces:**
- Consumes: Task 2 `apiClient/toMessage/usePage/ui/format`; Task 3 router import of `TasksPage`.
- Produces: `Project {id, name, orderIndex, description, userId}`, `Task {id, userId, project: {id} & Project|null, title, description, isCompleted, createdAt, deadline}`, `Page<T>`; api `listTasks, listDeadlineTasks, toggleTask, createTask, updateTask, deleteTask, listProjects, createProject, updateProject, moveProject, deleteProject`; `TasksPage` default export named.

- [ ] **Step 1: Create types.ts**

```ts
export interface Project {
  id: number
  name: string
  orderIndex: number
  description?: string | null
  userId?: string
}

export interface Task {
  id: number
  userId?: string
  project?: Project | null
  title: string
  description?: string | null
  isCompleted?: boolean
  createdAt?: string
  deadline?: string | null
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  last: boolean
  number: number
  size: number
}
```

- [ ] **Step 2: Create api.ts**

```ts
import { apiClient } from '../../shared/lib/apiClient'
import type { Page, Project, Task } from './types'

export async function listTasks(params: { page: number; size: number; projectId?: number | null }): Promise<Page<Task>> {
  const res = await apiClient.get('/task', { params: { page: params.page, size: params.size, projectId: params.projectId ?? undefined } })
  return res.data as Page<Task>
}

export async function listDeadlineTasks(params: { page: number; size: number }): Promise<Page<Task>> {
  const res = await apiClient.get('/task/deadline', { params })
  return res.data as Page<Task>
}

export async function createTask(body: { title: string; description?: string; deadline?: string | null; projectId?: number | null }): Promise<Task> {
  const res = await apiClient.post('/task/add', {
    title: body.title,
    description: body.description,
    deadline: body.deadline,
    project: body.projectId ? { id: body.projectId } : null,
  })
  return res.data as Task
}

export async function toggleTask(id: number): Promise<Task> {
  const res = await apiClient.put(`/task/toggleComplete/${id}`)
  return res.data as Task
}

export async function updateTask(task: Task): Promise<Task> {
  const res = await apiClient.put('/task', task)
  return res.data as Task
}

export async function deleteTask(id: number): Promise<void> {
  await apiClient.delete(`/task/${id}`)
}

export async function listProjects(): Promise<Project[]> {
  const res = await apiClient.get('/project')
  return res.data as Project[]
}

export async function createProject(body: { name: string; description?: string }): Promise<Project> {
  const res = await apiClient.post('/project', body)
  return res.data as Project
}

export async function updateProject(body: Project): Promise<Project> {
  const res = await apiClient.put('/project', body)
  return res.data as Project
}

export async function moveProject(body: Project): Promise<Project> {
  const res = await apiClient.put('/project/updateOrder', body)
  return res.data as Project
}

export async function deleteProject(id: number): Promise<void> {
  await apiClient.delete(`/project/${id}`)
}
```

- [ ] **Step 3: Create TaskItem.tsx**

```tsx
import { Check, Trash2 } from 'lucide-react'
import { fmtDateTime } from '../../../shared/lib/format'
import { Button } from '../../../shared/ui'
import type { Task } from '../types'

export function TaskItem({ task, onToggle, onDelete }: { task: Task; onToggle: () => void; onDelete: () => void }) {
  return (
    <div className="px-6 py-4 flex items-start gap-3 hover:bg-muted transition-colors">
      <button
        aria-label={task.isCompleted ? '标为未完成' : '标为完成'}
        onClick={onToggle}
        className="mt-0.5 w-5 h-5 rounded-full border border-border bg-card flex items-center justify-center text-primary-foreground data-[done=true]:bg-primary"
        data-done={Boolean(task.isCompleted)}
      >
        {task.isCompleted && <Check size={12} />}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-foreground truncate">{task.title}</p>
        <p className="text-[12px] text-muted-foreground mt-1 truncate">
          {[task.project?.name, task.deadline ? `截止 ${fmtDateTime(task.deadline)}` : null].filter(Boolean).join(' · ') || '无项目'}
        </p>
      </div>
      <Button variant="destructive" title="删除任务" aria-label="删除任务" onClick={onDelete}>
        <Trash2 size={14} />
      </Button>
    </div>
  )
}
```

- [ ] **Step 4: Create EditTaskModal.tsx**

```tsx
import { useState } from 'react'
import { Button, Field, Input, Modal } from '../../../shared/ui'

export function EditTaskModal({
  projects,
  onClose,
  onSubmit,
}: {
  projects: { id: number; name: string }[]
  onClose: () => void
  onSubmit: (v: { title: string; description: string; deadline: string; projectId: number | null }) => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [projectId, setProjectId] = useState('')
  const [error, setError] = useState<string | null>(null)

  return (
    <Modal title="新建任务" onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          if (!title.trim()) {
            setError('标题必填')
            return
          }
          onSubmit({ title: title.trim(), description, deadline: deadline || '', projectId: projectId ? Number(projectId) : null })
        }}
      >
        <Field label="标题">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="做什么" />
        </Field>
        <Field label="描述">
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="补充说明（可选）" />
        </Field>
        <Field label="截止时间">
          <Input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </Field>
        <Field label="项目">
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full rounded-xl bg-muted border border-transparent px-3 py-2.5 text-[13px] text-foreground focus:outline-none focus:bg-card focus:border-border"
          >
            <option value="">无项目</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        {error && <p className="text-[12px] text-danger">{error}</p>}
        <div className="flex gap-3 pt-2">
          <Button type="button" className="flex-1 py-2.5 rounded-full bg-muted" onClick={onClose}>
            取消
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            保存
          </Button>
        </div>
      </form>
    </Modal>
  )
}
```

- [ ] **Step 5: Create ProjectSidebar.tsx**

```tsx
import { useState } from 'react'
import { Button, Input } from '../../../shared/ui'
import type { Project } from '../types'

export function ProjectSidebar({
  projects,
  activeId,
  onSelect,
  onCreate,
}: {
  projects: Project[]
  activeId: number | null
  onSelect: (id: number | null) => void
  onCreate: (name: string) => void
}) {
  const [name, setName] = useState('')
  return (
    <div className="rounded-[var(--radius)] border border-border bg-card p-4 space-y-2">
      <button
        onClick={() => onSelect(null)}
        className={`w-full text-left px-3 py-2 rounded-lg text-[13px] ${activeId === null ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
      >
        全部任务
      </button>
      {projects.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(p.id)}
          className={`w-full text-left px-3 py-2 rounded-lg text-[13px] truncate ${activeId === p.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
        >
          {p.name}
        </button>
      ))}
      <form
        className="flex gap-2 pt-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (!name.trim()) return
          onCreate(name.trim())
          setName('')
        }}
      >
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="新项目" aria-label="新项目名称" />
        <Button type="submit" variant="primary" className="shrink-0">
          添加
        </Button>
      </form>
    </div>
  )
}
```

- [ ] **Step 6: Create TasksPage.tsx**

```tsx
import { useCallback, useEffect, useState } from 'react'
import { toMessage } from '../../../shared/lib/apiClient'
import { usePage } from '../../../shared/hooks/usePage'
import { Badge, Button, Card, Empty, Spinner } from '../../../shared/ui'
import {
  createProject,
  createTask,
  deleteTask,
  listProjects,
  listTasks,
  toggleTask,
} from '../api'
import type { Project, Task } from '../types'
import { EditTaskModal } from '../components/EditTaskModal'
import { ProjectSidebar } from '../components/ProjectSidebar'
import { TaskItem } from '../components/TaskItem'

export function TasksPage() {
  const { page, size, setPage } = usePage(20)
  const [projectId, setProjectId] = useState<number | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [total, setTotal] = useState(0)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [t, p] = await Promise.all([
        listTasks({ page, size, projectId }),
        listProjects(),
      ])
      setTasks(t.content)
      setTotal(t.totalElements)
      setProjects(p)
    } catch (e) {
      setError(toMessage(e))
    } finally {
      setLoading(false)
    }
  }, [page, size, projectId])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold leading-tight text-foreground">任务</h1>
          <p className="text-[13px] text-muted-foreground mt-1">共 {total} 个任务，按项目筛选。</p>
        </div>
        <Button variant="primary" onClick={() => setModal(true)}>
          新建任务
        </Button>
      </div>
      {error && <p className="text-[12px] text-danger">{error}</p>}
      <div className="grid gap-4 lg:grid-cols-[272px_1fr]">
        <ProjectSidebar
          projects={projects}
          activeId={projectId}
          onSelect={(id) => {
            setProjectId(id)
            setPage(0)
          }}
          onCreate={async (name) => {
            await createProject({ name })
            await load()
          }}
        />
        <Card className="overflow-hidden">
          <div className="px-6 py-3 border-b border-border bg-muted flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">任务列表</span>
            <Badge>{total}</Badge>
          </div>
          {loading ? (
            <div className="p-10 flex justify-center">
              <Spinner />
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-4">
              <Empty message="暂无任务" />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {tasks.map((t) => (
                <TaskItem
                  key={t.id}
                  task={t}
                  onToggle={async () => {
                    await toggleTask(t.id)
                    await load()
                  }}
                  onDelete={async () => {
                    await deleteTask(t.id)
                    await load()
                  }}
                />
              ))}
            </div>
          )}
          <div className="px-6 py-3 border-t border-border flex items-center justify-between">
            <span className="text-[12px] text-muted-foreground">第 {page + 1} 页</span>
            <div className="flex gap-2">
              <Button disabled={page === 0} onClick={() => setPage(page - 1)}>
                上一页
              </Button>
              <Button disabled={(page + 1) * size >= total} onClick={() => setPage(page + 1)}>
                下一页
              </Button>
            </div>
          </div>
        </Card>
      </div>
      {modal && (
        <EditTaskModal
          projects={projects}
          onClose={() => setModal(false)}
          onSubmit={async (v) => {
            await createTask({ title: v.title, description: v.description, deadline: v.deadline || null, projectId: v.projectId })
            setModal(false)
            await load()
          }}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 7: Typecheck task domain**

Run: `npx tsc --noEmit`
Expected: exit 0.

---

### Task 5: Finance domain (types, api, 5 pages)

**Files:**
- Create: `frontend/src/domains/finance/types.ts`
- Create: `frontend/src/domains/finance/api.ts`
- Create: `frontend/src/domains/finance/pages/FinanceDashboardPage.tsx`
- Create: `frontend/src/domains/finance/pages/AccountsPage.tsx`
- Create: `frontend/src/domains/finance/pages/TransactionsPage.tsx`
- Create: `frontend/src/domains/finance/pages/CategoriesPage.tsx`
- Create: `frontend/src/domains/finance/pages/StatisticsPage.tsx`
- Create: `frontend/src/domains/finance/components/TrendSparkline.tsx`

**Interfaces:**
- Consumes: Task 2 shared; backend finance endpoints.
- Produces: finance `api` (listAccounts, createAccount, updateAccount, deleteAccount, totalBalance, listCategories, createCategory, updateCategory, deleteCategory, listTransactions, createTransaction, transfer, updateTransaction, deleteTransaction, listPresets, createPreset, updatePreset, deletePreset, summary, trend, accountBalances); 5 pages named as in router.

- [ ] **Step 1: Create types.ts**

```ts
import type { Page } from '../../task/types'

export type { Page }

export interface Account {
  id: number
  userId?: string
  name: string
  type: string
  balance: string | number
  currency: string
  note?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface AccountDto {
  name: string
  type: string
  balance?: string | number | null
  currency: string
  note?: string
}

export interface Category {
  id: number
  userId?: string | null
  name: string
  type: string
  icon?: string | null
  sortOrder?: number
  isSystem?: number
}

export interface CategoryDto {
  name: string
  type: string
  icon?: string
  sortOrder?: number
}

export interface Transaction {
  id: number
  userId?: string
  fromAccountId?: number | null
  toAccountId?: number | null
  categoryId?: number | null
  type: string
  amount: string | number
  occurredOn: string
  note?: string | null
  fromAccountName?: string | null
  toAccountName?: string | null
  categoryName?: string | null
}

export interface TransactionDto {
  fromAccountId?: number | null
  toAccountId?: number | null
  categoryId?: number | null
  type: string
  amount: string | number
  occurredOn: string
  note?: string
}

export interface Preset {
  id: number
  type: string
  amount: string | number
  fromAccountId?: number | null
  toAccountId?: number | null
  categoryId?: number | null
  note?: string | null
}

export interface Summary {
  totalIncome: string | number
  totalExpense: string | number
  net: string | number
  byCategory: { categoryId: number | null; categoryName: string | null; type: string; amount: string | number }[]
}

export interface TrendPoint {
  period: string
  income: string | number
  expense: string | number
}

export interface AccountBalance {
  accountId: number
  accountName: string
  currency: string
  balance: string | number
}

export interface CurrencyTotal {
  currency: string
  total: string | number
}
```

- [ ] **Step 2: Create api.ts**

```ts
import { apiClient } from '../../shared/lib/apiClient'
import type { Page } from '../../task/types'
import type {
  Account,
  AccountBalance,
  AccountDto,
  Category,
  CategoryDto,
  CurrencyTotal,
  Preset,
  Summary,
  Transaction,
  TransactionDto,
  TrendPoint,
} from './types'

export async function listAccounts(params: { page: number; size: number }): Promise<Page<Account>> {
  const res = await apiClient.get('/accounts', { params })
  return res.data as Page<Account>
}

export async function createAccount(body: AccountDto): Promise<number> {
  const res = await apiClient.post('/accounts', body)
  return res.data as number
}

export async function updateAccount(id: number, body: AccountDto): Promise<void> {
  await apiClient.put(`/accounts/${id}`, body)
}

export async function deleteAccount(id: number): Promise<void> {
  await apiClient.delete(`/accounts/${id}`)
}

export async function totalBalance(): Promise<CurrencyTotal[]> {
  const res = await apiClient.get('/accounts/total-balance')
  return res.data as CurrencyTotal[]
}

export async function listCategories(type?: string): Promise<Category[]> {
  const res = await apiClient.get('/categories', { params: type ? { type } : {} })
  return res.data as Category[]
}

export async function createCategory(body: CategoryDto): Promise<number> {
  const res = await apiClient.post('/categories', body)
  return res.data as number
}

export async function updateCategory(id: number, body: CategoryDto): Promise<void> {
  await apiClient.put(`/categories/${id}`, body)
}

export async function deleteCategory(id: number): Promise<void> {
  await apiClient.delete(`/categories/${id}`)
}

export async function listTransactions(params: {
  from?: string
  to?: string
  accountId?: number
  categoryId?: number
  type?: string
  page: number
  size: number
}): Promise<Page<Transaction>> {
  const res = await apiClient.get('/transactions', { params })
  return res.data as Page<Transaction>
}

export async function createTransaction(body: TransactionDto): Promise<number> {
  const res = await apiClient.post('/transactions', body)
  return res.data as number
}

export async function transfer(body: TransactionDto): Promise<number> {
  const res = await apiClient.post('/transactions/transfer', body)
  return res.data as number
}

export async function updateTransaction(id: number, body: TransactionDto): Promise<void> {
  await apiClient.put(`/transactions/${id}`, body)
}

export async function deleteTransaction(id: number): Promise<void> {
  await apiClient.delete(`/transactions/${id}`)
}

export async function listPresets(): Promise<Preset[]> {
  const res = await apiClient.get('/transaction-presets')
  return res.data as Preset[]
}

export async function createPreset(body: Omit<TransactionDto, 'occurredOn'>): Promise<number> {
  const res = await apiClient.post('/transaction-presets', body)
  return res.data as number
}

export async function updatePreset(id: number, body: Omit<TransactionDto, 'occurredOn'>): Promise<void> {
  await apiClient.put(`/transaction-presets/${id}`, body)
}

export async function deletePreset(id: number): Promise<void> {
  await apiClient.delete(`/transaction-presets/${id}`)
}

export async function summary(from: string, to: string): Promise<Summary> {
  const res = await apiClient.get('/statistics/summary', { params: { from, to } })
  return res.data as Summary
}

export async function trend(from: string, to: string, unit = 'day'): Promise<TrendPoint[]> {
  const res = await apiClient.get('/statistics/trend', { params: { from, to, unit } })
  return res.data as TrendPoint[]
}

export async function accountBalances(): Promise<AccountBalance[]> {
  const res = await apiClient.get('/statistics/account-balances')
  return res.data as AccountBalance[]
}
```

- [ ] **Step 3: Create TrendSparkline.tsx**

```tsx
export function TrendSparkline({ points }: { points: { income: string | number; expense: string | number }[] }) {
  const vals = points.map((p) => Number(p.income) + Number(p.expense))
  const max = Math.max(1, ...vals)
  const d = vals.map((v, i) => `${(i / Math.max(1, vals.length - 1)) * 100},${100 - (v / max) * 90}`).join(' ')
  return (
    <svg viewBox="0 0 100 100" className="w-full h-16" preserveAspectRatio="none" aria-label="趋势">
      <polyline points={d} fill="none" stroke="var(--primary)" strokeWidth="2" />
    </svg>
  )
}
```

- [ ] **Step 4: Create FinanceDashboardPage.tsx**

```tsx
import { useEffect, useState } from 'react'
import { fmtMoney } from '../../../shared/lib/format'
import { Card } from '../../../shared/ui'
import { accountBalances, summary, totalBalance, trend } from '../api'
import { TrendSparkline } from '../components/TrendSparkline'

export function FinanceDashboardPage() {
  const [net, setNet] = useState('-')
  const [income, setIncome] = useState('-')
  const [expense, setExpense] = useState('-')
  const [currencies, setCurrencies] = useState(0)
  const [points, setPoints] = useState<{ income: string | number; expense: string | number }[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [s, t, b] = await Promise.all([
        summary('2026-01-01', '2026-12-31'),
        trend('2026-09-01', '2026-09-30', 'day'),
        Promise.all([totalBalance(), accountBalances()]),
      ])
      if (cancelled) return
      setIncome(fmtMoney(s.totalIncome))
      setExpense(fmtMoney(s.totalExpense))
      setNet(fmtMoney(s.net))
      setCurrencies(b[0].length)
      setPoints(t)
    }
    void load().catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold leading-tight text-foreground">财务看板</h1>
        <p className="text-[13px] text-muted-foreground mt-1">收支、账户与趋势的一屏摘要。</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: '年收入', value: income },
          { label: '年支出', value: expense },
          { label: '年净收支', value: net },
          { label: '币种数', value: String(currencies) },
        ].map((c) => (
          <Card key={c.label} className="p-5">
            <p className="text-[11px] font-medium text-muted-foreground mb-1">{c.label}</p>
            <p className="text-[28px] font-semibold leading-none text-foreground">{c.value}</p>
          </Card>
        ))}
      </div>
      <Card className="p-5">
        <p className="text-[13px] font-semibold text-foreground mb-3">9月趋势</p>
        <TrendSparkline points={points} />
      </Card>
    </div>
  )
}
```

- [ ] **Step 5: Create AccountsPage.tsx**

```tsx
import { useCallback, useEffect, useState } from 'react'
import { toMessage } from '../../../shared/lib/apiClient'
import { fmtMoney } from '../../../shared/lib/format'
import { usePage } from '../../../shared/hooks/usePage'
import { Badge, Button, Card, Empty, Spinner } from '../../../shared/ui'
import { deleteAccount, listAccounts, totalBalance } from '../api'
import type { Account, CurrencyTotal } from '../types'

export function AccountsPage() {
  const { page, size, setPage } = usePage(20)
  const [rows, setRows] = useState<Account[]>([])
  const [total, setTotal] = useState(0)
  const [totals, setTotals] = useState<CurrencyTotal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [a, t] = await Promise.all([listAccounts({ page, size }), totalBalance()])
      setRows(a.content)
      setTotal(a.totalElements)
      setTotals(t)
    } catch (e) {
      setError(toMessage(e))
    } finally {
      setLoading(false)
    }
  }, [page, size])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold leading-tight text-foreground">账户</h1>
        <p className="text-[13px] text-muted-foreground mt-1">共 {total} 个账户。</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {totals.map((t) => (
          <Badge key={t.currency}>
            {t.currency} {fmtMoney(t.total)}
          </Badge>
        ))}
      </div>
      {error && <p className="text-[12px] text-danger">{error}</p>}
      <Card className="overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-border bg-muted text-[11px] font-medium text-muted-foreground">
          <div className="col-span-5">名称</div>
          <div className="col-span-3">类型</div>
          <div className="col-span-2">余额</div>
          <div className="col-span-2 text-right">操作</div>
        </div>
        {loading ? (
          <div className="p-10 flex justify-center">
            <Spinner />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-4">
            <Empty message="暂无账户" />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {rows.map((a) => (
              <div key={a.id} className="px-6 py-4 flex flex-col md:grid md:grid-cols-12 gap-3 items-start md:items-center hover:bg-muted transition-colors">
                <div className="col-span-5 min-w-0 w-full">
                  <p className="text-[13px] font-medium text-foreground truncate">{a.name}</p>
                  <p className="text-[12px] text-muted-foreground mt-1">{a.currency}</p>
                </div>
                <div className="col-span-3">
                  <Badge>{a.type}</Badge>
                </div>
                <p className="col-span-2 text-[13px] text-foreground">{fmtMoney(a.balance, a.currency)}</p>
                <div className="col-span-2 flex md:justify-end">
                  <Button
                    variant="destructive"
                    title="删除账户"
                    aria-label={`删除账户 ${a.name}`}
                    onClick={async () => {
                      await deleteAccount(a.id)
                      await load()
                    }}
                  >
                    删除
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="px-6 py-3 border-t border-border flex items-center justify-between">
          <span className="text-[12px] text-muted-foreground">第 {page + 1} 页</span>
          <div className="flex gap-2">
            <Button disabled={page === 0} onClick={() => setPage(page - 1)}>
              上一页
            </Button>
            <Button disabled={(page + 1) * size >= total} onClick={() => setPage(page + 1)}>
              下一页
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
```

- [ ] **Step 6: Create TransactionsPage.tsx**

```tsx
import { useCallback, useEffect, useState } from 'react'
import { toMessage } from '../../../shared/lib/apiClient'
import { fmtMoney } from '../../../shared/lib/format'
import { usePage } from '../../../shared/hooks/usePage'
import { Badge, Button, Card, Empty, Spinner } from '../../../shared/ui'
import { deleteTransaction, listTransactions } from '../api'
import type { Transaction } from '../types'

export function TransactionsPage() {
  const { page, size, setPage } = usePage(20)
  const [type, setType] = useState('')
  const [rows, setRows] = useState<Transaction[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listTransactions({ type: type || undefined, page, size })
      setRows(res.content)
      setTotal(res.totalElements)
    } catch (e) {
      setError(toMessage(e))
    } finally {
      setLoading(false)
    }
  }, [page, size, type])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold leading-tight text-foreground">交易</h1>
        <p className="text-[13px] text-muted-foreground mt-1">共 {total} 笔，支持类型筛选。</p>
      </div>
      <Card className="p-4 flex flex-wrap gap-2">
        {['', 'INCOME', 'EXPENSE', 'TRANSFER'].map((t) => (
          <button
            key={t || 'all'}
            onClick={() => {
              setType(t)
              setPage(0)
            }}
            className={`px-2.5 py-1 rounded-full border text-[12px] font-medium transition-colors ${type === t ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/40'}`}
          >
            {t === '' ? '全部' : t}
          </button>
        ))}
      </Card>
      {error && <p className="text-[12px] text-danger">{error}</p>}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center">
            <Spinner />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-4">
            <Empty message="暂无交易" />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {rows.map((t) => (
              <div key={t.id} className="px-6 py-4 flex flex-col md:grid md:grid-cols-12 gap-3 items-start md:items-center hover:bg-muted transition-colors">
                <div className="col-span-6 min-w-0 w-full">
                  <p className="text-[13px] font-medium text-foreground truncate">
                    {t.categoryName ?? t.note ?? `交易 #${t.id}`}
                  </p>
                  <p className="text-[12px] text-muted-foreground mt-1">
                    {t.occurredOn} · {[t.fromAccountName, t.toAccountName].filter(Boolean).join(' → ') || '-'}
                  </p>
                </div>
                <div className="col-span-2">
                  <Badge tone={t.type === 'INCOME' ? 'success' : t.type === 'EXPENSE' ? 'danger' : 'neutral'}>{t.type}</Badge>
                </div>
                <p className="col-span-2 text-[13px] text-foreground">{fmtMoney(t.amount)}</p>
                <div className="col-span-2 flex md:justify-end">
                  <Button
                    variant="destructive"
                    title="删除交易"
                    aria-label={`删除交易 ${t.id}`}
                    onClick={async () => {
                      await deleteTransaction(t.id)
                      await load()
                    }}
                  >
                    删除
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="px-6 py-3 border-t border-border flex items-center justify-between">
          <span className="text-[12px] text-muted-foreground">第 {page + 1} 页</span>
          <div className="flex gap-2">
            <Button disabled={page === 0} onClick={() => setPage(page - 1)}>
              上一页
            </Button>
            <Button disabled={(page + 1) * size >= total} onClick={() => setPage(page + 1)}>
              下一页
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
```

- [ ] **Step 7: Create CategoriesPage.tsx**

```tsx
import { useCallback, useEffect, useState } from 'react'
import { toMessage } from '../../../shared/lib/apiClient'
import { Badge, Button, Card, Empty, Spinner } from '../../../shared/ui'
import { deleteCategory, listCategories } from '../api'
import type { Category } from '../types'

export function CategoriesPage() {
  const [type, setType] = useState('')
  const [rows, setRows] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setRows(await listCategories(type || undefined))
    } catch (e) {
      setError(toMessage(e))
    } finally {
      setLoading(false)
    }
  }, [type])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold leading-tight text-foreground">分类</h1>
        <p className="text-[13px] text-muted-foreground mt-1">系统分类不可改，自建分类可维护。</p>
      </div>
      <Card className="p-4 flex flex-wrap gap-2">
        {['', 'INCOME', 'EXPENSE'].map((t) => (
          <button
            key={t || 'all'}
            onClick={() => setType(t)}
            className={`px-2.5 py-1 rounded-full border text-[12px] font-medium transition-colors ${type === t ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/40'}`}
          >
            {t === '' ? '全部' : t}
          </button>
        ))}
      </Card>
      {error && <p className="text-[12px] text-danger">{error}</p>}
      {loading ? (
        <div className="p-10 text-center">
          <Spinner />
        </div>
      ) : rows.length === 0 ? (
        <Empty message="暂无分类" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {rows.map((c) => (
            <Card key={c.id} className="p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-foreground truncate">{c.name}</div>
                <div className="text-[12px] text-muted-foreground truncate">
                  {c.type} · 排序 {c.sortOrder ?? '-'}
                </div>
              </div>
              {c.userId === null || c.userId === undefined ? (
                <Badge tone="neutral">系统</Badge>
              ) : (
                <Button
                  variant="destructive"
                  title="删除分类"
                  aria-label={`删除分类 ${c.name}`}
                  onClick={async () => {
                    await deleteCategory(c.id)
                    await load()
                  }}
                >
                  删除
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 8: Create StatisticsPage.tsx**

```tsx
import { useEffect, useState } from 'react'
import { toMessage } from '../../../shared/lib/apiClient'
import { fmtMoney } from '../../../shared/lib/format'
import { Card, Spinner } from '../../../shared/ui'
import { accountBalances, summary, trend } from '../api'
import type { AccountBalance, Summary, TrendPoint } from '../types'
import { TrendSparkline } from '../components/TrendSparkline'

export function StatisticsPage() {
  const [data, setData] = useState<Summary | null>(null)
  const [points, setPoints] = useState<TrendPoint[]>([])
  const [balances, setBalances] = useState<AccountBalance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [s, t, b] = await Promise.all([
          summary('2026-01-01', '2026-12-31'),
          trend('2026-09-01', '2026-09-30', 'day'),
          accountBalances(),
        ])
        if (cancelled) return
        setData(s)
        setPoints(t)
        setBalances(b)
      } catch (e) {
        if (!cancelled) setError(toMessage(e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="p-10 text-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold leading-tight text-foreground">统计</h1>
        <p className="text-[13px] text-muted-foreground mt-1">收支汇总、趋势与账户余额。</p>
      </div>
      {error && <p className="text-[12px] text-danger">{error}</p>}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: '总收入', value: fmtMoney(data?.totalIncome ?? '-') },
          { label: '总支出', value: fmtMoney(data?.totalExpense ?? '-') },
          { label: '净收支', value: fmtMoney(data?.net ?? '-') },
        ].map((c) => (
          <Card key={c.label} className="p-5">
            <p className="text-[11px] font-medium text-muted-foreground mb-1">{c.label}</p>
            <p className="text-[28px] font-semibold leading-none text-foreground">{c.value}</p>
          </Card>
        ))}
      </div>
      <Card className="p-5">
        <p className="text-[13px] font-semibold text-foreground mb-3">9月趋势</p>
        <TrendSparkline points={points} />
      </Card>
      <Card className="overflow-hidden">
        <div className="px-6 py-3 border-b border-border bg-muted text-[11px] font-medium text-muted-foreground">账户余额</div>
        <div className="divide-y divide-border">
          {balances.map((b) => (
            <div key={b.accountId} className="px-6 py-4 flex items-center justify-between hover:bg-muted transition-colors">
              <p className="text-[13px] font-medium text-foreground truncate">{b.accountName}</p>
              <p className="text-[13px] text-foreground">{fmtMoney(b.balance, b.currency)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
```

- [ ] **Step 9: Typecheck finance domain**

Run: `npx tsc --noEmit`
Expected: exit 0.

---

### Task 6: HR placeholder, theme wiring, final verification

**Files:**
- Create: `frontend/src/domains/hr/HrPlaceholderPage.tsx`
- Modify: `frontend/src/main.tsx` (dark-mode init already in index.css via .dark class; add `color-scheme` guard only if missing — skip if present)

**Interfaces:**
- Consumes: router `/hr` import.
- Produces: disabled placeholder page; verified build.

- [ ] **Step 1: Create HrPlaceholderPage.tsx**

```tsx
import { Card } from '../../shared/ui'

export function HrPlaceholderPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold leading-tight text-foreground">人事</h1>
        <p className="text-[13px] text-muted-foreground mt-1">该模块尚未接入，路由与侧边栏已预留。</p>
      </div>
      <Card className="p-10 text-center">
        <p className="text-[13px] text-muted-foreground">HR domain stub — 后续照 task/finance 复制接入。</p>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Full build**

Run: `npm run build`
Expected: success, `dist/` emitted.

- [ ] **Step 3: Acceptance greps**

Run: `grep -r "shadcn\|@mui\|antd" src package.json || echo NO_UI_LIB`
Expected: `NO_UI_LIB`.

Run: `grep -rn "#0047ff\|#f5f5f7\|#1d1d1f" src --include=*.tsx || echo NO_HEX`
Expected: `NO_HEX`.

- [ ] **Step 4: Smoke checklist (needs backend :8085 + Keycloak)**

1. `npm run dev`, open `/login`, jump to Keycloak, back to `/callback` then `/`.
2. `/api/auth/me` returns principal.
3. Tasks: create → toggle → delete; projects list.
4. Accounts/transactions/statistics pages load without 500.
5. Toggle `.dark` on `html`: no white boxes, recessed panels visible.
6. Mobile width: sidebar becomes drawer, tables stack.
