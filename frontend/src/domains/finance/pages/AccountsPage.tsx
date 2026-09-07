import { useCallback, useEffect, useState } from 'react'
import { toMessage } from '../../../shared/lib/apiClient'
import { fmtMoney } from '../../../shared/lib/format'
import { useT } from '../../../shared/i18n/TranslationContext'
import { usePage } from '../../../shared/hooks/usePage'
import { Badge, Button, Card, Empty, Spinner } from '../../../shared/ui'
import { hasNextPage } from '../../../shared/types'
import { createAccount, deleteAccount, listAccounts, totalBalance } from '../api'
import { AddAccountModal } from '../components/AddAccountModal'
import type { Account, CurrencyTotal } from '../types'

export function AccountsPage() {
  const t = useT()
  const { page, size, setPage } = usePage(20)
  const [rows, setRows] = useState<Account[]>([])
  const [total, setTotal] = useState(0)
  const [isLast, setIsLast] = useState(true)
  const [totals, setTotals] = useState<CurrencyTotal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [a, t] = await Promise.all([listAccounts({ page, size }), totalBalance()])
      setRows(a.content)
      setTotal(a.total)
      setIsLast(a.last)
      setTotals(t)
    } catch (e) {
      setError(toMessage(e))
    } finally {
      setLoading(false)
    }
  }, [page, size])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold leading-tight text-foreground">{t('finance.accountsTitle')}</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            {total} {t('finance.accountsSubtitle')}
          </p>
        </div>
        <Button variant="primary" onClick={() => setModal(true)}>
          {t('finance.newAccount')}
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {totals.map((t) => (
          <Badge key={t.currency}>
            {t.currency} {fmtMoney(t.total)}
          </Badge>
        ))}
      </div>
      {error && <p className="text-[12px] text-danger">{error}</p>}
      <Card className="overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-border bg-muted text-[11px] font-medium text-muted-foreground">
          <div className="col-span-5">{t('finance.name')}</div>
          <div className="col-span-3">{t('finance.type')}</div>
          <div className="col-span-2">{t('finance.balance')}</div>
          <div className="col-span-2 text-right">{t('finance.actions')}</div>
        </div>
        {loading ? (
          <div className="p-10 flex justify-center">
            <Spinner />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-4">
            <Empty
              message={t('finance.noAccounts')}
              action={(
                <Button variant="primary" onClick={() => setModal(true)}>
                  {t('finance.newAccount')}
                </Button>
              )}
            />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {rows.map((a) => (
              <div key={a.id} className="px-6 py-4 flex flex-col md:grid md:grid-cols-12 gap-3 items-start md:items-center hover:bg-muted transition-colors">
                <div className="col-span-5 min-w-0 w-full">
                  <p className="text-[13px] font-medium text-foreground truncate">{a.name}</p>
                  <p className="text-[12px] text-muted-foreground mt-1">{a.currency}</p>
                </div>
                <div className="col-span-3">
                  <Badge>{a.type}</Badge>
                </div>
                <p className="col-span-2 text-[13px] text-foreground">{fmtMoney(a.balance, a.currency)}</p>
                <div className="col-span-2 flex md:justify-end">
                  <Button
                    variant="destructive"
                    title={t('finance.deleteAccount')}
                    aria-label={`${t('finance.deleteAccount')} ${a.name}`}
                    onClick={async () => {
                      await deleteAccount(a.id)
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
            <Button disabled={loading || page === 0} onClick={() => setPage(page - 1)}>
              {t('common.previous')}
            </Button>
            <Button disabled={loading || !hasNextPage(page, Math.ceil(total / size), isLast)} onClick={() => setPage(page + 1)}>
              {t('common.next')}
            </Button>
          </div>
        </div>
      </Card>

      {modal && (
        <AddAccountModal
          onClose={() => setModal(false)}
          onSubmit={async (account) => {
            await createAccount(account)
            setModal(false)
            setPage(0)
            await load()
          }}
        />
      )}
    </div>
  )
}
