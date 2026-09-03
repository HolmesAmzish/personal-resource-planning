import { useEffect, useState } from 'react'
import { fmtMoney } from '../../../shared/lib/format'
import { Card } from '../../../shared/ui'
import { accountBalances, summary, totalBalance, trend } from '../api'
import { TrendSparkline } from '../components/TrendSparkline'

export function FinanceDashboardPage() {
  const [net, setNet] = useState('-')
  const [income, setIncome] = useState('-')
  const [expense, setExpense] = useState('-')
  const [currencies, setCurrencies] = useState(0)
  const [points, setPoints] = useState<{ income: string | number; expense: string | number }[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [s, t, b] = await Promise.all([
        summary('2026-01-01', '2026-12-31'),
        trend('2026-09-01', '2026-09-30', 'day'),
        Promise.all([totalBalance(), accountBalances()]),
      ])
      if (cancelled) return
      setIncome(fmtMoney(s.totalIncome))
      setExpense(fmtMoney(s.totalExpense))
      setNet(fmtMoney(s.net))
      setCurrencies(b[0].length)
      setPoints(t)
    }
    void load().catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold leading-tight text-foreground">Finance dashboard</h1>
        <p className="text-[13px] text-muted-foreground mt-1">Income, accounts, and trend at a glance.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Yearly income', value: income },
          { label: 'Yearly expense', value: expense },
          { label: 'Yearly net', value: net },
          { label: 'Currencies', value: String(currencies) },
        ].map((c) => (
          <Card key={c.label} className="p-5">
            <p className="text-[11px] font-medium text-muted-foreground mb-1">{c.label}</p>
            <p className="text-[28px] font-semibold leading-none text-foreground">{c.value}</p>
          </Card>
        ))}
      </div>
      <Card className="p-5">
        <p className="text-[13px] font-semibold text-foreground mb-3">September trend</p>
        <TrendSparkline points={points} />
      </Card>
    </div>
  )
}
