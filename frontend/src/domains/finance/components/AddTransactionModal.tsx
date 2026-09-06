import { useEffect, useMemo, useState } from 'react'
import { toMessage } from '../../../shared/lib/apiClient'
import { useT } from '../../../shared/i18n/TranslationContext'
import { Button, Field, Input, Modal } from '../../../shared/ui'
import { listAccounts, listCategories } from '../api'
import type { Account, Category, TransactionDto } from '../types'

const TRANSACTION_TYPES = ['EXPENSE', 'INCOME', 'TRANSFER'] as const
type ModalTransactionType = (typeof TRANSACTION_TYPES)[number]

export function AddTransactionModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (transaction: TransactionDto) => Promise<void>
}) {
  const t = useT()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [type, setType] = useState<ModalTransactionType>('EXPENSE')
  const [amount, setAmount] = useState('')
  const [occurredOn, setOccurredOn] = useState(() => new Date().toLocaleDateString('en-CA'))
  const [fromAccountId, setFromAccountId] = useState('')
  const [toAccountId, setToAccountId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [note, setNote] = useState('')

  const showFromAccount = type === 'EXPENSE' || type === 'TRANSFER'
  const showToAccount = type === 'INCOME' || type === 'TRANSFER'
  const showCategory = type === 'EXPENSE' || type === 'INCOME'

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === type),
    [categories, type],
  )

  useEffect(() => {
    let cancelled = false
    const loadOptions = async () => {
      setLoadingOptions(true)
      setError(null)
      try {
        const [accountPage, categoryRows] = await Promise.all([
          listAccounts({ page: 0, size: 100 }),
          listCategories(),
        ])
        if (!cancelled) {
          setAccounts(accountPage.content)
          setCategories(categoryRows)
        }
      } catch (e) {
        if (!cancelled) setError(toMessage(e))
      } finally {
        if (!cancelled) setLoadingOptions(false)
      }
    }

    void loadOptions()
    return () => {
      cancelled = true
    }
  }, [])

  const selectClass = 'w-full rounded-xl bg-muted border border-transparent px-3 py-2.5 text-[13px] text-foreground focus:outline-none focus:bg-card focus:border-border'

  return (
    <Modal title={t('finance.newTransaction')} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault()

          if (!amount.trim() || Number(amount) <= 0) {
            setError(t('finance.amountRequired'))
            return
          }
          if ((showFromAccount && !fromAccountId) || (showToAccount && !toAccountId)) {
            setError(t('finance.accountRequired'))
            return
          }

          const body: TransactionDto = {
            type,
            amount: Number(amount),
            occurredOn,
            fromAccountId: showFromAccount && fromAccountId ? Number(fromAccountId) : null,
            toAccountId: showToAccount && toAccountId ? Number(toAccountId) : null,
            categoryId: showCategory && categoryId ? Number(categoryId) : null,
            note: note.trim() || undefined,
          }

          setSaving(true)
          try {
            await onSubmit(body)
          } catch (e) {
            setError(toMessage(e))
          } finally {
            setSaving(false)
          }
        }}
      >
        {loadingOptions ? (
          <p className="text-[13px] text-muted-foreground">{t('common.loading')}</p>
        ) : (
          <>
            <Field label={t('finance.type')}>
              <select
                value={type}
                onChange={(event) => {
                  const nextType = event.target.value as ModalTransactionType
                  setType(nextType)
                  setCategoryId('')
                }}
                className={selectClass}
              >
                {TRANSACTION_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {t(`common.${value.toLowerCase()}`)}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label={t('finance.amount')}>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  autoFocus
                />
              </Field>
              <Field label={t('finance.date')}>
                <Input
                  type="date"
                  value={occurredOn}
                  onChange={(event) => setOccurredOn(event.target.value)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {showFromAccount && (
                <Field label={t('finance.fromAccount')}>
                  <select
                    value={fromAccountId}
                    onChange={(event) => setFromAccountId(event.target.value)}
                    className={selectClass}
                  >
                    <option value="">{t('common.select')}</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                </Field>
              )}

              {showToAccount && (
                <Field label={t('finance.toAccount')}>
                  <select
                    value={toAccountId}
                    onChange={(event) => setToAccountId(event.target.value)}
                    className={selectClass}
                  >
                    <option value="">{t('common.select')}</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
            </div>

            {showCategory && (
              <Field label={t('finance.category')}>
                <select
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                  className={selectClass}
                >
                  <option value="">{t('finance.noCategory')}</option>
                  {filteredCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <Field label={t('finance.note')}>
              <Input
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={255}
              />
            </Field>
          </>
        )}

        {error && <p className="text-[12px] text-danger">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={saving || loadingOptions}>
            {t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
