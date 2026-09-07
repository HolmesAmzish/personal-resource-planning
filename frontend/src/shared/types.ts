export interface PageResponse<T> {
  content: T[]
  total: number
  page: number
  size: number
  totalPages: number
  last: boolean
}

export function hasNextPage(page: number, totalPages: number, isLast: boolean): boolean {
  return page >= 0 && !isLast && page + 1 < totalPages
}
