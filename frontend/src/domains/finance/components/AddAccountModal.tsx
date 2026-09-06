import { useState } from 'react'
import { useT } from '../../../shared/i18n/TranslationContext'
import { Button, Field, Input, Modal } from '../../../shared/ui'
import type { AccountDto } from '../types'

const ACCOUNT_TYPES = ['CASH', 'BANK', 'EWALLET', 'CREDIT', 'OTHER']

export function AddAccountModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (account: AccountDto) => Promise<void>
}) {
  const t = useT()
  const [name, setName] = useState('')
  const [type, setType] = useState('CASH')
  const [currency, setCurrency] = useState('CNY')
  const [balance, setBalance] = useState('0')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  return (
    <Modal title={t('finance.newAccount')} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault()
          if (!name.trim()) {
            setError(t('finance.nameRequired'))
            return
          }

          setSaving(true)
          try {
            await onSubmit({
              name: name.trim(),
              type,
              currency: currency.trim().toUpperCase(),
              balance: balance === '' ? null : Number(balance),
              note: note.trim() || undefined,
            })
          } finally {
            setSaving(false)
          }
        }}
      >
        <Field label={t('finance.name')}>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t('finance.namePlaceholder')}
            maxLength={64}
            autoFocus
          />
        </Field>

        <Field label={t('finance.type')}>
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="w-full rounded-xl bg-muted border border-transparent px-3 py-2.5 text-[13px] text-foreground focus:outline-none focus:bg-card focus:border-border"
          >
            {ACCOUNT_TYPES.map((value) => (
              <option key={value} value={value}>
                {t(`finance.${value}`)}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t('finance.currency')}>
            <Input
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              placeholder="CNY"
              maxLength={3}
            />
          </Field>
          <Field label={t('finance.balance')}>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={balance}
              onChange={(event) => setBalance(event.target.value)}
            />
          </Field>
        </div>

        <Field label={t('finance.note')}>
          <Input value={note} onChange={(event) => setNote(event.target.value)} maxLength={255} />
        </Field>

        {error && <p className="text-[12px] text-danger">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            className="flex-1 py-2.5 rounded-full bg-muted"
            onClick={onClose}
            disabled={saving}
          >
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" className="flex-1" disabled={saving}>
            {t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
