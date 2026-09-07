import { useState } from 'react'
import { useT } from '../../../shared/i18n/TranslationContext'
import { Button, Field, Input, Modal } from '../../../shared/ui'
import type { Task } from '../types'

export type TaskFormValue = {
  title: string
  description: string
  deadline: string
  projectId: number | null
}

export function EditTaskModal({
  projects,
  task,
  onClose,
  onSubmit,
}: {
  projects: { id: number; name: string }[]
  task?: Task | null
  onClose: () => void
  onSubmit: (v: TaskFormValue) => Promise<void>
}) {
  const t = useT()
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [deadline, setDeadline] = useState(task?.deadline?.slice(0, 16) ?? '')
  const [projectId, setProjectId] = useState(task?.project?.id ? String(task.project.id) : '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  return (
    <Modal title={task ? t('tasks.editTask') : t('tasks.newTask')} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault()
          if (!title.trim() || saving) return
          setError(null)
          setSaving(true)
          try {
            await onSubmit({
              title: title.trim(),
              description,
              deadline: deadline || '',
              projectId: projectId ? Number(projectId) : null,
            })
          } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : String(submitError))
          } finally {
            setSaving(false)
          }
        }}
      >
        <Field label={t('tasks.titleLabel')}>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('tasks.titlePlaceholder')} />
        </Field>
        <Field label={t('tasks.descriptionLabel')}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('tasks.descriptionPlaceholder')}
            rows={3}
            className="w-full rounded-xl bg-muted border border-transparent px-3 py-2.5 text-[13px] text-foreground resize-none placeholder:text-muted-foreground focus:outline-none focus:bg-card focus:border-border"
          />
        </Field>
        <Field label={t('tasks.deadlineLabel')}>
          <Input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </Field>
        <Field label={t('tasks.projectLabel')}>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full rounded-xl bg-muted border border-transparent px-3 py-2.5 text-[13px] text-foreground focus:outline-none focus:bg-card focus:border-border"
          >
            <option value="">{t('tasks.noProject')}</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        {error && <p className="text-[12px] text-danger">{error}</p>}
        <div className="flex items-center gap-3 pt-2">
          <Button type="button" className="flex-1 py-2.5 rounded-full bg-muted" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" className="flex-1" disabled={saving}>
            {saving ? t('common.loading') : t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
