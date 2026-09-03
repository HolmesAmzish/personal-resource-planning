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
