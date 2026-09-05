import { Trash2 } from 'lucide-react'
import { fmtDateTime } from '../../../shared/lib/format'
import { useT } from '../../../shared/i18n/TranslationContext'
import { Button } from '../../../shared/ui'
import { TASK_STATUSES } from '../types'
import type { Task, TaskStatus } from '../types'

export function TaskItem({ task, onStatusChange, onDelete }: { task: Task; onStatusChange: (status: TaskStatus) => void; onDelete: () => void }) {
  const t = useT()
  return (
    <div className="px-6 py-4 flex items-start gap-3 hover:bg-muted transition-colors">
      <select
        aria-label={t('tasks.status')}
        value={task.status ?? 'NOT_STARTED'}
        onChange={(e) => onStatusChange(e.target.value as TaskStatus)}
        className="mt-0.5 h-8 rounded-lg bg-muted border border-transparent px-2 text-[12px] text-foreground focus:outline-none focus:bg-card focus:border-border"
      >
        {TASK_STATUSES.map((status) => (
          <option key={status} value={status}>
            {t(`tasks.${status}`)}
          </option>
        ))}
      </select>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-foreground truncate">{task.title}</p>
        <p className="text-[12px] text-muted-foreground mt-1 truncate">
          {[task.project?.name, task.deadline ? `${t('tasks.due')} ${fmtDateTime(task.deadline)}` : null].filter(Boolean).join(' · ') || t('tasks.noProject')}
        </p>
      </div>
      <Button variant="destructive" title={t('tasks.deleteTask')} aria-label={t('tasks.deleteTask')} onClick={onDelete}>
        <Trash2 size={14} />
      </Button>
    </div>
  )
}
