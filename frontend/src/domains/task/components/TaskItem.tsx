import { Check, Trash2 } from 'lucide-react'
import { fmtDateTime } from '../../../shared/lib/format'
import { Button } from '../../../shared/ui'
import type { Task } from '../types'

export function TaskItem({ task, onToggle, onDelete }: { task: Task; onToggle: () => void; onDelete: () => void }) {
  return (
    <div className="px-6 py-4 flex items-start gap-3 hover:bg-muted transition-colors">
      <button
        aria-label={task.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        onClick={onToggle}
        className="mt-0.5 w-5 h-5 rounded-full border border-border bg-card flex items-center justify-center text-primary-foreground data-[done=true]:bg-primary"
        data-done={Boolean(task.isCompleted)}
      >
        {task.isCompleted && <Check size={12} />}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-foreground truncate">{task.title}</p>
        <p className="text-[12px] text-muted-foreground mt-1 truncate">
          {[task.project?.name, task.deadline ? `Due ${fmtDateTime(task.deadline)}` : null].filter(Boolean).join(' · ') || 'No project'}
        </p>
      </div>
      <Button variant="destructive" title="Delete task" aria-label="Delete task" onClick={onDelete}>
        <Trash2 size={14} />
      </Button>
    </div>
  )
}
