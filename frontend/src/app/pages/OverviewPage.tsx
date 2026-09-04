import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiClient, toMessage } from '../../shared/lib/apiClient'
import { useT } from '../../shared/i18n/TranslationContext'
import { Card } from '../../shared/ui'

interface Summary {
  totalIncome: string | number
  totalExpense: string | number
}

export function OverviewPage() {
  const t = useT()
  const [openTasks, setOpenTasks] = useState<number | null>(null)
  const [accounts, setAccounts] = useState<number | null>(null)
  const [monthNet, setMonthNet] = useState<string>('-')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [tasks, accs, summary] = await Promise.all([
          apiClient.get('/task', { params: { page: 0, size: 1 } }),
          apiClient.get('/accounts', { params: { page: 0, size: 1 } }),
          apiClient.get<Summary>('/statistics/summary', { params: { from: '2026-01-01', to: '2026-12-31' } }),
        ])
        if (cancelled) return
        setOpenTasks(tasks.data.totalElements ?? null)
        setAccounts(accs.data.totalElements ?? null)
        const income = Number(summary.data.totalIncome ?? 0)
        const expense = Number(summary.data.totalExpense ?? 0)
        setMonthNet((income - expense).toLocaleString('en-US', { minimumFractionDigits: 2 }))
      } catch (e) {
        if (!cancelled) setError(toMessage(e))
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const cards = [
    { label: t('overview.totalTasks'), value: openTasks === null ? '-' : String(openTasks), to: '/tasks' },
    { label: t('overview.totalAccounts'), value: accounts === null ? '-' : String(accounts), to: '/finance/accounts' },
    { label: t('overview.yearlyNet'), value: monthNet, to: '/finance/statistics' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold leading-tight text-foreground">{t('overview.title')}</h1>
        <p className="text-[13px] text-muted-foreground mt-1">{t('overview.subtitle')}</p>
      </div>
      {error && <p className="text-[12px] text-danger">{error}</p>}
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} to={c.to}>
            <Card className="p-5">
              <p className="text-[11px] font-medium text-muted-foreground mb-1">{c.label}</p>
              <p className="text-[28px] font-semibold leading-none text-foreground">{c.value}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
