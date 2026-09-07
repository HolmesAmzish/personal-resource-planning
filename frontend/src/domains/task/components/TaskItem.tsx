import { Ban, CheckCircle2, Circle, SquarePen, Trash2 } from 'lucide-react'
import { fmtDateTime } from '../../../shared/lib/format'
import { useT } from '../../../shared/i18n/TranslationContext'
import { Button } from '../../../shared/ui'
import type { Task, TaskStatus } from '../types'

export function TaskItem({
  task,
  onStatusChange,
  onEdit,
  onDelete,
}: {
  task: Task
  onStatusChange: (status: TaskStatus) => void
  onEdit: () => void
  onDelete: () => void
}) {
  const t = useT()
  const status = task.status ?? 'PENDING'
  const isCompleted = status === 'COMPLETED'
  const isCancelled = status === 'CANCELLED'

  return (
    <div
      className={`group px-6 py-4 flex items-start gap-2 transition-colors ${
        isCancelled ? 'bg-muted/40 opacity-70' : 'hover:bg-muted'
      }`}
    >
      <Button
        variant="ghost"
        title={isCompleted ? t('tasks.unmarkComplete') : t('tasks.markComplete')}
        aria-label={isCompleted ? t('tasks.unmarkComplete') : t('tasks.markComplete')}
        onClick={() => onStatusChange(isCompleted ? 'PENDING' : 'COMPLETED')}
      >
        {isCompleted ? <CheckCircle2 size={17} className="text-success" /> : <Circle size={17} />}
      </Button>
      <div className="flex-1 min-w-0">
        <p
          className={`text-[13px] font-medium truncate ${
            isCompleted
              ? 'line-through text-muted-foreground'
              : isCancelled
                ? 'text-muted-foreground'
                : 'text-foreground'
          }`}
        >
          {task.title}
        </p>
        <p className="text-[12px] text-muted-foreground/80 mt-1 truncate">
          {[task.project?.name, task.deadline ? `${t('tasks.due')} ${fmtDateTime(task.deadline)}` : null]
            .filter(Boolean)
            .join(' · ') || t('tasks.noProject')}
        </p>
      </div>
      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <Button
          variant="ghost"
          title={t('tasks.discard')}
          aria-label={t('tasks.discard')}
          disabled={isCancelled}
          onClick={() => onStatusChange('CANCELLED')}
        >
          <Ban size={15} />
        </Button>
        <Button variant="ghost" title={t('tasks.editTask')} aria-label={t('tasks.editTask')} onClick={onEdit}>
          <SquarePen size={15} />
        </Button>
        <Button
          variant="destructive"
          title={t('tasks.deleteTask')}
          aria-label={t('tasks.deleteTask')}
          onClick={onDelete}
        >
          <Trash2 size={15} />
        </Button>
      </div>
    </div>
  )
}
