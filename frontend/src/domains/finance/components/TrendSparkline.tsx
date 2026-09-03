export function TrendSparkline({ points }: { points: { income: string | number; expense: string | number }[] }) {
  const vals = points.map((p) => Number(p.income) + Number(p.expense))
  const max = Math.max(1, ...vals)
  const d = vals.map((v, i) => `${(i / Math.max(1, vals.length - 1)) * 100},${100 - (v / max) * 90}`).join(' ')
  return (
    <svg viewBox="0 0 100 100" className="w-full h-16" preserveAspectRatio="none" aria-label="Trend">
      <polyline points={d} fill="none" stroke="var(--primary)" strokeWidth="2" />
    </svg>
  )
}
