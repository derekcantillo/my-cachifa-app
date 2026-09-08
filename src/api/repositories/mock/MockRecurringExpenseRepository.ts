import { generateId } from '@/utils'
import type {
  CreateRecurringExpenseInput,
  RecurringExpense,
  UpdateRecurringExpenseInput,
} from '../../types/recurringExpense'
import type { RecurringExpenseRepository } from '../interfaces/RecurringExpenseRepository'
import { simulateLatency, simulateWrite } from './latency'
import { mockTransactionRepository } from './MockTransactionRepository'
import { seedRecurringExpenses } from './seed-data'

let recurringExpenses: RecurringExpense[] = seedRecurringExpenses.map(
  expense => ({ ...expense }),
)

class MockRecurringExpenseRepository implements RecurringExpenseRepository {
  async getAll(): Promise<RecurringExpense[]> {
    await simulateLatency()
    return recurringExpenses.map(expense => ({ ...expense }))
  }

  async getPending(month: string): Promise<RecurringExpense[]> {
    await simulateLatency()

    const monthTransactions = await mockTransactionRepository.list({ month })
    const linkedIds = new Set(
      monthTransactions
        .map(transaction => transaction.recurringExpenseId)
        .filter((id): id is string => Boolean(id)),
    )

    return recurringExpenses
      .filter(expense => expense.active && !linkedIds.has(expense.id))
      .map(expense => ({ ...expense }))
  }

  async create(
    input: CreateRecurringExpenseInput,
  ): Promise<RecurringExpense> {
    await simulateWrite()

    const created: RecurringExpense = {
      active: true,
      ...input,
      id: generateId('rec'),
    }
    recurringExpenses = [created, ...recurringExpenses]
    return { ...created }
  }

  async update(
    id: string,
    input: UpdateRecurringExpenseInput,
  ): Promise<RecurringExpense> {
    await simulateWrite()

    const existing = recurringExpenses.find(expense => expense.id === id)
    if (!existing) {
      throw new Error(`RecurringExpense ${id} not found`)
    }

    const updated: RecurringExpense = { ...existing, ...input }
    recurringExpenses = recurringExpenses.map(expense =>
      expense.id === id ? updated : expense,
    )
    return { ...updated }
  }

  async delete(id: string): Promise<void> {
    await simulateWrite()
    recurringExpenses = recurringExpenses.filter(expense => expense.id !== id)
  }
}

export const mockRecurringExpenseRepository: RecurringExpenseRepository =
  new MockRecurringExpenseRepository()
