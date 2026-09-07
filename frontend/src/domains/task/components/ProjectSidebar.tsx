import { useState } from 'react'
import { GripVertical } from 'lucide-react'
import { useT } from '../../../shared/i18n/TranslationContext'
import { Button, Input } from '../../../shared/ui'
import type { Project } from '../types'

export function ProjectSidebar({
  projects,
  activeId,
  onSelect,
  onCreate,
  onMove,
}: {
  projects: Project[]
  activeId: number | null
  onSelect: (id: number | null) => void
  onCreate: (name: string) => void
  onMove: (draggedId: number, targetId: number) => void
}) {
  const t = useT()
  const [name, setName] = useState('')
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const [dragOverId, setDragOverId] = useState<number | null>(null)

  const clearDragState = () => {
    setDraggingId(null)
    setDragOverId(null)
  }

  return (
    <div className="rounded-[var(--radius)] border border-border bg-card p-4 space-y-2">
      <button
        onClick={() => onSelect(null)}
        className={`w-full text-left px-3 py-2 rounded-lg text-[13px] ${
          activeId === null
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
      >
        {t('tasks.allTasks')}
      </button>
      {projects.map((project) => {
        const isActive = activeId === project.id
        const isDragging = draggingId === project.id
        const isDropTarget = dragOverId === project.id && draggingId !== project.id

        return (
          <div
            key={project.id}
            draggable
            onDragStart={(e) => {
              setDraggingId(project.id)
              e.dataTransfer.effectAllowed = 'move'
              e.dataTransfer.setData('text/plain', String(project.id))
            }}
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = 'move'
              setDragOverId(project.id)
            }}
            onDragLeave={() => setDragOverId((current) => current === project.id ? null : current)}
            onDrop={(e) => {
              e.preventDefault()
              if (draggingId && draggingId !== project.id) onMove(draggingId, project.id)
              clearDragState()
            }}
            onDragEnd={clearDragState}
            className={`group rounded-lg transition-all ${isDragging ? 'opacity-40' : ''} ${
              isDropTarget ? 'ring-2 ring-primary/40' : ''
            }`}
          >
            <button
              onClick={() => onSelect(project.id)}
              className={`w-full flex items-center gap-1 text-left px-2 py-2 rounded-lg text-[13px] ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <GripVertical
                size={14}
                className={`shrink-0 ${isActive ? 'text-primary-foreground/70' : 'text-muted-foreground/40 opacity-0 group-hover:opacity-100'}`}
              />
              <span className="truncate">{project.name}</span>
            </button>
          </div>
        )
      })}
      <form
        className="flex gap-2 pt-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (!name.trim()) return
          onCreate(name.trim())
          setName('')
        }}
      >
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('tasks.newProject')}
          aria-label={t('tasks.newProjectName')}
        />
        <Button type="submit" variant="primary" className="shrink-0">
          {t('tasks.add')}
        </Button>
      </form>
    </div>
  )
}
