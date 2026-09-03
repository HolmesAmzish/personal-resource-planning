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
    <Modal title="New task" onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          if (!title.trim()) {
            setError('Title is required')
            return
          }
          onSubmit({ title: title.trim(), description, deadline: deadline || '', projectId: projectId ? Number(projectId) : null })
        }}
      >
        <Field label="Title">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What to do" />
        </Field>
        <Field label="Description">
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details (optional)" />
        </Field>
        <Field label="Deadline">
          <Input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </Field>
        <Field label="Project">
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full rounded-xl bg-muted border border-transparent px-3 py-2.5 text-[13px] text-foreground focus:outline-none focus:bg-card focus:border-border"
          >
            <option value="">No project</option>
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
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            Save
          </Button>
        </div>
      </form>
    </Modal>
  )
}
