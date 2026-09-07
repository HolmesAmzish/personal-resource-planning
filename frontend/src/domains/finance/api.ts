import { apiClient } from '../../shared/lib/apiClient'
import type { PageResponse } from '../../shared/types'
import type {
  Account,
  AccountBalance,
  AccountDto,
  Category,
  CategoryDto,
  CurrencyTotal,
  Preset,
  Summary,
  Transaction,
  TransactionDto,
  TrendPoint,
} from './types'

export async function listAccounts(params: { page: number; size: number }): Promise<PageResponse<Account>> {
  const res = await apiClient.get('/accounts', { params })
  return res.data as PageResponse<Account>
}

export async function createAccount(body: AccountDto): Promise<number> {
  const res = await apiClient.post('/accounts', body)
  return res.data as number
}

export async function updateAccount(id: number, body: AccountDto): Promise<void> {
  await apiClient.put(`/accounts/${id}`, body)
}

export async function deleteAccount(id: number): Promise<void> {
  await apiClient.delete(`/accounts/${id}`)
}

export async function totalBalance(): Promise<CurrencyTotal[]> {
  const res = await apiClient.get('/accounts/total-balance')
  return res.data as CurrencyTotal[]
}

export async function listCategories(type?: string): Promise<Category[]> {
  const res = await apiClient.get('/categories', { params: type ? { type } : {} })
  return res.data as Category[]
}

export async function createCategory(body: CategoryDto): Promise<number> {
  const res = await apiClient.post('/categories', body)
  return res.data as number
}

export async function updateCategory(id: number, body: CategoryDto): Promise<void> {
  await apiClient.put(`/categories/${id}`, body)
}

export async function deleteCategory(id: number): Promise<void> {
  await apiClient.delete(`/categories/${id}`)
}

export async function listTransactions(params: {
  from?: string
  to?: string
  accountId?: number
  categoryId?: number
  type?: string
  page: number
  size: number
}): Promise<PageResponse<Transaction>> {
  const res = await apiClient.get('/transactions', { params })
  return res.data as PageResponse<Transaction>
}

export async function createTransaction(body: TransactionDto): Promise<number> {
  const res = await apiClient.post('/transactions', body)
  return res.data as number
}

export async function transfer(body: TransactionDto): Promise<number> {
  const res = await apiClient.post('/transactions/transfer', body)
  return res.data as number
}

export async function updateTransaction(id: number, body: TransactionDto): Promise<void> {
  await apiClient.put(`/transactions/${id}`, body)
}

export async function deleteTransaction(id: number): Promise<void> {
  await apiClient.delete(`/transactions/${id}`)
}

export async function listPresets(): Promise<Preset[]> {
  const res = await apiClient.get('/transaction-presets')
  return res.data as Preset[]
}

export async function createPreset(body: Omit<TransactionDto, 'occurredOn'>): Promise<number> {
  const res = await apiClient.post('/transaction-presets', body)
  return res.data as number
}

export async function updatePreset(id: number, body: Omit<TransactionDto, 'occurredOn'>): Promise<void> {
  await apiClient.put(`/transaction-presets/${id}`, body)
}

export async function deletePreset(id: number): Promise<void> {
  await apiClient.delete(`/transaction-presets/${id}`)
}

export async function summary(from: string, to: string): Promise<Summary> {
  const res = await apiClient.get('/statistics/summary', { params: { from, to } })
  return res.data as Summary
}

export async function trend(from: string, to: string, unit = 'day'): Promise<TrendPoint[]> {
  const res = await apiClient.get('/statistics/trend', { params: { from, to, unit } })
  return res.data as TrendPoint[]
}

export async function accountBalances(): Promise<AccountBalance[]> {
  const res = await apiClient.get('/statistics/account-balances')
  return res.data as AccountBalance[]
}
