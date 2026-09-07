import { useCallback, useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toMessage } from '../../../shared/lib/apiClient'
import { useT } from '../../../shared/i18n/TranslationContext'
import { Badge, Button, Card, Empty, Field, Input, Modal, Spinner } from '../../../shared/ui'
import {
  createMembershipField,
  deleteMembershipField,
  listMembershipFields,
  updateMembershipField,
} from '../api'
import { selectClass } from './PartyFormModal'
import type { MembershipField, MembershipFieldDto, Party } from '../types'

export function MembershipFieldPanel({ organizations }: { organizations: Party[] }) {
  const t = useT()
  const [organizationId, setOrganizationId] = useState<string>(organizations[0] ? String(organizations[0].id) : '')
  const [fields, setFields] = useState<MembershipField[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<MembershipField | null | undefined>(undefined)

  const load = useCallback(async () => {
    if (!organizationId) {
      setFields([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      setFields(await listMembershipFields(Number(organizationId)))
    } catch (e) {
      setError(toMessage(e))
    } finally {
      setLoading(false)
    }
  }, [organizationId])

  useEffect(() => {
    void load()
  }, [load])

  const remove = async (id: number) => {
    setError(null)
    try {
      await deleteMembershipField(Number(organizationId), id)
      await load()
    } catch (e) {
      setError(toMessage(e))
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="flex items-end">
          <Button
            variant="primary"
            disabled={!organizationId}
            onClick={() => setForm(null)}
          >
            <Plus size={14} />
            {t('society.newField')}
          </Button>
        </div>
      </div>

      {error && <p className="text-[12px] text-danger">{error}</p>}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center">
            <Spinner />
          </div>
        ) : fields.length === 0 ? (
          <div className="p-4">
            <Empty message={organizationId ? t('society.noFields') : t('society.selectOrganization')} />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {fields.map((field) => (
              <div key={field.id} className="px-6 py-4 flex flex-col md:grid md:grid-cols-12 gap-3 items-start md:items-center">
                <div className="col-span-4 min-w-0 w-full">
                  <p className="text-[13px] font-medium truncate">{field.fieldName}</p>
                  <p className="text-[12px] text-muted-foreground">{field.fieldKey}</p>
                </div>
                <div className="col-span-3">
                  {field.fieldValue ? <Badge>{field.fieldValue}</Badge> : <Badge>-</Badge>}
                </div>
                <div className="col-span-2 text-[13px] text-muted-foreground">{field.sortOrder}</div>
                <div className="col-span-3 flex md:justify-end gap-2">
                  <Button variant="ghost" onClick={() => setForm(field)} aria-label={t('common.save')}>
                    <Pencil size={14} />
                  </Button>
                  <Button variant="destructive" onClick={() => void remove(field.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {form !== undefined && organizationId && (
        <FieldFormModal
          editing={form}
          onClose={() => setForm(undefined)}
          onSubmit={async (body) => {
            if (form) {
              await updateMembershipField(Number(organizationId), form.id, body)
            } else {
              await createMembershipField(Number(organizationId), body)
            }
            setForm(undefined)
            await load()
          }}
        />
      )}
    </div>
  )
}

function FieldFormModal({
  editing,
  onClose,
  onSubmit,
}: {
  editing: MembershipField | null
  onClose: () => void
  onSubmit: (body: MembershipFieldDto) => Promise<void>
}) {
  const t = useT()
  const [fieldKey, setFieldKey] = useState(editing?.fieldKey ?? '')
  const [fieldName, setFieldName] = useState(editing?.fieldName ?? '')
  const [fieldValue, setFieldValue] = useState(editing?.fieldValue ?? '')
  const [sortOrder, setSortOrder] = useState(String(editing?.sortOrder ?? 0))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  return (
    <Modal title={editing ? t('society.editField') : t('society.newField')} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault()
          if (!fieldKey.trim() || !fieldName.trim()) {
            setError(t('society.fieldRequired'))
            return
          }
          setSaving(true)
          try {
            await onSubmit({
              fieldKey: fieldKey.trim(),
              fieldName: fieldName.trim(),
              fieldValue: fieldValue.trim() || undefined,
              sortOrder: Number(sortOrder) || 0,
            })
          } finally {
            setSaving(false)
          }
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('society.fieldKey')}>
            <Input value={fieldKey} onChange={(event) => setFieldKey(event.target.value)} maxLength={64} />
          </Field>
          <Field label={t('society.fieldName')}>
            <Input value={fieldName} onChange={(event) => setFieldName(event.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('society.fieldValue')}>
            <Input value={fieldValue} onChange={(event) => setFieldValue(event.target.value)} maxLength={255} />
          </Field>
          <Field label={t('finance.order')}>
            <Input type="number" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} />
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
