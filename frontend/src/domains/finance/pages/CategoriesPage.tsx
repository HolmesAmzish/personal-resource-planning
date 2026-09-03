import { useCallback, useEffect, useState } from 'react'
import { toMessage } from '../../../shared/lib/apiClient'
import { Badge, Button, Card, Empty, Spinner } from '../../../shared/ui'
import { deleteCategory, listCategories } from '../api'
import type { Category } from '../types'

export function CategoriesPage() {
  const [type, setType] = useState('')
  const [rows, setRows] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setRows(await listCategories(type || undefined))
    } catch (e) {
      setError(toMessage(e))
    } finally {
      setLoading(false)
    }
  }, [type])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold leading-tight text-foreground">Categories</h1>
        <p className="text-[13px] text-muted-foreground mt-1">System categories are read-only, custom ones can be managed.</p>
      </div>
      <Card className="p-4 flex flex-wrap gap-2">
        {[
          { value: '', label: 'All' },
          { value: 'INCOME', label: 'Income' },
          { value: 'EXPENSE', label: 'Expense' },
        ].map((t) => (
          <button
            key={t.value || 'all'}
            onClick={() => setType(t.value)}
            className={`px-2.5 py-1 rounded-full border text-[12px] font-medium transition-colors ${type === t.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/40'}`}
          >
            {t.label}
          </button>
        ))}
      </Card>
      {error && <p className="text-[12px] text-danger">{error}</p>}
      {loading ? (
        <div className="p-10 text-center">
          <Spinner />
        </div>
      ) : rows.length === 0 ? (
        <Empty message="No categories yet" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {rows.map((c) => (
            <Card key={c.id} className="p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-foreground truncate">{c.name}</div>
                <div className="text-[12px] text-muted-foreground truncate">
                  {c.type} · Order {c.sortOrder ?? '-'}
                </div>
              </div>
              {c.userId === null || c.userId === undefined ? (
                <Badge tone="neutral">System</Badge>
              ) : (
                <Button
                  variant="destructive"
                  title="Delete category"
                  aria-label={`Delete category ${c.name}`}
                  onClick={async () => {
                    await deleteCategory(c.id)
                    await load()
                  }}
                >
                  Delete
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
