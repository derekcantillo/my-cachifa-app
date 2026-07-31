import { httpClient } from '../../httpClient'
import type { Account, AccountType } from '../../types/account'
import type { AccountRepository } from '../interfaces/AccountRepository'

const BASE_PATH = '/accounts'

/** `AccountType` as declared in the backend's Prisma schema. */
type BackendAccountType =
  | 'DEBIT_CARD'
  | 'CREDIT_CARD'
  | 'CASH'
  | 'SAVINGS_ACCOUNT'

interface AccountDto {
  id: string
  name: string
  type: BackendAccountType
  createdAt: string
  updatedAt: string
}

const ACCOUNT_TYPES: Record<BackendAccountType, AccountType> = {
  DEBIT_CARD: 'bank',
  CREDIT_CARD: 'credit_card',
  CASH: 'cash',
  SAVINGS_ACCOUNT: 'savings',
}

/** The API sends no balance and no currency: money lives in the transactions. */
function toAccount(dto: AccountDto): Account {
  return {
    id: dto.id,
    name: dto.name,
    type: ACCOUNT_TYPES[dto.type] ?? 'bank',
  }
}

class HttpAccountRepository implements AccountRepository {
  async list(): Promise<Account[]> {
    const response = await httpClient.get<AccountDto[]>(BASE_PATH)
    return response.data.map(toAccount)
  }

  /**
   * The API exposes no `GET /accounts/:id`, and the list is a handful of rows,
   * so the lookup happens here.
   */
  async getById(id: string): Promise<Account | null> {
    const accounts = await this.list()
    return accounts.find(account => account.id === id) ?? null
  }
}

export const httpAccountRepository: AccountRepository =
  new HttpAccountRepository()
