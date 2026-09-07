import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import { X } from 'lucide-react'
import { useT } from './i18n/TranslationContext'
import { cn } from './lib/cn'

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'bg-card text-card-foreground rounded-[var(--radius)] border border-border',
        'shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] dark:shadow-none',
        className,
      )}
    >
      {children}
    </div>
  )
}

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'destructive'

export function Button({
  variant = 'secondary',
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 text-[13px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
        variant === 'primary' && 'px-4 py-2.5 rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
        variant === 'secondary' && 'px-4 py-2.5 rounded-xl bg-card border border-border text-foreground hover:bg-muted',
        variant === 'danger' && 'px-4 py-2.5 rounded-full bg-danger text-white hover:bg-danger/90',
        variant === 'ghost' && 'p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground',
        variant === 'destructive' && 'p-2 rounded-lg text-muted-foreground hover:bg-danger/10 hover:text-danger',
        className,
      )}
      {...rest}
    />
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-medium text-muted-foreground mb-2">{label}</span>
      {children}
    </label>
  )
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-xl bg-muted border border-transparent px-3 py-2.5 text-[13px] text-foreground',
        'placeholder:text-muted-foreground focus:outline-none focus:bg-card focus:border-border',
        className,
      )}
      {...rest}
    />
  )
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select
      className={cn(
        'w-full rounded-xl bg-muted border border-transparent px-3 py-2.5 text-[13px] text-foreground',
        'focus:outline-none focus:bg-card focus:border-border',
        className,
      )}
      {...rest}
    >
      {children}
    </select>
  )
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const t = useT()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
          <button aria-label={t('common.close')} onClick={onClose} className="p-1.5 rounded-full text-muted-foreground hover:bg-muted">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Badge({ tone = 'neutral', children }: { tone?: 'neutral' | 'success' | 'warning' | 'danger'; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium',
        tone === 'neutral' && 'bg-muted text-muted-foreground',
        tone === 'success' && 'border border-success/25 bg-success/10 text-success',
        tone === 'warning' && 'border border-warning/25 bg-warning/10 text-warning',
        tone === 'danger' && 'border border-danger/25 bg-danger/10 text-danger',
      )}
    >
      {children}
    </span>
  )
}

export function Empty({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div className="p-10 text-center rounded-[var(--radius)] border border-border bg-card">
      <p className="text-[13px] text-muted-foreground mb-3">{message}</p>
      {action}
    </div>
  )
}

export function Spinner() {
  const t = useT()
  return <div className="w-8 h-8 rounded-full border-2 border-border border-t-primary animate-spin" role="status" aria-label={t('common.loading')} />
}
