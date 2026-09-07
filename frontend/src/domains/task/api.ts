import { apiClient } from '../../shared/lib/apiClient'
import type { PageResponse } from '../../shared/types'
import type { Project, Task, TaskStatus } from './types'

export async function listTasks(params: { page: number; size: number; projectId?: number | null }): Promise<PageResponse<Task>> {
  const res = await apiClient.get('/task', { params: { page: params.page, size: params.size, projectId: params.projectId ?? undefined } })
  return res.data as PageResponse<Task>
}

export async function listDeadlineTasks(params: { page: number; size: number }): Promise<PageResponse<Task>> {
  const res = await apiClient.get('/task/deadline', { params })
  return res.data as PageResponse<Task>
}

export async function createTask(body: { title: string; description?: string; deadline?: string | null; projectId?: number | null }): Promise<Task> {
  const res = await apiClient.post('/task/add', {
    title: body.title,
    description: body.description,
    deadline: body.deadline,
    project: body.projectId ? { id: body.projectId } : null,
  })
  return res.data as Task
}

export async function changeTaskStatus(id: number, status: TaskStatus): Promise<Task> {
  const res = await apiClient.put(`/task/${id}/status`, JSON.stringify(status), {
    headers: { 'Content-Type': 'application/json' },
  })
  return res.data as Task
}

export async function updateTask(task: Task): Promise<Task> {
  const res = await apiClient.put('/task', task)
  return res.data as Task
}

export async function deleteTask(id: number): Promise<void> {
  await apiClient.delete(`/task/${id}`)
}

export async function listProjects(): Promise<Project[]> {
  const res = await apiClient.get('/project')
  return res.data as Project[]
}

export async function createProject(body: { name: string; description?: string }): Promise<Project> {
  const res = await apiClient.post('/project', body)
  return res.data as Project
}

export async function updateProject(body: Project): Promise<Project> {
  const res = await apiClient.put('/project', body)
  return res.data as Project
}

export async function moveProject(body: Project): Promise<Project> {
  const res = await apiClient.put('/project/updateOrder', body)
  return res.data as Project
}

export async function deleteProject(id: number): Promise<void> {
  await apiClient.delete(`/project/${id}`)
}
