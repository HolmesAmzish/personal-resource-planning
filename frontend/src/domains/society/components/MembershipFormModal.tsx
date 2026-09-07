import { useEffect, useState } from 'react'
import { useT } from '../../../shared/i18n/TranslationContext'
import { Button, Field, Input, Modal, Spinner } from '../../../shared/ui'
import { listMembershipFields } from '../api'
import { selectClass } from './PartyFormModal'
import type { Membership, MembershipDto, MembershipField, Party } from '../types'

function valuesOf(membership: Membership | null | undefined) {
  return Object.fromEntries(
    Object.entries(membership?.extendJson ?? {}).map(([key, value]) => [key, String(value ?? '')]),
  )
}

export function MembershipFormModal({
  persons,
  organizations,
  editing,
  onClose,
  onSubmit,
}: {
  persons: Party[]
  organizations: Party[]
  editing?: Membership | null
  onClose: () => void
  onSubmit: (body: MembershipDto) => Promise<void>
}) {
  const t = useT()
  const [personId, setPersonId] = useState<string>(String(editing?.personId ?? ''))
  const [organizationId, setOrganizationId] = useState<string>(String(editing?.organizationId ?? ''))
  const [fields, setFields] = useState<MembershipField[]>([])
  const [values, setValues] = useState<Record<string, string>>(valuesOf(editing))
  const [note, setNote] = useState(editing?.note ?? '')
  const [loadingFields, setLoadingFields] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!organizationId) {
      setFields([])
      return
    }
    let mounted = true
    setLoadingFields(true)
    void listMembershipFields(Number(organizationId))
      .then((result) => {
        if (mounted) {
          setFields(result)
          setValues((old) => Object.fromEntries(
            result.map(({ fieldKey, fieldValue }) => [fieldKey, old[fieldKey] ?? fieldValue ?? '']),
          ))
        }
      })
      .finally(() => {
        if (mounted) setLoadingFields(false)
      })
    return () => {
      mounted = false
    }
  }, [organizationId])

  return (
    <Modal title={editing ? t('society.editMembership') : t('society.newMembership')} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault()
          if (!personId || !organizationId) {
            setError(t('society.membershipRequired'))
            return
          }
          setSaving(true)
          try {
            await onSubmit({
              personId: Number(personId),
              organizationId: Number(organizationId),
              note: note.trim() || undefined,
              extendJson: Object.fromEntries(Object.entries(values).filter(([, value]) => value !== '')),
            })
          } finally {
            setSaving(false)
          }
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('society.person')}>
            <select value={personId} onChange={(event) => setPersonId(event.target.value)} className={selectClass}>
              <option value="">{t('common.select')}</option>
              {persons.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('society.organization')}>
            <select
              value={organizationId}
              onChange={(event) => setOrganizationId(event.target.value)}
              className={selectClass}
            >
              <option value="">{t('common.select')}</option>
              {organizations.map((organization) => (
                <option key={organization.id} value={organization.id}>
                  {organization.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-medium text-muted-foreground">{t('society.extendFields')}</p>
            {loadingFields && <Spinner />}
          </div>
          {fields.map((field) => (
            <Field key={field.id} label={field.fieldName}>
              <Input
                value={values[field.fieldKey] ?? ''}
                onChange={(event) => setValues((old) => ({ ...old, [field.fieldKey]: event.target.value }))}
              />
            </Field>
          ))}
          {organizationId && !loadingFields && fields.length === 0 && (
            <p className="text-[12px] text-muted-foreground">{t('society.noFields')}</p>
          )}
        </div>

        <Field label={t('society.note')}>
          <Input value={note} onChange={(event) => setNote(event.target.value)} maxLength={255} />
        </Field>
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
