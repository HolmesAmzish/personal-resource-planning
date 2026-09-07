export type TaskStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED'

export const TASK_STATUSES: TaskStatus[] = ['PENDING', 'COMPLETED', 'CANCELLED']

export interface Project {
  id: number
  name: string
  orderIndex: number
  description?: string | null
  userId?: string
}

export interface Task {
  id: number
  userId?: string
  project?: Project | null
  title: string
  description?: string | null
  status?: TaskStatus
  createdAt?: string
  deadline?: string | null
}

export type { PageResponse } from '../../shared/types'
