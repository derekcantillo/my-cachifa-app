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
import { simulateLatency } from './latency'
import { seedTransactions } from './seed-data'

let transactions: Transaction[] = seedTransactions.map(transaction => ({
  ...transaction,
}))

class MockTransactionRepository implements TransactionRepository {
  async list(params: ListTransactionsParams = {}): Promise<Transaction[]> {
    await simulateLatency()

    return transactions
      .filter(transaction =>
        params.month ? transaction.date.startsWith(params.month) : true,
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
    await simulateLatency()

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
    await simulateLatency()

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
    await simulateLatency()
    transactions = transactions.filter(transaction => transaction.id !== id)
  }
}

export const mockTransactionRepository: TransactionRepository =
  new MockTransactionRepository()
