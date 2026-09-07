import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useT } from '../../../shared/i18n/TranslationContext'
import { Button, Field, Input, Modal } from '../../../shared/ui'
import type { ContactDto, Party, PartyDto, PartyType } from '../types'

const PARTY_TYPES: PartyType[] = ['PERSON', 'ORGANIZATION']
const CONTACT_TYPES: ContactDto['contactType'][] = ['TELEPHONE', 'EMAIL']

export function PartyFormModal({
  editing,
  onClose,
  onSubmit,
}: {
  editing?: Party | null
  onClose: () => void
  onSubmit: (body: PartyDto) => Promise<void>
}) {
  const t = useT()
  const [partyType, setPartyType] = useState<PartyType>(editing?.partyType ?? 'PERSON')
  const [name, setName] = useState(editing?.name ?? '')
  const [identityCode, setIdentityCode] = useState(editing?.identityCode ?? '')
  const [address, setAddress] = useState(editing?.address ?? '')
  const [gender, setGender] = useState(editing?.gender ?? '')
  const [birthDate, setBirthDate] = useState(editing?.birthDate ?? '')
  const [website, setWebsite] = useState(editing?.website ?? '')
  const [contacts, setContacts] = useState<ContactDto[]>(
    (editing?.contacts ?? []).map(({ contactType, content }) => ({ contactType, content })),
  )
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const updateContact = (index: number, patch: Partial<ContactDto>) => {
    setContacts((old) => old.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  return (
    <Modal title={editing ? t('society.editParty') : t('society.newParty')} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault()
          if (!name.trim()) {
            setError(t('society.nameRequired'))
            return
          }
          setSaving(true)
          try {
            await onSubmit({
              partyType,
              name: name.trim(),
              identityCode: identityCode.trim() || undefined,
              address: address.trim() || undefined,
              gender: partyType === 'PERSON' ? gender.trim() || undefined : undefined,
              birthDate: partyType === 'PERSON' ? birthDate || undefined : undefined,
              website: partyType === 'ORGANIZATION' ? website.trim() || undefined : undefined,
              contacts,
            })
          } finally {
            setSaving(false)
          }
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('society.partyType')}>
            <select
              value={partyType}
              disabled={!!editing}
              onChange={(event) => setPartyType(event.target.value as PartyType)}
              className={selectClass}
            >
              {PARTY_TYPES.map((value) => (
                <option key={value} value={value}>
                  {t(`society.${value}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('society.name')}>
            <Input value={name} onChange={(event) => setName(event.target.value)} maxLength={128} autoFocus />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t('society.identityCode')}>
            <Input value={identityCode} onChange={(event) => setIdentityCode(event.target.value)} maxLength={64} />
          </Field>
          <Field label={t('society.address')}>
            <Input value={address} onChange={(event) => setAddress(event.target.value)} maxLength={255} />
          </Field>
        </div>

        {partyType === 'PERSON' ? (
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('society.gender')}>
              <Input value={gender} onChange={(event) => setGender(event.target.value)} maxLength={16} />
            </Field>
            <Field label={t('society.birthDate')}>
              <Input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} />
            </Field>
          </div>
        ) : (
          <Field label={t('society.website')}>
            <Input value={website} onChange={(event) => setWebsite(event.target.value)} maxLength={128} />
          </Field>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-medium text-muted-foreground">{t('society.contacts')}</p>
            <Button type="button" onClick={() => setContacts((old) => [...old, { contactType: 'TELEPHONE', content: '' }])}>
              <Plus size={14} />
              {t('society.addContact')}
            </Button>
          </div>
          {contacts.map((contact, index) => (
            <div key={index} className="grid grid-cols-11 gap-2">
              <select
                value={contact.contactType}
                onChange={(event) => updateContact(index, { contactType: event.target.value as ContactDto['contactType'] })}
                className={`${selectClass} col-span-4`}
              >
                {CONTACT_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {t(`society.${value}`)}
                  </option>
                ))}
              </select>
              <Input
                value={contact.content}
                onChange={(event) => updateContact(index, { content: event.target.value })}
                className="col-span-6"
              />
              <Button
                type="button"
                variant="destructive"
                aria-label={t('common.delete')}
                onClick={() => setContacts((old) => old.filter((_, i) => i !== index))}
                className="col-span-1"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
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

export const selectClass =
  'w-full rounded-xl bg-muted border border-transparent px-3 py-2.5 text-[13px] text-foreground focus:outline-none focus:bg-card focus:border-border disabled:opacity-50'
