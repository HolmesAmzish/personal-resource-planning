export type { PageResponse } from '../../shared/types'

export interface Account {
  id: number
  userId?: string
  name: string
  type: string
  balance: string | number
  currency: string
  note?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface AccountDto {
  name: string
  type: string
  balance?: string | number | null
  currency: string
  note?: string
}

export interface Category {
  id: number
  userId?: string | null
  name: string
  type: string
  icon?: string | null
  sortOrder?: number
  isSystem?: number
}

export interface CategoryDto {
  name: string
  type: string
  icon?: string
  sortOrder?: number
}

export interface Transaction {
  id: number
  userId?: string
  fromAccountId?: number | null
  toAccountId?: number | null
  categoryId?: number | null
  type: string
  amount: string | number
  occurredOn: string
  note?: string | null
  fromAccountName?: string | null
  toAccountName?: string | null
  categoryName?: string | null
}

export interface TransactionDto {
  fromAccountId?: number | null
  toAccountId?: number | null
  categoryId?: number | null
  type: string
  amount: string | number
  occurredOn: string
  note?: string
}

export interface Preset {
  id: number
  type: string
  amount: string | number
  fromAccountId?: number | null
  toAccountId?: number | null
  categoryId?: number | null
  note?: string | null
}

export interface Summary {
  totalIncome: string | number
  totalExpense: string | number
  net: string | number
  byCategory: { categoryId: number | null; categoryName: string | null; type: string; amount: string | number }[]
}

export interface TrendPoint {
  period: string
  income: string | number
  expense: string | number
}

export interface AccountBalance {
  accountId: number
  accountName: string
  currency: string
  balance: string | number
}

export interface CurrencyTotal {
  currency: string
  total: string | number
}
