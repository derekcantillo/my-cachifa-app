import { generateId } from '@/utils'
import type {
  CreateTransactionInput,
  Transaction,
  UpdateTransactionInput,
} from '../../types/transaction'
import type {
  ListTransactionsParams,
  TransactionRepository,
} from '../interfaces/TransactionRepository'
import { simulateLatency, simulateWrite } from './latency'
import { isInPeriod, seedFinancialPeriods, seedTransactions } from './seed-data'

let transactions: Transaction[] = seedTransactions.map(transaction => ({
  ...transaction,
}))

class MockTransactionRepository implements TransactionRepository {
  async list(params: ListTransactionsParams = {}): Promise<Transaction[]> {
    await simulateLatency()

    // An unknown period matches nothing, like a period with no movements.
    const period = params.periodId
      ? seedFinancialPeriods.find(({ id }) => id === params.periodId)
      : undefined

    return transactions
      .filter(transaction =>
        params.periodId
          ? period !== undefined && isInPeriod(transaction.date, period)
          : true,
      )
      .filter(transaction =>
        params.kind ? transaction.kind === params.kind : true,
      )
      .filter(transaction =>
        params.categoryId ? transaction.categoryId === params.categoryId : true,
      )
      .filter(transaction =>
        params.accountId ? transaction.accountId === params.accountId : true,
      )
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(transaction => ({ ...transaction }))
  }

  async getById(id: string): Promise<Transaction | null> {
    await simulateLatency()
    const found = transactions.find(transaction => transaction.id === id)
    return found ? { ...found } : null
  }

  async create(input: CreateTransactionInput): Promise<Transaction> {
    await simulateWrite()

    const now = new Date().toISOString()
    const created: Transaction = {
      tags: [],
      ...input,
      id: generateId('txn'),
      createdAt: now,
      updatedAt: now,
    }

    transactions = [created, ...transactions]
    return { ...created }
  }

  async update(
    id: string,
    input: UpdateTransactionInput,
  ): Promise<Transaction> {
    await simulateWrite()

    const existing = transactions.find(transaction => transaction.id === id)
    if (!existing) {
      throw new Error(`Transaction ${id} not found`)
    }

    const updated: Transaction = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    }

    transactions = transactions.map(transaction =>
      transaction.id === id ? updated : transaction,
    )
    return { ...updated }
  }

  async remove(id: string): Promise<void> {
    await simulateWrite()
    transactions = transactions.filter(transaction => transaction.id !== id)
  }
}

export const mockTransactionRepository: TransactionRepository =
  new MockTransactionRepository()
