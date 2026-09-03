import { useCallback, useEffect, useState } from 'react'
import { toMessage } from '../../../shared/lib/apiClient'
import { fmtMoney } from '../../../shared/lib/format'
import { usePage } from '../../../shared/hooks/usePage'
import { Badge, Button, Card, Empty, Spinner } from '../../../shared/ui'
import { deleteTransaction, listTransactions } from '../api'
import type { Transaction } from '../types'

export function TransactionsPage() {
  const { page, size, setPage } = usePage(20)
  const [type, setType] = useState('')
  const [rows, setRows] = useState<Transaction[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listTransactions({ type: type || undefined, page, size })
      setRows(res.content)
      setTotal(res.totalElements)
    } catch (e) {
      setError(toMessage(e))
    } finally {
      setLoading(false)
    }
  }, [page, size, type])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold leading-tight text-foreground">Transactions</h1>
        <p className="text-[13px] text-muted-foreground mt-1">{total} records, filter by type.</p>
      </div>
      <Card className="p-4 flex flex-wrap gap-2">
        {[
          { value: '', label: 'All' },
          { value: 'INCOME', label: 'Income' },
          { value: 'EXPENSE', label: 'Expense' },
          { value: 'TRANSFER', label: 'Transfer' },
        ].map((t) => (
          <button
            key={t.value || 'all'}
            onClick={() => {
              setType(t.value)
              setPage(0)
            }}
            className={`px-2.5 py-1 rounded-full border text-[12px] font-medium transition-colors ${type === t.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/40'}`}
          >
            {t.label}
          </button>
        ))}
      </Card>
      {error && <p className="text-[12px] text-danger">{error}</p>}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center">
            <Spinner />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-4">
            <Empty message="No transactions yet" />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {rows.map((t) => (
              <div key={t.id} className="px-6 py-4 flex flex-col md:grid md:grid-cols-12 gap-3 items-start md:items-center hover:bg-muted transition-colors">
                <div className="col-span-6 min-w-0 w-full">
                  <p className="text-[13px] font-medium text-foreground truncate">
                    {t.categoryName ?? t.note ?? `Transaction #${t.id}`}
                  </p>
                  <p className="text-[12px] text-muted-foreground mt-1">
                    {t.occurredOn} · {[t.fromAccountName, t.toAccountName].filter(Boolean).join(' → ') || '-'}
                  </p>
                </div>
                <div className="col-span-2">
                  <Badge tone={t.type === 'INCOME' ? 'success' : t.type === 'EXPENSE' ? 'danger' : 'neutral'}>{t.type}</Badge>
                </div>
                <p className="col-span-2 text-[13px] text-foreground">{fmtMoney(t.amount)}</p>
                <div className="col-span-2 flex md:justify-end">
                  <Button
                    variant="destructive"
                    title="Delete transaction"
                    aria-label={`Delete transaction ${t.id}`}
                    onClick={async () => {
                      await deleteTransaction(t.id)
                      await load()
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="px-6 py-3 border-t border-border flex items-center justify-between">
          <span className="text-[12px] text-muted-foreground">Page {page + 1}</span>
          <div className="flex gap-2">
            <Button disabled={page === 0} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <Button disabled={(page + 1) * size >= total} onClick={() => setPage(page + 1)}>
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
