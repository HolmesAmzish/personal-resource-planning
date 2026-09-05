import { useCallback, useEffect, useState } from 'react'
import { toMessage } from '../../../shared/lib/apiClient'
import { useT } from '../../../shared/i18n/TranslationContext'
import { usePage } from '../../../shared/hooks/usePage'
import { Badge, Button, Card, Empty, Spinner } from '../../../shared/ui'
import {
  createProject,
  createTask,
  deleteTask,
  listProjects,
  listTasks,
  changeTaskStatus,
} from '../api'
import type { Project, Task, TaskStatus } from '../types'
import { EditTaskModal } from '../components/EditTaskModal'
import { ProjectSidebar } from '../components/ProjectSidebar'
import { TaskItem } from '../components/TaskItem'

export function TasksPage() {
  const t = useT()
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
          <h1 className="text-[22px] font-semibold leading-tight text-foreground">{t('tasks.title')}</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            {total} {t('tasks.subtitle')}
          </p>
        </div>
        <Button variant="primary" onClick={() => setModal(true)}>
          {t('tasks.newTask')}
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
            <span className="text-[11px] font-medium text-muted-foreground">{t('tasks.taskList')}</span>
            <Badge>{total}</Badge>
          </div>
          {loading ? (
            <div className="p-10 flex justify-center">
              <Spinner />
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-4">
              <Empty message={t('tasks.empty')} />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {tasks.map((t) => (
                <TaskItem
                  key={t.id}
                  task={t}
                  onStatusChange={async (status: TaskStatus) => {
                    await changeTaskStatus(t.id, status)
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
<span className="text-[12px] text-muted-foreground">
            {t('common.page')} {page + 1}
          </span>
          <div className="flex gap-2">
            <Button disabled={page === 0} onClick={() => setPage(page - 1)}>
              {t('common.previous')}
            </Button>
            <Button disabled={(page + 1) * size >= total} onClick={() => setPage(page + 1)}>
              {t('common.next')}
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
