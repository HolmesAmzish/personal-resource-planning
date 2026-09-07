import { useCallback, useEffect, useState } from 'react'
import { toMessage } from '../../../shared/lib/apiClient'
import { fmtMoney } from '../../../shared/lib/format'
import { useT } from '../../../shared/i18n/TranslationContext'
import { usePage } from '../../../shared/hooks/usePage'
import { Badge, Button, Card, Empty, Field, Input, Select, Spinner } from '../../../shared/ui'
import { hasNextPage } from '../../../shared/types'
import { createTransaction, deleteTransaction, listAccounts, listCategories, listTransactions } from '../api'
import { AddTransactionModal } from '../components/AddTransactionModal'
import type { Account, Category, Transaction } from '../types'

export function TransactionsPage() {
  const t = useT()
  const { page, size, setPage } = usePage(20)
  const [type, setType] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [accountId, setAccountId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [rows, setRows] = useState<Transaction[]>([])
  const [total, setTotal] = useState(0)
  const [isLast, setIsLast] = useState(true)
  const [loading, setLoading] = useState(true)
  const [optionsLoading, setOptionsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (fromDate && toDate && fromDate > toDate) {
        throw new Error(t('finance.invalidDateRange'))
      }
      const res = await listTransactions({
        type: type || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
        accountId: accountId ? Number(accountId) : undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
        page,
        size,
      })
      setRows(res.content)
      setTotal(res.total)
      setIsLast(res.last)
    } catch (e) {
      setError(toMessage(e))
    } finally {
      setLoading(false)
    }
  }, [accountId, categoryId, fromDate, page, size, t, toDate, type])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    let cancelled = false
    async function loadOptions() {
      setOptionsLoading(true)
      try {
        const [accountPage, categoryRows] = await Promise.all([
          listAccounts({ page: 0, size: 100 }),
          listCategories(type || undefined),
        ])
        if (cancelled) return
        setAccounts(accountPage.content)
        setCategories(categoryRows)
      } catch (e) {
        if (!cancelled) setError(toMessage(e))
      } finally {
        if (!cancelled) setOptionsLoading(false)
      }
    }

    void loadOptions()
    return () => {
      cancelled = true
    }
  }, [type])

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

      <Card className="p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {[
            { value: '', label: t('common.all') },
            { value: 'INCOME', label: t('common.income') },
            { value: 'EXPENSE', label: t('common.expense') },
            { value: 'TRANSFER', label: t('common.transfer') },
          ].map((item) => (
            <button
              key={item.value || 'all'}
              onClick={() => {
                setType(item.value)
                setCategoryId('')
                setPage(0)
              }}
              className={`px-2.5 py-1 rounded-full border text-[12px] font-medium transition-colors ${type === item.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/40'}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="grid gap-3 pt-4 border-t border-border sm:grid-cols-2 xl:grid-cols-4">
          <Field label={t('finance.startDate')}>
            <Input
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(event) => {
                setFromDate(event.target.value)
                setPage(0)
              }}
            />
          </Field>
          <Field label={t('finance.endDate')}>
            <Input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(event) => {
                setToDate(event.target.value)
                setPage(0)
              }}
            />
          </Field>
          <Field label={t('finance.account')}>
            <Select
              value={accountId}
              onChange={(event) => {
                setAccountId(event.target.value)
                setPage(0)
              }}
            >
              <option value="">{t('finance.allAccounts')}</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>{account.name}</option>
              ))}
            </Select>
          </Field>
          <Field label={t('finance.category')}>
            <Select
              value={categoryId}
              disabled={optionsLoading || type === 'TRANSFER'}
              onChange={(event) => {
                setCategoryId(event.target.value)
                setPage(0)
              }}
            >
              <option value="">{t('finance.allCategories')}</option>
              {categories
                .filter((category) => !type || category.type === type)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} · {t(`common.${category.type.toLowerCase()}`)}
                  </option>
                ))}
            </Select>
          </Field>
        </div>
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
            {rows.map((row) => (
              <div key={row.id} className="px-6 py-4 flex flex-col md:grid md:grid-cols-12 gap-3 items-start md:items-center hover:bg-muted transition-colors">
                <div className="col-span-6 min-w-0 w-full">
                  <p className="text-[13px] font-medium text-foreground truncate">
                    {row.categoryName ?? row.note ?? `${t('finance.transactionNo')} #${row.id}`}
                  </p>
                  <p className="text-[12px] text-muted-foreground mt-1">
                    {row.occurredOn} · {[row.fromAccountName, row.toAccountName].filter(Boolean).join(' → ') || '-'}
                  </p>
                </div>
                <div className="col-span-2">
                  <Badge tone={row.type === 'INCOME' ? 'success' : row.type === 'EXPENSE' ? 'danger' : 'neutral'}>{row.type}</Badge>
                </div>
                <p className="col-span-2 text-[13px] text-foreground">{fmtMoney(row.amount)}</p>
                <div className="col-span-2 flex md:justify-end">
                  <Button
                    variant="destructive"
                    title={t('finance.deleteTransaction')}
                    aria-label={`${t('finance.deleteTransaction')} ${row.id}`}
                    onClick={async () => {
                      try {
                        await deleteTransaction(row.id)
                        await load()
                      } catch (e) {
                        setError(toMessage(e))
                      }
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
