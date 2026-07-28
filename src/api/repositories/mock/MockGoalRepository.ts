import { generateId, getCurrentMonthKey, shiftMonthKey } from '@/utils'
import type {
  AddGoalContributionInput,
  CreateGoalInput,
  Goal,
  SavingsProjection,
  SavingsProjectionEvent,
  SavingsProjectionPoint,
  UpdateGoalInput,
} from '../../types/goal'
import type { GoalRepository } from '../interfaces/GoalRepository'
import { simulateLatency } from './latency'
import { seedGoals } from './seed-data'

const PROJECTION_MONTHS = 12

/** What the plan sets aside every month once the fixed costs are covered. */
const MONTHLY_CONTRIBUTION = 300

/**
 * Extraordinary movements the plan already accounts for, placed relative to the
 * current month so the projection always has events ahead of today.
 */
const PROJECTION_EVENTS: ReadonlyArray<{
  monthOffset: number
  event: SavingsProjectionEvent
}> = [
  {
    monthOffset: 2,
    event: {
      id: 'evt-venta-carro',
      label: 'Venta del carro',
      amount: 2500,
      kind: 'inflow',
    },
  },
  {
    monthOffset: 5,
    event: {
      id: 'evt-prima',
      label: 'Prima de mitad de año',
      amount: 900,
      kind: 'inflow',
    },
  },
  {
    monthOffset: 8,
    event: {
      id: 'evt-compra-vehiculo',
      label: 'Compra del vehículo',
      amount: -5000,
      kind: 'outflow',
    },
  },
]

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

  async getSavingsProjection(
    months = PROJECTION_MONTHS,
  ): Promise<SavingsProjection> {
    await simulateLatency()

    const startMonth = getCurrentMonthKey()
    const open = goals.filter(goal => goal.status !== 'completed')

    // The current period opens on what is already saved; every later one adds
    // the plan's contribution before the events of that month land.
    let amount = goals.reduce((total, goal) => total + goal.currentAmount, 0)

    const points: SavingsProjectionPoint[] = []
    for (let offset = 0; offset < months; offset += 1) {
      const scheduled = PROJECTION_EVENTS.find(
        entry => entry.monthOffset === offset,
      )

      if (offset > 0) {
        amount += MONTHLY_CONTRIBUTION
      }
      if (scheduled) {
        amount += scheduled.event.amount
      }

      points.push({
        month: shiftMonthKey(startMonth, offset),
        amount,
        ...(scheduled ? { event: { ...scheduled.event } } : {}),
      })
    }

    return {
      points,
      monthlyContribution: MONTHLY_CONTRIBUTION,
      targetAmount: open.reduce((total, goal) => total + goal.targetAmount, 0),
    }
  }
}

export const mockGoalRepository: GoalRepository = new MockGoalRepository()
