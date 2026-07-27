import { generateId } from '@/utils'
import type {
  Budget,
  CreateBudgetInput,
  UpdateBudgetInput,
} from '../../types/budget'
import type {
  BudgetRepository,
  ListBudgetsParams,
} from '../interfaces/BudgetRepository'
import { simulateLatency } from './latency'
import { seedBudgets } from './seed-data'

let budgets: Budget[] = seedBudgets.map(budget => ({ ...budget }))

class MockBudgetRepository implements BudgetRepository {
  async list(params: ListBudgetsParams = {}): Promise<Budget[]> {
    await simulateLatency()

    return budgets
      .filter(budget => (params.month ? budget.month === params.month : true))
      .map(budget => ({ ...budget }))
  }

  async getById(id: string): Promise<Budget | null> {
    await simulateLatency()
    const found = budgets.find(budget => budget.id === id)
    return found ? { ...found } : null
  }

  async create(input: CreateBudgetInput): Promise<Budget> {
    await simulateLatency()

    const created: Budget = { ...input, id: generateId('bud') }
    budgets = [created, ...budgets]
    return { ...created }
  }

  async update(id: string, input: UpdateBudgetInput): Promise<Budget> {
    await simulateLatency()

    const existing = budgets.find(budget => budget.id === id)
    if (!existing) {
      throw new Error(`Budget ${id} not found`)
    }

    const updated: Budget = { ...existing, ...input }
    budgets = budgets.map(budget => (budget.id === id ? updated : budget))
    return { ...updated }
  }

  async remove(id: string): Promise<void> {
    await simulateLatency()
    budgets = budgets.filter(budget => budget.id !== id)
  }
}

export const mockBudgetRepository: BudgetRepository = new MockBudgetRepository()
