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
        All tasks
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
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New project" aria-label="New project name" />
        <Button type="submit" variant="primary" className="shrink-0">
          Add
        </Button>
      </form>
    </div>
  )
}
