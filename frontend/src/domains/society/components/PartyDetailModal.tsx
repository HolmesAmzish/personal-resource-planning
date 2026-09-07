import { useEffect, useState } from 'react'
import { useT } from '../../../shared/i18n/TranslationContext'
import { Badge, Modal, Spinner } from '../../../shared/ui'
import { getParty } from '../api'
import type { Party } from '../types'

export function PartyDetailModal({ id, onClose }: { id: number; onClose: () => void }) {
  const t = useT()
  const [party, setParty] = useState<Party | null>(null)

  useEffect(() => {
    let mounted = true
    void getParty(id).then((value) => {
      if (mounted) setParty(value)
    })
    return () => {
      mounted = false
    }
  }, [id])

  return (
    <Modal title={party?.name ?? t('society.partyDetail')} onClose={onClose}>
      {!party ? (
        <div className="p-8 flex justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Badge>{t(`society.${party.partyType}`)}</Badge>
            {party.identityCode && <Badge>{party.identityCode}</Badge>}
            {party.address && <Badge>{party.address}</Badge>}
          </div>
          {party.partyType === 'PERSON' && (
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <p className="text-muted-foreground">{t('society.gender')}</p>
              <p>{party.gender || '-'}</p>
              <p className="text-muted-foreground">{t('society.birthDate')}</p>
              <p>{party.birthDate || '-'}</p>
            </div>
          )}
          {party.partyType === 'ORGANIZATION' && (
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <p className="text-muted-foreground">{t('society.website')}</p>
              <p className="truncate">{party.website || '-'}</p>
            </div>
          )}
          <div>
            <p className="text-[12px] font-medium text-muted-foreground mb-2">{t('society.contacts')}</p>
            <div className="space-y-2">
              {party.contacts?.length ? (
                party.contacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between text-[13px]">
                    <span>{contact.content}</span>
                    <Badge>{t(`society.${contact.contactType}`)}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-[13px] text-muted-foreground">{t('society.noContacts')}</p>
              )}
            </div>
          </div>
          <div>
            <p className="text-[12px] font-medium text-muted-foreground mb-2">{t('society.memberships')}</p>
            <div className="space-y-2">
              {party.memberships?.length ? (
                party.memberships.map((membership) => (
                  <div key={membership.id} className="text-[13px]">
                    <p>
                      {party.partyType === 'PERSON'
                        ? membership.organizationName
                        : membership.personName}
                    </p>
                    {membership.note && <p className="text-[12px] text-muted-foreground">{membership.note}</p>}
                  </div>
                ))
              ) : (
                <p className="text-[13px] text-muted-foreground">{t('society.noMemberships')}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
