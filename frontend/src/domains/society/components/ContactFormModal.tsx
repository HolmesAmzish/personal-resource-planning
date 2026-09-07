import { useState } from 'react'
import { useT } from '../../../shared/i18n/TranslationContext'
import { Button, Field, Input, Modal } from '../../../shared/ui'
import { selectClass } from './PartyFormModal'
import type { Contact, ContactDto, ContactType, Party } from '../types'

const CONTACT_TYPES: ContactType[] = ['TELEPHONE', 'EMAIL']

export function ContactFormModal({
  parties,
  editing,
  onClose,
  onSubmit,
}: {
  parties: Party[]
  editing?: Contact | null
  onClose: () => void
  onSubmit: (body: ContactDto) => Promise<void>
}) {
  const t = useT()
  const [partyId, setPartyId] = useState<string>(String(editing?.partyId ?? ''))
  const [contactType, setContactType] = useState<ContactType>(editing?.contactType ?? 'TELEPHONE')
  const [content, setContent] = useState(editing?.content ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  return (
    <Modal title={editing ? t('society.editContact') : t('society.newContact')} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault()
          if (!partyId || !content.trim()) {
            setError(t('society.contactRequired'))
            return
          }
          setSaving(true)
          try {
            await onSubmit({ partyId: Number(partyId), contactType, content: content.trim() })
          } finally {
            setSaving(false)
          }
        }}
      >
        <Field label={t('society.party')}>
          <select value={partyId} onChange={(event) => setPartyId(event.target.value)} className={selectClass}>
            <option value="">{t('common.select')}</option>
            {parties.map((party) => (
              <option key={party.id} value={party.id}>
                {party.name}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('society.contactType')}>
            <select value={contactType} onChange={(event) => setContactType(event.target.value as ContactType)} className={selectClass}>
              {CONTACT_TYPES.map((value) => (
                <option key={value} value={value}>
                  {t(`society.${value}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('society.contactContent')}>
            <Input value={content} onChange={(event) => setContent(event.target.value)} maxLength={255} />
          </Field>
        </div>
        {error && <p className="text-[12px] text-danger">{error}</p>}
        <div className="flex gap-3 pt-2">
          <Button type="button" className="flex-1 rounded-full py-2.5 bg-muted" onClick={onClose} disabled={saving}>
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
