import { httpClient } from '../../httpClient'
import { toAmount } from '../../mappers/decimalMapper'
import type {
  Account,
  AccountType,
  CreateAccountInput,
  SetInitialBalanceInput,
} from '../../types/account'
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
  initialBalance: number | string
  initialBalanceDate: string | null
  currentBalance: number | string
  createdAt: string
  updatedAt: string
}

const ACCOUNT_TYPES: Record<BackendAccountType, AccountType> = {
  DEBIT_CARD: 'bank',
  CREDIT_CARD: 'credit_card',
  CASH: 'cash',
  SAVINGS_ACCOUNT: 'savings',
}

const BACKEND_ACCOUNT_TYPES: Record<AccountType, BackendAccountType> = {
  bank: 'DEBIT_CARD',
  credit_card: 'CREDIT_CARD',
  cash: 'CASH',
  savings: 'SAVINGS_ACCOUNT',
}

function toAccount(dto: AccountDto): Account {
  return {
    id: dto.id,
    name: dto.name,
    type: ACCOUNT_TYPES[dto.type] ?? 'bank',
    initialBalance: toAmount(dto.initialBalance),
    initialBalanceDate: dto.initialBalanceDate ?? null,
    currentBalance: toAmount(dto.currentBalance),
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

  async create(input: CreateAccountInput): Promise<Account> {
    const response = await httpClient.post<AccountDto>(BASE_PATH, {
      name: input.name,
      type: BACKEND_ACCOUNT_TYPES[input.type],
    })
    return toAccount(response.data)
  }

  async setInitialBalance(
    id: string,
    input: SetInitialBalanceInput,
  ): Promise<Account> {
    const response = await httpClient.patch<AccountDto>(
      `${BASE_PATH}/${id}/initial-balance`,
      { amount: input.amount, date: input.date },
    )
    return toAccount(response.data)
  }
}

export const httpAccountRepository: AccountRepository =
  new HttpAccountRepository()
