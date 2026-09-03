import { useState } from 'react'

export function usePage(initialSize = 20) {
  const [page, setPage] = useState(0)
  const [size] = useState(initialSize)
  return { page, size, setPage }
}
