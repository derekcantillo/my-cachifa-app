import type {
  Account,
  CreateAccountInput,
  SetInitialBalanceInput,
} from '../../types/account'

export interface AccountRepository {
  list(): Promise<Account[]>
  getById(id: string): Promise<Account | null>
  create(input: CreateAccountInput): Promise<Account>
  setInitialBalance(id: string, input: SetInitialBalanceInput): Promise<Account>
}
