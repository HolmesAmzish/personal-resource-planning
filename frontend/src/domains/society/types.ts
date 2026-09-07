import type { Page } from '../task/types'

export type { Page }

export type PartyType = 'PERSON' | 'ORGANIZATION'
export type ContactType = 'TELEPHONE' | 'EMAIL'

export interface Party {
  id: number
  partyType: PartyType
  name: string
  identityCode?: string | null
  address?: string | null
  gender?: string | null
  birthDate?: string | null
  website?: string | null
  contacts?: Contact[]
  memberships?: MembershipSummary[]
  createdAt?: string
  updatedAt?: string
}

export interface PartyDto {
  partyType: PartyType
  name: string
  identityCode?: string
  address?: string
  gender?: string
  birthDate?: string
  website?: string
  contacts?: ContactDto[]
}

export interface Contact {
  id: number
  partyId: number
  partyName?: string
  partyType?: PartyType
  contactType: ContactType
  content: string
  createdAt?: string
}

export interface ContactDto {
  partyId?: number
  contactType: ContactType
  content: string
}

export interface MembershipSummary {
  id: number
  personId: number
  personName: string
  organizationId: number
  organizationName: string
  note?: string | null
  createdAt?: string
}

export interface Membership {
  id: number
  personId: number
  personName: string
  organizationId: number
  organizationName: string
  note?: string | null
  extendJson: Record<string, unknown>
  createdAt?: string
  updatedAt?: string
}

export interface MembershipDto {
  personId: number
  organizationId: number
  note?: string
  extendJson: Record<string, unknown>
}

export interface MembershipField {
  id: number
  organizationId: number
  organizationName: string
  fieldKey: string
  fieldName: string
  fieldValue?: string | null
  sortOrder: number
  createdAt?: string
}

export interface MembershipFieldDto {
  fieldKey: string
  fieldName: string
  fieldValue?: string
  sortOrder: number
}
