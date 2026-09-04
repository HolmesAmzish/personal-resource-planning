import { useEffect, useState } from 'react'
import { toMessage } from '../../../shared/lib/apiClient'
import { fmtMoney } from '../../../shared/lib/format'
import { useT } from '../../../shared/i18n/TranslationContext'
import { Card, Spinner } from '../../../shared/ui'
import { accountBalances, summary, trend } from '../api'
import type { AccountBalance, Summary, TrendPoint } from '../types'
import { TrendSparkline } from '../components/TrendSparkline'

export function StatisticsPage() {
  const t = useT()
  const [data, setData] = useState<Summary | null>(null)
  const [points, setPoints] = useState<TrendPoint[]>([])
  const [balances, setBalances] = useState<AccountBalance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [s, t, b] = await Promise.all([
          summary('2026-01-01', '2026-12-31'),
          trend('2026-09-01', '2026-09-30', 'day'),
          accountBalances(),
        ])
        if (cancelled) return
        setData(s)
        setPoints(t)
        setBalances(b)
      } catch (e) {
        if (!cancelled) setError(toMessage(e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="p-10 text-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold leading-tight text-foreground">{t('finance.statisticsTitle')}</h1>
        <p className="text-[13px] text-muted-foreground mt-1">{t('finance.statisticsSubtitle')}</p>
      </div>
      {error && <p className="text-[12px] text-danger">{error}</p>}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: t('finance.totalIncome'), value: fmtMoney(data?.totalIncome ?? '-') },
          { label: t('finance.totalExpense'), value: fmtMoney(data?.totalExpense ?? '-') },
          { label: t('common.net'), value: fmtMoney(data?.net ?? '-') },
        ].map((c) => (
          <Card key={c.label} className="p-5">
            <p className="text-[11px] font-medium text-muted-foreground mb-1">{c.label}</p>
            <p className="text-[28px] font-semibold leading-none text-foreground">{c.value}</p>
          </Card>
        ))}
      </div>
      <Card className="p-5">
        <p className="text-[13px] font-semibold text-foreground mb-3">{t('finance.septemberTrend')}</p>
        <TrendSparkline points={points} />
      </Card>
      <Card className="overflow-hidden">
        <div className="px-6 py-3 border-b border-border bg-muted text-[11px] font-medium text-muted-foreground">{t('finance.accountBalances')}</div>
        <div className="divide-y divide-border">
          {balances.map((b) => (
            <div key={b.accountId} className="px-6 py-4 flex items-center justify-between hover:bg-muted transition-colors">
              <p className="text-[13px] font-medium text-foreground truncate">{b.accountName}</p>
              <p className="text-[13px] text-foreground">{fmtMoney(b.balance, b.currency)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
