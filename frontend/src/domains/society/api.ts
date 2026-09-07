import { apiClient } from '../../shared/lib/apiClient'
import type { Page } from '../task/types'
import type {
  Contact,
  ContactDto,
  ContactType,
  Membership,
  MembershipDto,
  MembershipField,
  MembershipFieldDto,
  MembershipSummary,
  Party,
  PartyDto,
  PartyType,
} from './types'

export async function listParties(params: {
  partyType?: PartyType
  q?: string
  page: number
  size: number
}): Promise<Page<Party>> {
  const res = await apiClient.get('/society/parties', { params })
  return res.data as Page<Party>
}

export async function getParty(id: number): Promise<Party> {
  const res = await apiClient.get(`/society/parties/${id}`)
  return res.data as Party
}

export async function createParty(body: PartyDto): Promise<Party> {
  const res = await apiClient.post('/society/parties', body)
  return res.data as Party
}

export async function updateParty(id: number, body: PartyDto): Promise<Party> {
  const res = await apiClient.put(`/society/parties/${id}`, body)
  return res.data as Party
}

export async function deleteParty(id: number): Promise<void> {
  await apiClient.delete(`/society/parties/${id}`)
}

export async function listContacts(params: {
  partyId?: number
  contactType?: ContactType
  q?: string
  page: number
  size: number
}): Promise<Page<Contact>> {
  const res = await apiClient.get('/society/contacts', { params })
  return res.data as Page<Contact>
}

export async function createContact(body: ContactDto): Promise<Contact> {
  const res = await apiClient.post('/society/contacts', body)
  return res.data as Contact
}

export async function updateContact(id: number, body: ContactDto): Promise<Contact> {
  const res = await apiClient.put(`/society/contacts/${id}`, body)
  return res.data as Contact
}

export async function deleteContact(id: number): Promise<void> {
  await apiClient.delete(`/society/contacts/${id}`)
}

export async function listMemberships(params: {
  personId?: number
  organizationId?: number
  q?: string
  page: number
  size: number
}): Promise<Page<Membership>> {
  const res = await apiClient.get('/society/memberships', { params })
  return res.data as Page<Membership>
}

export async function createMembership(body: MembershipDto): Promise<Membership> {
  const res = await apiClient.post('/society/memberships', body)
  return res.data as Membership
}

export async function updateMembership(id: number, body: MembershipDto): Promise<Membership> {
  const res = await apiClient.put(`/society/memberships/${id}`, body)
  return res.data as Membership
}

export async function deleteMembership(id: number): Promise<void> {
  await apiClient.delete(`/society/memberships/${id}`)
}

export async function listMembershipFields(organizationId: number): Promise<MembershipField[]> {
  const res = await apiClient.get(`/society/organizations/${organizationId}/membership-fields`)
  return res.data as MembershipField[]
}

export async function listAllMembershipFields(): Promise<MembershipField[]> {
  const res = await apiClient.get('/society/membership-fields')
  return res.data as MembershipField[]
}

export async function createMembershipField(
  organizationId: number,
  body: MembershipFieldDto,
): Promise<MembershipField> {
  const res = await apiClient.post(`/society/organizations/${organizationId}/membership-fields`, body)
  return res.data as MembershipField
}

export async function updateMembershipField(
  organizationId: number,
  id: number,
  body: MembershipFieldDto,
): Promise<MembershipField> {
  const res = await apiClient.put(`/society/organizations/${organizationId}/membership-fields/${id}`, body)
  return res.data as MembershipField
}

export async function deleteMembershipField(organizationId: number, id: number): Promise<void> {
  await apiClient.delete(`/society/organizations/${organizationId}/membership-fields/${id}`)
}
