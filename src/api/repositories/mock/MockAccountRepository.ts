import type { Account } from '../../types/account'
import type { AccountRepository } from '../interfaces/AccountRepository'
import { simulateLatency } from './latency'
import { seedAccounts } from './seed-data'

const accounts: Account[] = seedAccounts.map(account => ({ ...account }))

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
}

export const mockAccountRepository: AccountRepository =
  new MockAccountRepository()
