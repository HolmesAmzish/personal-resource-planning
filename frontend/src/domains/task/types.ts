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
  isCompleted?: boolean
  createdAt?: string
  deadline?: string | null
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  last: boolean
  number: number
  size: number
}
