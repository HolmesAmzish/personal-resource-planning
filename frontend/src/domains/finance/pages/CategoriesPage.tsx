import { useCallback, useEffect, useState } from 'react'
import { toMessage } from '../../../shared/lib/apiClient'
import { useT } from '../../../shared/i18n/TranslationContext'
import { Badge, Button, Card, Empty, Spinner } from '../../../shared/ui'
import { deleteCategory, listCategories } from '../api'
import type { Category } from '../types'

export function CategoriesPage() {
  const t = useT()
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
        <h1 className="text-[22px] font-semibold leading-tight text-foreground">{t('finance.categoriesTitle')}</h1>
        <p className="text-[13px] text-muted-foreground mt-1">{t('finance.categoriesSubtitle')}</p>
      </div>
      <Card className="p-4 flex flex-wrap gap-2">
        {[
          { value: '', label: t('common.all') },
          { value: 'INCOME', label: t('common.income') },
          { value: 'EXPENSE', label: t('common.expense') },
        ].map((c2) => (
          <button
            key={c2.value || 'all'}
            onClick={() => setType(c2.value)}
            className={`px-2.5 py-1 rounded-full border text-[12px] font-medium transition-colors ${type === c2.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/40'}`}
          >
            {c2.label}
          </button>
        ))}
      </Card>
      {error && <p className="text-[12px] text-danger">{error}</p>}
      {loading ? (
        <div className="p-10 text-center">
          <Spinner />
        </div>
      ) : rows.length === 0 ? (
        <Empty message={t('finance.noCategories')} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {rows.map((c) => (
            <Card key={c.id} className="p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-foreground truncate">{c.name}</div>
                <div className="text-[12px] text-muted-foreground truncate">
                  {c.type} · {t('finance.order')} {c.sortOrder ?? '-'}
                </div>
              </div>
              {c.userId === null || c.userId === undefined ? (
                <Badge tone="neutral">{t('common.system')}</Badge>
              ) : (
                <Button
                  variant="destructive"
                  title={t('finance.deleteCategory')}
                  aria-label={`${t('finance.deleteCategory')} ${c.name}`}
                  onClick={async () => {
                    await deleteCategory(c.id)
                    await load()
                  }}
                >
                  {t('common.delete')}
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
