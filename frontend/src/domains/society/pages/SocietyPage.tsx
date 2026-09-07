import { useCallback, useEffect, useState } from 'react'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { toMessage } from '../../../shared/lib/apiClient'
import { useT } from '../../../shared/i18n/TranslationContext'
import { Badge, Button, Card, Empty, Input, Spinner } from '../../../shared/ui'
import {
  createContact, createMembership,
  createParty,
  deleteContact,
  deleteMembership,
  deleteParty,
  listContacts,
  listMemberships,
  listParties, updateContact, updateMembership,
  updateParty,
} from '../api'
import { ContactFormModal } from '../components/ContactFormModal'
import { MembershipFieldPanel } from '../components/MembershipFieldPanel'
import { MembershipFormModal } from '../components/MembershipFormModal'
import { PartyDetailModal } from '../components/PartyDetailModal'
import { PartyFormModal } from '../components/PartyFormModal'
import type { Contact, Membership, Party, PartyType } from '../types'

type Tab = 'parties' | 'contacts' | 'memberships' | 'fields'

const TABS: Tab[] = ['parties', 'contacts', 'memberships', 'fields']

export function SocietyPage() {
  const t = useT()
  const [tab, setTab] = useState<Tab>('parties')
  const [queryDraft, setQueryDraft] = useState('')
  const [query, setQuery] = useState('')
  const [partyType, setPartyType] = useState<PartyType | ''>('')

  const [parties, setParties] = useState<Party[]>([])
  const [allParties, setAllParties] = useState<Party[]>([])
  const [persons, setPersons] = useState<Party[]>([])
  const [organizations, setOrganizations] = useState<Party[]>([])
  const [partyPage, setPartyPage] = useState(0)
  const [partyTotal, setPartyTotal] = useState(0)
  const size = 20

  const [contacts, setContacts] = useState<Contact[]>([])
  const [contactPage, setContactPage] = useState(0)
  const [contactTotal, setContactTotal] = useState(0)
  const [contactType, setContactType] = useState('')

  const [memberships, setMemberships] = useState<Membership[]>([])
  const [membershipPage, setMembershipPage] = useState(0)
  const [membershipTotal, setMembershipTotal] = useState(0)
  const [membershipPerson, setMembershipPerson] = useState('')
  const [membershipOrganization, setMembershipOrganization] = useState('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [partyForm, setPartyForm] = useState<Party | null | undefined>(undefined)
  const [partyDetail, setPartyDetail] = useState<number | null>(null)
  const [contactForm, setContactForm] = useState<Contact | null | undefined>(undefined)
  const [membershipForm, setMembershipForm] = useState<Membership | null | undefined>(undefined)

  const loadParties = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await listParties({
        partyType: partyType || undefined,
        q: query || undefined,
        page: partyPage,
        size,
      })
      setParties(result.content)
      setPartyTotal(result.totalElements)
    } catch (e) {
      setError(toMessage(e))
    } finally {
      setLoading(false)
    }
  }, [partyPage, partyType, query])

  const loadOptions = useCallback(async () => {
    const result = await listParties({ page: 0, size: 200 })
    setAllParties(result.content)
    setPersons(result.content.filter((party) => party.partyType === 'PERSON'))
    setOrganizations(result.content.filter((party) => party.partyType === 'ORGANIZATION'))
  }, [])

  const loadContacts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await listContacts({
        contactType: contactType ? (contactType as Contact['contactType']) : undefined,
        q: query || undefined,
        page: contactPage,
        size,
      })
      setContacts(result.content)
      setContactTotal(result.totalElements)
    } catch (e) {
      setError(toMessage(e))
    } finally {
      setLoading(false)
    }
  }, [contactPage, contactType, query])

  const loadMemberships = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await listMemberships({
        personId: membershipPerson ? Number(membershipPerson) : undefined,
        organizationId: membershipOrganization ? Number(membershipOrganization) : undefined,
        q: query || undefined,
        page: membershipPage,
        size,
      })
      setMemberships(result.content)
      setMembershipTotal(result.totalElements)
    } catch (e) {
      setError(toMessage(e))
    } finally {
      setLoading(false)
    }
  }, [membershipOrganization, membershipPage, membershipPerson, query])

  useEffect(() => {
    void loadOptions()
  }, [loadOptions])

  useEffect(() => {
    void loadParties()
  }, [loadParties])

  useEffect(() => {
    if (tab === 'contacts') void loadContacts()
    if (tab === 'memberships') void loadMemberships()
  }, [loadContacts, loadMemberships, tab])

  const search = () => {
    setQuery(queryDraft.trim())
    setPartyPage(0)
    setContactPage(0)
    setMembershipPage(0)
  }

  const total = tab === 'contacts' ? contactTotal : tab === 'memberships' ? membershipTotal : partyTotal
  const current = tab === 'contacts' ? contactPage : tab === 'memberships' ? membershipPage : partyPage
  const setPage = tab === 'contacts' ? setContactPage : tab === 'memberships' ? setMembershipPage : setPartyPage

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold leading-tight text-foreground">{t('society.title')}</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            {total} {t('society.subtitle')}
          </p>
        </div>
        {tab === 'parties' && (
          <Button variant="primary" onClick={() => setPartyForm(null)}>
            {t('society.newParty')}
          </Button>
        )}
        {tab === 'contacts' && (
          <Button variant="primary" onClick={() => setContactForm(null)}>
            {t('society.newContact')}
          </Button>
        )}
        {tab === 'memberships' && (
          <Button variant="primary" onClick={() => setMembershipForm(null)}>
            {t('society.newMembership')}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((value) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`px-3.5 py-2 rounded-full text-[12px] font-medium transition-colors ${
              tab === value ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {t(`society.tab.${value}`)}
          </button>
        ))}
      </div>

      {tab !== 'fields' && (
        <form
          className="grid grid-cols-1 md:grid-cols-12 gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            search()
          }}
        >
          <div className="md:col-span-4">
            <Input
              value={queryDraft}
              onChange={(event) => setQueryDraft(event.target.value)}
              placeholder={t('society.searchPlaceholder')}
            />
          </div>
          {tab === 'parties' && (
            <select
              value={partyType}
              onChange={(event) => {
                setPartyType(event.target.value as PartyType | '')
                setPartyPage(0)
              }}
              className="md:col-span-2 rounded-xl bg-muted border border-transparent px-3 py-2.5 text-[13px] text-foreground focus:outline-none focus:bg-card focus:border-border"
            >
              <option value="">{t('common.all')}</option>
              <option value="PERSON">{t('society.PERSON')}</option>
              <option value="ORGANIZATION">{t('society.ORGANIZATION')}</option>
            </select>
          )}
          {tab === 'contacts' && (
            <select
              value={contactType}
              onChange={(event) => {
                setContactType(event.target.value)
                setContactPage(0)
              }}
              className="md:col-span-2 rounded-xl bg-muted border border-transparent px-3 py-2.5 text-[13px] text-foreground focus:outline-none focus:bg-card focus:border-border"
            >
              <option value="">{t('common.all')}</option>
              <option value="TELEPHONE">{t('society.TELEPHONE')}</option>
              <option value="EMAIL">{t('society.EMAIL')}</option>
            </select>
          )}
          {tab === 'memberships' && (
            <>
              <select
                value={membershipPerson}
                onChange={(event) => {
                  setMembershipPerson(event.target.value)
                  setMembershipPage(0)
                }}
                className="md:col-span-2 rounded-xl bg-muted border border-transparent px-3 py-2.5 text-[13px] text-foreground focus:outline-none focus:bg-card focus:border-border"
              >
                <option value="">{t('society.allPersons')}</option>
                {persons.map((person) => (
                  <option key={person.id} value={person.id}>{person.name}</option>
                ))}
              </select>
              <select
                value={membershipOrganization}
                onChange={(event) => {
                  setMembershipOrganization(event.target.value)
                  setMembershipPage(0)
                }}
                className="md:col-span-2 rounded-xl bg-muted border border-transparent px-3 py-2.5 text-[13px] text-foreground focus:outline-none focus:bg-card focus:border-border"
              >
                <option value="">{t('society.allOrganizations')}</option>
                {organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>{organization.name}</option>
                ))}
              </select>
            </>
          )}
          <Button type="submit" className="md:col-span-1">
            {t('society.search')}
          </Button>
        </form>
      )}

      {error && <p className="text-[12px] text-danger">{error}</p>}

      {tab === 'fields' ? (
        <MembershipFieldPanel organizations={organizations} />
      ) : (
        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-10 flex justify-center">
              <Spinner />
            </div>
          ) : tab === 'parties' ? (
            parties.length === 0 ? (
              <div className="p-4">
                <Empty message={t('society.noParties')} action={<Button variant="primary" onClick={() => setPartyForm(null)}>{t('society.newParty')}</Button>} />
              </div>
            ) : (
              <div className="divide-y divide-border">
                {parties.map((party) => (
                  <div key={party.id} className="px-6 py-4 flex flex-col md:grid md:grid-cols-12 gap-3 items-start md:items-center hover:bg-muted transition-colors">
                    <div className="col-span-5 min-w-0 w-full">
                      <p className="text-[13px] font-medium truncate">{party.name}</p>
                      <p className="text-[12px] text-muted-foreground mt-1 truncate">{party.identityCode || party.address || '-'}</p>
                    </div>
                    <div className="col-span-3">
                      <Badge>{t(`society.${party.partyType}`)}</Badge>
                    </div>
                    <p className="col-span-2 text-[12px] text-muted-foreground truncate">
                      {party.contacts?.[0]?.content || '-'}
                    </p>
                    <div className="col-span-2 flex md:justify-end gap-2">
                      <Button variant="ghost" aria-label={t('society.partyDetail')} onClick={() => setPartyDetail(party.id)}><Eye size={14} /></Button>
                      <Button variant="ghost" aria-label={t('society.editParty')} onClick={() => setPartyForm(party)}><Pencil size={14} /></Button>
                      <Button
                        variant="destructive"
                        aria-label={t('common.delete')}
                        onClick={async () => {
                          await deleteParty(party.id)
                          await Promise.all([loadParties(), loadOptions()])
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : tab === 'contacts' ? (
            contacts.length === 0 ? (
              <div className="p-4">
                <Empty message={t('society.noContacts')} action={<Button variant="primary" onClick={() => setContactForm(null)}>{t('society.newContact')}</Button>} />
              </div>
            ) : (
              <div className="divide-y divide-border">
                {contacts.map((contact) => (
                  <div key={contact.id} className="px-6 py-4 flex flex-col md:grid md:grid-cols-12 gap-3 items-start md:items-center hover:bg-muted transition-colors">
                    <p className="col-span-4 text-[13px] font-medium truncate">{contact.partyName}</p>
                    <p className="col-span-4 text-[13px] truncate">{contact.content}</p>
                    <div className="col-span-2"><Badge>{t(`society.${contact.contactType}`)}</Badge></div>
                    <div className="col-span-2 flex md:justify-end gap-2">
                      <Button variant="ghost" aria-label={t('society.editContact')} onClick={() => setContactForm(contact)}><Pencil size={14} /></Button>
                      <Button variant="destructive" onClick={async () => { await deleteContact(contact.id); await loadContacts() }}><Trash2 size={14} /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : memberships.length === 0 ? (
            <div className="p-4">
              <Empty message={t('society.noMemberships')} action={<Button variant="primary" onClick={() => setMembershipForm(null)}>{t('society.newMembership')}</Button>} />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {memberships.map((membership) => (
                <div key={membership.id} className="px-6 py-4 flex flex-col md:grid md:grid-cols-12 gap-3 items-start md:items-center hover:bg-muted transition-colors">
                  <div className="col-span-4 min-w-0">
                    <p className="text-[13px] font-medium truncate">{membership.personName}</p>
                    <p className="text-[12px] text-muted-foreground">{membership.organizationName}</p>
                  </div>
                  <p className="col-span-4 text-[12px] text-muted-foreground truncate">{membership.note || '-'}</p>
                  <p className="col-span-2 text-[12px] text-muted-foreground">
                    {Object.keys(membership.extendJson || {}).length}
                  </p>
                  <div className="col-span-2 flex md:justify-end gap-2">
                    <Button variant="ghost" aria-label={t('society.editMembership')} onClick={() => setMembershipForm(membership)}><Pencil size={14} /></Button>
                    <Button variant="destructive" onClick={async () => { await deleteMembership(membership.id); await loadMemberships() }}><Trash2 size={14} /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="px-6 py-3 border-t border-border flex items-center justify-between">
            <span className="text-[12px] text-muted-foreground">
              {t('common.page')} {current + 1}
            </span>
            <div className="flex gap-2">
              <Button disabled={current === 0} onClick={() => setPage(current - 1)}>{t('common.previous')}</Button>
              <Button disabled={(current + 1) * size >= total} onClick={() => setPage(current + 1)}>{t('common.next')}</Button>
            </div>
          </div>
        </Card>
      )}

      {partyForm !== undefined && (
        <PartyFormModal
          editing={partyForm}
          onClose={() => setPartyForm(undefined)}
          onSubmit={async (body) => {
            if (partyForm) await updateParty(partyForm.id, body)
            else await createParty(body)
            setPartyForm(undefined)
            setPartyPage(0)
            await Promise.all([loadParties(), loadOptions()])
          }}
        />
      )}
      {partyDetail && <PartyDetailModal id={partyDetail} onClose={() => setPartyDetail(null)} />}
      {contactForm !== undefined && (
        <ContactFormModal
          parties={allParties}
          editing={contactForm}
          onClose={() => setContactForm(undefined)}
          onSubmit={async (body) => {
            if (contactForm) await updateContact(contactForm.id, body)
            else await createContact(body)
            setContactForm(undefined)
            setContactPage(0)
            await Promise.all([loadContacts(), loadOptions(), loadParties()])
          }}
        />
      )}
      {membershipForm !== undefined && (
        <MembershipFormModal
          persons={persons}
          organizations={organizations}
          editing={membershipForm}
          onClose={() => setMembershipForm(undefined)}
          onSubmit={async (body) => {
            if (membershipForm) await updateMembership(membershipForm.id, body)
            else await createMembership(body)
            setMembershipForm(undefined)
            setMembershipPage(0)
            await Promise.all([loadMemberships(), loadParties()])
          }}
        />
      )}
    </div>
  )
}
