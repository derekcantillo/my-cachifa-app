import { generateId } from '@/utils'
import type {
  AddGoalContributionInput,
  CreateGoalInput,
  Goal,
  UpdateGoalInput,
} from '../../types/goal'
import type { GoalRepository } from '../interfaces/GoalRepository'
import { simulateLatency } from './latency'
import { seedGoals } from './seed-data'

let goals: Goal[] = seedGoals.map(goal => ({
  ...goal,
  contributions: [...goal.contributions],
}))

class MockGoalRepository implements GoalRepository {
  async list(): Promise<Goal[]> {
    await simulateLatency()
    return goals.map(goal => ({
      ...goal,
      contributions: [...goal.contributions],
    }))
  }

  async getById(id: string): Promise<Goal | null> {
    await simulateLatency()
    const found = goals.find(goal => goal.id === id)
    return found ? { ...found, contributions: [...found.contributions] } : null
  }

  async create(input: CreateGoalInput): Promise<Goal> {
    await simulateLatency()

    const created: Goal = {
      status: 'active',
      currentAmount: 0,
      contributions: [],
      ...input,
      id: generateId('goal'),
      createdAt: new Date().toISOString(),
    }

    goals = [created, ...goals]
    return { ...created }
  }

  async update(id: string, input: UpdateGoalInput): Promise<Goal> {
    await simulateLatency()

    const existing = goals.find(goal => goal.id === id)
    if (!existing) {
      throw new Error(`Goal ${id} not found`)
    }

    const updated: Goal = { ...existing, ...input }
    goals = goals.map(goal => (goal.id === id ? updated : goal))
    return { ...updated }
  }

  async remove(id: string): Promise<void> {
    await simulateLatency()
    goals = goals.filter(goal => goal.id !== id)
  }

  async addContribution(input: AddGoalContributionInput): Promise<Goal> {
    await simulateLatency()

    const existing = goals.find(goal => goal.id === input.goalId)
    if (!existing) {
      throw new Error(`Goal ${input.goalId} not found`)
    }

    const contribution = {
      id: generateId('contrib'),
      amount: input.amount,
      date: input.date ?? new Date().toISOString(),
      note: input.note,
    }

    const newAmount = existing.currentAmount + input.amount
    const updated: Goal = {
      ...existing,
      currentAmount: newAmount,
      status:
        newAmount >= existing.targetAmount ? 'completed' : existing.status,
      contributions: [contribution, ...existing.contributions],
    }

    goals = goals.map(goal => (goal.id === input.goalId ? updated : goal))
    return { ...updated }
  }
}

export const mockGoalRepository: GoalRepository = new MockGoalRepository()
