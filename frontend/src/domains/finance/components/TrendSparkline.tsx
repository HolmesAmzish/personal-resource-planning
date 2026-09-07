import { useT } from '../../../shared/i18n/TranslationContext'
import { cn } from '../../../shared/lib/cn'

export interface TrendSeriesConfig {
  key: 'income' | 'expense'
  label: string
  color: string
  visible: boolean
  onToggle: () => void
}

export interface TrendChartPoint {
  period: string
  income: string | number
  expense: string | number
}

export function TrendChart({
  points,
  series,
  currency = '',
}: {
  points: TrendChartPoint[]
  series: TrendSeriesConfig[]
  currency?: string
}) {
  const t = useT()
  const active = series.filter((item) => item.visible)
  const width = 1000
  const height = 280
  const padding = { top: 18, right: 16, bottom: 34, left: 62 }
  const values = points.flatMap((point) => active.map((item) => Number(point[item.key] ?? 0)))
  const maxValue = Math.max(1, ...values)
  const stepValue = niceStep(maxValue / 4)
  const topValue = Math.ceil(maxValue / stepValue) * stepValue
  const innerWidth = width - padding.left - padding.right
  const innerHeight = height - padding.top - padding.bottom
  const x = (index: number) => padding.left + (groupWidth * index) + (groupWidth / 2)
  const y = (value: number) => padding.top + innerHeight - (value / topValue) * innerHeight
  const groupWidth = innerWidth / points.length
  const barWidth = Math.max(1.5, Math.min(36, (groupWidth * 0.7) / Math.max(1, active.length)))
  const barGap = Math.min(6, barWidth * 0.24)
  const barsTotalWidth = (barWidth * active.length) + (barGap * Math.max(0, active.length - 1))
  const xLabel = (index: number) => formatPeriodLabel(points[index]?.period ?? '', points.length)
  const yLabels = [0, 1, 2, 3, 4].map((step) => stepValue * step)

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {series.map((item) => {
          const total = points.reduce((sum, point) => sum + Number(point[item.key] ?? 0), 0)
          return (
            <button
              key={item.key}
              type="button"
              onClick={item.onToggle}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors',
                item.visible
                  ? 'border-border bg-card text-foreground hover:bg-muted'
                  : 'border-border bg-transparent text-muted-foreground hover:bg-muted/60',
              )}
              aria-pressed={item.visible}
            >
              <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: item.visible ? item.color : 'var(--muted-foreground)' }} />
              {item.label}
              <span className="text-muted-foreground">{fmtCompact(total)}</span>
            </button>
          )
        })}
      </div>

      {points.length === 0 ? (
        <div className="h-[220px] grid place-items-center text-[13px] text-muted-foreground">
          {t('finance.noTrendData')}
        </div>
      ) : (
        <div className="w-full overflow-hidden">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[220px] sm:h-[280px]" role="img" aria-label={t('finance.trend')}>
            {yLabels.map((value) => (
              <g key={value}>
                <line x1={padding.left} x2={width - padding.right} y1={y(value)} y2={y(value)} stroke="var(--border)" strokeOpacity={0.65} />
                <text x={padding.left - 10} y={y(value) + 4} textAnchor="end" fontSize="11" fill="var(--muted-foreground)">
                  {fmtCompact(value)}
                </text>
              </g>
            ))}

            {points.map((point, index) => {
              const groupStart = x(index) - (barsTotalWidth / 2)
              return active.map((item, seriesIndex) => {
                const value = Number(point[item.key] ?? 0)
                const barHeight = Math.max(value > 0 ? 2 : 0, value / topValue * innerHeight)
                return (
                  <rect
                    key={`${point.period}-${item.key}`}
                    x={groupStart + (seriesIndex * (barWidth + barGap))}
                    y={y(value)}
                    width={barWidth}
                    height={barHeight}
                    rx={Math.min(2, barWidth / 2)}
                    fill={item.color}
                    fillOpacity={0.88}
                  >
                    <title>{`${xLabel(index)} · ${item.label}: ${value.toLocaleString()}${currency ? ` ${currency}` : ''}`}</title>
                  </rect>
                )
              })
            })}

            {[
              ['first', 0],
              ['middle', Math.floor((points.length - 1) / 2)],
              ['last', points.length - 1],
            ].map(([key, index]) => (
              <text
                key={key}
                x={x(index as number)}
                y={height - 10}
                textAnchor={index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle'}
                fontSize="11"
                fill="var(--muted-foreground)"
              >
                {xLabel(index as number)}
              </text>
            ))}
          </svg>
        </div>
      )}
    </div>
  )
}

function niceStep(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const normalized = value / magnitude
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
  return step * magnitude
}

function fmtCompact(value: number): string {
  return Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

function formatPeriodLabel(period: string, pointCount: number): string {
  if (period.length >= 10 && pointCount > 1) {
    const date = new Date(`${period.slice(0, 10)}T00:00:00`)
    if (!Number.isNaN(date.getTime())) {
      const options: Intl.DateTimeFormatOptions = pointCount > 60
        ? { month: 'short', year: '2-digit' }
        : { month: 'short', day: 'numeric' }
      return Intl.DateTimeFormat('en', options).format(date)
    }
  }
  return period
}

export function TrendSparkline({ points }: { points: TrendChartPoint[] }) {
  const t = useT()
  return (
    <TrendChart
      points={points}
      series={[
        { key: 'income', label: t('common.income'), color: 'var(--success)', visible: true, onToggle: () => undefined },
        { key: 'expense', label: t('common.expense'), color: 'var(--danger)', visible: true, onToggle: () => undefined },
      ]}
    />
  )
}
