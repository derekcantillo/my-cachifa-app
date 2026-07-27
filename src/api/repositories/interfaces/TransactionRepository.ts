import type {
  CreateTransactionInput,
  Transaction,
  TransactionKind,
  UpdateTransactionInput,
} from '../../types/transaction'

export interface ListTransactionsParams {
  /** Filter by period, formatted 'YYYY-MM'. */
  month?: string
  kind?: TransactionKind
  categoryId?: string
  accountId?: string
}

export interface TransactionRepository {
  list(params?: ListTransactionsParams): Promise<Transaction[]>
  getById(id: string): Promise<Transaction | null>
  create(input: CreateTransactionInput): Promise<Transaction>
  update(id: string, input: UpdateTransactionInput): Promise<Transaction>
  remove(id: string): Promise<void>
}
