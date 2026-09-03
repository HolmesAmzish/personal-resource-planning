export function fmtMoney(v: string | number | null | undefined, currency = ''): string {
  if (v === null || v === undefined || v === '') return '-'
  const n = typeof v === 'string' ? Number(v) : v
  if (Number.isNaN(n)) return String(v)
  const body = n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return currency ? `${body} ${currency}` : body
}

export function fmtDate(d: string | null | undefined): string {
  if (!d) return '-'
  return d.slice(0, 10)
}

export function fmtDateTime(d: string | null | undefined): string {
  if (!d) return '-'
  return d.replace('T', ' ').slice(0, 19)
}
