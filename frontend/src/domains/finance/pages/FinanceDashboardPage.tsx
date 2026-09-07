import { useCallback, useEffect, useMemo, useState } from 'react'
import { toMessage } from '../../../shared/lib/apiClient'
import { fmtMoney } from '../../../shared/lib/format'
import { useT } from '../../../shared/i18n/TranslationContext'
import { Card, Field, Input, Select, Spinner } from '../../../shared/ui'
import { accountBalances, summary, totalBalance, trend } from '../api'
import { TrendChart } from '../components/TrendSparkline'

const TREND_UNITS = ['day', 'week', 'month'] as const
type TrendUnit = (typeof TREND_UNITS)[number]

function isoDate(date: Date): string {
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

function monthsAgo(count: number): string {
  const now = new Date()
  return isoDate(new Date(now.getFullYear(), now.getMonth() - count, 1))
}

function daysAgo(count: number): string {
  const date = new Date()
  date.setDate(date.getDate() - count)
  return isoDate(date)
}

function yearStart(): string {
  return isoDate(new Date(new Date().getFullYear(), 0, 1))
}

export function FinanceDashboardPage() {
  const t = useT()
  const today = useMemo(() => isoDate(new Date()), [])
  const [fromDate, setFromDate] = useState(() => daysAgo(30))
  const [toDate, setToDate] = useState(() => isoDate(new Date()))
  const [unit, setUnit] = useState<TrendUnit>('day')
  const [showIncome, setShowIncome] = useState(true)
  const [showExpense, setShowExpense] = useState(true)
  const [summaryData, setSummaryData] = useState({ income: '-', expense: '-', net: '-' })
  const [currencies, setCurrencies] = useState(0)
  const [currency, setCurrency] = useState('')
  const [points, setPoints] = useState<{ period: string; income: string | number; expense: string | number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (fromDate > toDate) {
      setError(t('finance.invalidDateRange'))
      setSummaryData({ income: '-', expense: '-', net: '-' })
      setPoints([])
      return
    }

    setLoading(true)
    setError(null)
    try {
      const [summaryRes, trendRes, balanceRes, accountRes] = await Promise.all([
        summary(fromDate, toDate),
        trend(fromDate, toDate, unit),
        totalBalance(),
        accountBalances(),
      ])
      setSummaryData({
        income: fmtMoney(summaryRes.totalIncome),
        expense: fmtMoney(summaryRes.totalExpense),
        net: fmtMoney(summaryRes.net),
      })
      setCurrencies(balanceRes.length)
      setCurrency(accountRes[0]?.currency ?? '')
      setPoints(trendRes)
    } catch (e) {
      setError(toMessage(e))
    } finally {
      setLoading(false)
    }
  }, [fromDate, t, toDate, unit])

  useEffect(() => {
    void load()
  }, [load])

  const series = [
    {
      key: 'income' as const,
      label: t('common.income'),
      color: 'var(--success)',
      visible: showIncome,
      onToggle: () => setShowIncome((value) => !value),
    },
    {
      key: 'expense' as const,
      label: t('common.expense'),
      color: 'var(--danger)',
      visible: showExpense,
      onToggle: () => setShowExpense((value) => !value),
    },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold leading-tight text-foreground">{t('finance.dashboardTitle')}</h1>
        <p className="text-[13px] text-muted-foreground mt-1">{t('finance.dashboardSubtitle')}</p>
      </div>

      <Card className="p-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Field label={t('finance.startDate')}>
            <Input
              type="date"
              value={fromDate}
              max={toDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </Field>
          <Field label={t('finance.endDate')}>
            <Input
              type="date"
              value={toDate}
              min={fromDate}
              max={today}
              onChange={(event) => setToDate(event.target.value)}
            />
          </Field>
          <Field label={t('finance.granularity')}>
            <Select value={unit} onChange={(event) => setUnit(event.target.value as TrendUnit)}>
              {TREND_UNITS.map((value) => (
                <option key={value} value={value}>{t(`finance.${value}`)}</option>
              ))}
            </Select>
          </Field>
          <Field label={t('finance.quickRange')}>
            <Select
              value={
                fromDate === daysAgo(30) && toDate === today ? '30d'
                  : fromDate === monthsAgo(0) && toDate === today ? 'mtd'
                  : fromDate === monthsAgo(2) && toDate === today ? '3m'
                  : fromDate === monthsAgo(5) && toDate === today ? '6m'
                  : fromDate === yearStart() && toDate === today ? 'ytd'
                  : 'custom'
              }
              onChange={(event) => {
                const value = event.target.value
                if (value === 'custom') return
                setFromDate(
                  value === '30d' ? daysAgo(30)
                    : value === 'mtd' ? monthsAgo(0)
                    : value === '3m' ? monthsAgo(2)
                    : value === '6m' ? monthsAgo(5)
                    : yearStart(),
                )
                setToDate(today)
              }}
            >
              <option value="30d">{t('finance.lastThirtyDays')}</option>
              <option value="mtd">{t('finance.monthToDate')}</option>
              <option value="3m">{t('finance.lastThreeMonths')}</option>
              <option value="6m">{t('finance.lastSixMonths')}</option>
              <option value="ytd">{t('finance.yearToDate')}</option>
              <option value="custom">{t('finance.customRange')}</option>
            </Select>
          </Field>
        </div>
      </Card>

      {error && <p className="text-[12px] text-danger">{error}</p>}

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: t('finance.periodIncome'), value: summaryData.income },
          { label: t('finance.periodExpense'), value: summaryData.expense },
          { label: t('finance.periodNet'), value: summaryData.net },
          { label: t('finance.currencies'), value: String(currencies) },
        ].map((card) => (
          <Card key={card.label} className="p-5">
            <p className="text-[11px] font-medium text-muted-foreground mb-1">{card.label}</p>
            <p className="text-[28px] font-semibold leading-none text-foreground">{card.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <p className="text-[15px] font-semibold text-foreground">{t('finance.trend')}</p>
            <p className="text-[12px] text-muted-foreground mt-1">
              {fromDate} → {toDate}
            </p>
          </div>
          {loading && <Spinner />}
        </div>
        <TrendChart points={points} series={series} currency={currency} />
      </Card>
    </div>
  )
}
