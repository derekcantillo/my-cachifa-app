import { generateId } from '@/utils'
import type {
  Account,
  CreateAccountInput,
  SetInitialBalanceInput,
} from '../../types/account'
import type { AccountRepository } from '../interfaces/AccountRepository'
import { simulateLatency, simulateWrite } from './latency'
import { seedAccounts } from './seed-data'

let accounts: Account[] = seedAccounts.map(account => ({ ...account }))

class MockAccountRepository implements AccountRepository {
  async list(): Promise<Account[]> {
    await simulateLatency()
    return accounts.map(account => ({ ...account }))
  }

  async getById(id: string): Promise<Account | null> {
    await simulateLatency()
    const found = accounts.find(account => account.id === id)
    return found ? { ...found } : null
  }

  async create(input: CreateAccountInput): Promise<Account> {
    await simulateWrite()

    const created: Account = {
      id: generateId('acc'),
      name: input.name,
      type: input.type,
      initialBalance: 0,
      initialBalanceDate: null,
      currentBalance: 0,
    }
    accounts = [...accounts, created]
    return { ...created }
  }

  /**
   * The mock does not replay movements into a balance, so the current one
   * moves by exactly as much as the starting point did.
   */
  async setInitialBalance(
    id: string,
    input: SetInitialBalanceInput,
  ): Promise<Account> {
    await simulateWrite()

    const existing = accounts.find(account => account.id === id)
    if (!existing) {
      throw new Error(`Account ${id} not found`)
    }

    const updated: Account = {
      ...existing,
      initialBalance: input.amount,
      initialBalanceDate: input.date,
      currentBalance:
        existing.currentBalance - existing.initialBalance + input.amount,
    }
    accounts = accounts.map(account => (account.id === id ? updated : account))
    return { ...updated }
  }
}

export const mockAccountRepository: AccountRepository =
  new MockAccountRepository()
