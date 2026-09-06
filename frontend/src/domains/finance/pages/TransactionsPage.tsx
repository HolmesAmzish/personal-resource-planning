import { useCallback, useEffect, useState } from 'react'
import { toMessage } from '../../../shared/lib/apiClient'
import { fmtMoney } from '../../../shared/lib/format'
import { useT } from '../../../shared/i18n/TranslationContext'
import { usePage } from '../../../shared/hooks/usePage'
import { Badge, Button, Card, Empty, Spinner } from '../../../shared/ui'
import { createTransaction, deleteTransaction, listTransactions } from '../api'
import { AddTransactionModal } from '../components/AddTransactionModal'
import type { Transaction } from '../types'

export function TransactionsPage() {
  const t = useT()
  const { page, size, setPage } = usePage(20)
  const [type, setType] = useState('')
  const [rows, setRows] = useState<Transaction[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState(false)

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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold leading-tight text-foreground">{t('finance.transactionsTitle')}</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            {total} {t('finance.transactionsSubtitle')}
          </p>
        </div>
        <Button variant="primary" onClick={() => setModal(true)}>
          {t('finance.newTransaction')}
        </Button>
      </div>
      <Card className="p-4 flex flex-wrap gap-2">
        {[
          { value: '', label: t('common.all') },
          { value: 'INCOME', label: t('common.income') },
          { value: 'EXPENSE', label: t('common.expense') },
          { value: 'TRANSFER', label: t('common.transfer') },
        ].map((t2) => (
          <button
            key={t2.value || 'all'}
            onClick={() => {
              setType(t2.value)
              setPage(0)
            }}
            className={`px-2.5 py-1 rounded-full border text-[12px] font-medium transition-colors ${type === t2.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/40'}`}
          >
            {t2.label}
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
            <Empty
              message={t('finance.noTransactions')}
              action={(
                <Button variant="primary" onClick={() => setModal(true)}>
                  {t('finance.newTransaction')}
                </Button>
              )}
            />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {rows.map((r) => (
              <div key={r.id} className="px-6 py-4 flex flex-col md:grid md:grid-cols-12 gap-3 items-start md:items-center hover:bg-muted transition-colors">
                <div className="col-span-6 min-w-0 w-full">
                  <p className="text-[13px] font-medium text-foreground truncate">
                    {r.categoryName ?? r.note ?? `${t('finance.transactionNo')} #${r.id}`}
                  </p>
                  <p className="text-[12px] text-muted-foreground mt-1">
                    {r.occurredOn} · {[r.fromAccountName, r.toAccountName].filter(Boolean).join(' → ') || '-'}
                  </p>
                </div>
                <div className="col-span-2">
                  <Badge tone={r.type === 'INCOME' ? 'success' : r.type === 'EXPENSE' ? 'danger' : 'neutral'}>{r.type}</Badge>
                </div>
                <p className="col-span-2 text-[13px] text-foreground">{fmtMoney(r.amount)}</p>
                <div className="col-span-2 flex md:justify-end">
                  <Button
                    variant="destructive"
                    title={t('finance.deleteTransaction')}
                    aria-label={`${t('finance.deleteTransaction')} ${r.id}`}
                    onClick={async () => {
                      await deleteTransaction(r.id)
                      await load()
                    }}
                  >
                    {t('common.delete')}
                  </Button>
                </div>
              </div>
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

      {modal && (
        <AddTransactionModal
          onClose={() => setModal(false)}
          onSubmit={async (transaction) => {
            await createTransaction(transaction)
            setModal(false)
            setPage(0)
            await load()
          }}
        />
      )}
    </div>
  )
}
