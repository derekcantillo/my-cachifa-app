import type { Account } from '../../types/account'

export interface AccountRepository {
  list(): Promise<Account[]>
  getById(id: string): Promise<Account | null>
}
