import { useCallback, useEffect, useState } from 'react'
import { toMessage } from '../../../shared/lib/apiClient'
import { useT } from '../../../shared/i18n/TranslationContext'
import { usePage } from '../../../shared/hooks/usePage'
import { Badge, Button, Card, Empty, Spinner } from '../../../shared/ui'
import { hasNextPage } from '../../../shared/types'
import {
  changeTaskStatus,
  createProject,
  createTask,
  deleteTask,
  listProjects,
  listTasks,
  moveProject,
  updateTask,
} from '../api'
import type { Project, Task, TaskStatus } from '../types'
import { EditTaskModal, type TaskFormValue } from '../components/EditTaskModal'
import { ProjectSidebar } from '../components/ProjectSidebar'
import { TaskItem } from '../components/TaskItem'

export function TasksPage() {
  const t = useT()
  const { page, size, setPage } = usePage(20)
  const [projectId, setProjectId] = useState<number | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [total, setTotal] = useState(0)
  const [isLast, setIsLast] = useState(true)
  const [totalPages, setTotalPages] = useState(0)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const load = useCallback(async ({ background = false }: { background?: boolean } = {}) => {
    if (!background) {
      setLoading(true)
    }
    setError(null)
    try {
      const [taskPage, projectList] = await Promise.all([
        listTasks({ page, size, projectId }),
        listProjects(),
      ])
      setTasks(taskPage.content)
      setTotal(taskPage.total)
      setIsLast(taskPage.last)
      setTotalPages(taskPage.totalPages)
      setProjects(projectList)
    } catch (loadError) {
      setError(toMessage(loadError))
    } finally {
      setLoading(false)
    }
  }, [page, size, projectId])

  useEffect(() => {
    void load()
  }, [load])

  const handleSubmit = async (value: TaskFormValue) => {
    const taskValue = {
      title: value.title,
      description: value.description,
      deadline: value.deadline || null,
      projectId: value.projectId,
    }

    if (!editingTask) {
      await createTask(taskValue)
    } else {
      await updateTask({
        ...editingTask,
        title: taskValue.title,
        description: taskValue.description,
        deadline: taskValue.deadline,
        project: taskValue.projectId ? projects.find((p) => p.id === taskValue.projectId) ?? null : null,
      })
    }
    setModalOpen(false)
    setEditingTask(null)
    await load()
  }

  const handleDelete = async (task: Task) => {
    if (!window.confirm(t('tasks.deleteTaskConfirm'))) return
    await deleteTask(task.id)
    if (page > 0 && tasks.length === 1) {
      setPage(page - 1)
      return
    }
    await load()
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold leading-tight text-foreground">{t('tasks.title')}</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            {total} {t('tasks.subtitle')}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditingTask(null)
            setModalOpen(true)
          }}
        >
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
          onMove={async (draggedId, targetId) => {
            const dragged = projects.find((p) => p.id === draggedId)
            const target = projects.find((p) => p.id === targetId)
            if (!dragged || !target) return
            try {
              await moveProject({ ...dragged, orderIndex: target.orderIndex })
            } catch (moveError) {
              setError(toMessage(moveError))
            }
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
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onStatusChange={async (status: TaskStatus) => {
                    const previousStatus = task.status ?? 'PENDING'
                    setTasks((currentTasks) =>
                      currentTasks.map((item) => (item.id === task.id ? { ...item, status } : item)),
                    )
                    try {
                      const updatedTask = await changeTaskStatus(task.id, status)
                      setTasks((currentTasks) =>
                        currentTasks.map((item) => (item.id === task.id ? updatedTask : item)),
                      )
                      await load({ background: true })
                    } catch (statusError) {
                      setTasks((currentTasks) =>
                        currentTasks.map((item) =>
                          item.id === task.id ? { ...item, status: previousStatus } : item,
                        ),
                      )
                      setError(toMessage(statusError))
                    }
                  }}
                  onEdit={() => {
                    setEditingTask(task)
                    setModalOpen(true)
                  }}
                  onDelete={() => void handleDelete(task)}
                />
              ))}
            </div>
          )}
          <div className="px-6 py-3 border-t border-border flex items-center justify-between">
            <span className="text-[12px] text-muted-foreground">
              {t('common.page')} {page + 1}
            </span>
            <div className="flex gap-2">
              <Button disabled={loading || page === 0} onClick={() => setPage(page - 1)}>
                {t('common.previous')}
              </Button>
              <Button disabled={loading || !hasNextPage(page, totalPages, isLast)} onClick={() => setPage(page + 1)}>
                {t('common.next')}
              </Button>
            </div>
          </div>
        </Card>
      </div>
      {modalOpen && (
        <EditTaskModal
          key={editingTask?.id ?? 'new-task'}
          projects={projects}
          task={editingTask}
          onClose={() => {
            setModalOpen(false)
            setEditingTask(null)
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}
