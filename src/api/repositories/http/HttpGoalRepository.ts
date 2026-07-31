import { getCurrentMonthKey, shiftMonthKey, toMonthKey } from '@/utils'
import { isNotFoundError } from '../../apiError'
import { httpClient } from '../../httpClient'
import { toAmount } from '../../mappers/decimalMapper'
import type {
  AddGoalContributionInput,
  CreateGoalInput,
  Goal,
  GoalContribution,
  GoalPhase,
  GoalStatus,
  SavingsProjection,
  SavingsProjectionEvent,
  SavingsProjectionPoint,
  UpdateGoalInput,
} from '../../types/goal'
import type { GoalRepository } from '../interfaces/GoalRepository'

const BASE_PATH = '/goals'
const PROJECTION_PATH = '/reports/savings-projection'

const DEFAULT_PROJECTION_MONTHS = 12

/** How far out a goal created without a date is aimed. */
const DEFAULT_TARGET_MONTHS = 6

/** `PlanPhase` as declared in the backend's Prisma schema. */
type BackendPhase =
  | 'PHASE_1_DEBT_CONTROL'
  | 'PHASE_2_OPTIMIZATION'
  | 'PHASE_3_VEHICLE_PURCHASE'
  | 'PHASE_4_CONSOLIDATION'

type BackendStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED'

interface GoalContributionDto {
  id: string
  amount: number | string
  note: string | null
  contributedAt: string
  createdAt: string
}

interface GoalDto {
  id: string
  name: string
  targetAmount: number | string
  currentAmount: number | string
  percentage: number | string
  targetDate: string
  phase: BackendPhase
  status: BackendStatus
  contributions: GoalContributionDto[]
  createdAt: string
  updatedAt: string
}

interface GoalPayload {
  name?: string
  targetAmount?: number
  currentAmount?: number
  targetDate?: string
  phase?: BackendPhase
  status?: BackendStatus
}

interface ProjectionDto {
  points: Array<{ date: string; cumulativeAmount: number | string }>
  markers: Array<{ date: string; label: string }>
}

/** The plan's four phases, in the same order both sides list them. */
const PHASES: Record<BackendPhase, GoalPhase> = {
  PHASE_1_DEBT_CONTROL: 'urgent',
  PHASE_2_OPTIMIZATION: 'short_term',
  PHASE_3_VEHICLE_PURCHASE: 'medium_term',
  PHASE_4_CONSOLIDATION: 'long_term',
}

const BACKEND_PHASES: Record<GoalPhase, BackendPhase> = {
  urgent: 'PHASE_1_DEBT_CONTROL',
  short_term: 'PHASE_2_OPTIMIZATION',
  medium_term: 'PHASE_3_VEHICLE_PURCHASE',
  long_term: 'PHASE_4_CONSOLIDATION',
}

const STATUSES: Record<BackendStatus, GoalStatus> = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PAUSED: 'paused',
}

const BACKEND_STATUSES: Record<GoalStatus, BackendStatus> = {
  active: 'ACTIVE',
  completed: 'COMPLETED',
  paused: 'PAUSED',
}

function toContribution(dto: GoalContributionDto): GoalContribution {
  return {
    id: dto.id,
    amount: toAmount(dto.amount),
    date: dto.contributedAt,
    ...(dto.note ? { note: dto.note } : {}),
  }
}

function toGoal(dto: GoalDto): Goal {
  return {
    id: dto.id,
    name: dto.name,
    targetAmount: toAmount(dto.targetAmount),
    currentAmount: toAmount(dto.currentAmount),
    phase: PHASES[dto.phase] ?? 'short_term',
    status: STATUSES[dto.status] ?? 'active',
    ...(dto.targetDate ? { targetDate: dto.targetDate } : {}),
    contributions: (dto.contributions ?? []).map(toContribution),
    createdAt: dto.createdAt,
  }
}

function defaultTargetDate(): string {
  const date = new Date()
  date.setMonth(date.getMonth() + DEFAULT_TARGET_MONTHS)
  return date.toISOString()
}

function toPayload(input: UpdateGoalInput): GoalPayload {
  return {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.targetAmount !== undefined
      ? { targetAmount: input.targetAmount }
      : {}),
    ...(input.currentAmount !== undefined
      ? { currentAmount: input.currentAmount }
      : {}),
    ...(input.targetDate !== undefined ? { targetDate: input.targetDate } : {}),
    ...(input.phase !== undefined
      ? { phase: BACKEND_PHASES[input.phase] }
      : {}),
    ...(input.status !== undefined
      ? { status: BACKEND_STATUSES[input.status] }
      : {}),
  }
}

/** Whole months from one period key to another, negative when it is in the past. */
function monthsBetween(from: string, to: string): number {
  const [fromYear = 0, fromMonth = 1] = from.split('-').map(Number)
  const [toYear = 0, toMonth = 1] = to.split('-').map(Number)
  return (toYear - fromYear) * 12 + (toMonth - fromMonth)
}

/**
 * What the plan has been setting aside per month, averaged over the history of
 * contributions the API returns. It is the only rate available: the backend
 * stores no planned contribution of its own.
 */
function inferMonthlyContribution(points: ProjectionDto['points']): number {
  const first = points[0]
  const last = points[points.length - 1]
  if (!first || !last) {
    return 0
  }

  const total = toAmount(last.cumulativeAmount)
  const span =
    monthsBetween(
      toMonthKey(new Date(first.date)),
      toMonthKey(new Date(last.date)),
    ) + 1

  return span > 0 ? Math.round(total / span) : total
}

/**
 * Reaching a goal takes the money back out of the pot, so a target date bends
 * the curve downwards by the goal's target amount. Goals that fall on the same
 * period are merged, since a point carries a single event.
 */
function toEventsByMonth(
  goals: readonly Goal[],
): Record<string, SavingsProjectionEvent> {
  return goals.reduce<Record<string, SavingsProjectionEvent>>(
    (events, goal) => {
      if (!goal.targetDate) {
        return events
      }

      const month = toMonthKey(new Date(goal.targetDate))
      const existing = events[month]

      events[month] = existing
        ? {
            ...existing,
            label: `${existing.label} +1`,
            amount: existing.amount - goal.targetAmount,
          }
        : {
            id: goal.id,
            label: goal.name,
            amount: -goal.targetAmount,
            kind: 'outflow',
          }

      return events
    },
    {},
  )
}

class HttpGoalRepository implements GoalRepository {
  async list(): Promise<Goal[]> {
    const response = await httpClient.get<GoalDto[]>(BASE_PATH)
    return response.data.map(toGoal)
  }

  async getById(id: string): Promise<Goal | null> {
    try {
      const response = await httpClient.get<GoalDto>(`${BASE_PATH}/${id}`)
      return toGoal(response.data)
    } catch (error) {
      if (isNotFoundError(error)) {
        return null
      }
      throw error
    }
  }

  async create(input: CreateGoalInput): Promise<Goal> {
    // The API requires a target date; the form leaves it optional.
    const response = await httpClient.post<GoalDto>(BASE_PATH, {
      ...toPayload(input),
      targetDate: input.targetDate ?? defaultTargetDate(),
    })
    return toGoal(response.data)
  }

  async update(id: string, input: UpdateGoalInput): Promise<Goal> {
    const response = await httpClient.patch<GoalDto>(
      `${BASE_PATH}/${id}`,
      toPayload(input),
    )
    return toGoal(response.data)
  }

  async remove(id: string): Promise<void> {
    await httpClient.delete(`${BASE_PATH}/${id}`)
  }

  async addContribution(input: AddGoalContributionInput): Promise<Goal> {
    // The API timestamps the contribution itself, so `date` is not sent.
    const response = await httpClient.post<GoalDto>(
      `${BASE_PATH}/${input.goalId}/contributions`,
      {
        amount: input.amount,
        ...(input.note ? { note: input.note } : {}),
      },
    )
    return toGoal(response.data)
  }

  /**
   * The API reports the savings history — the cumulative curve of every
   * contribution — while the card ahead of it needs a month-by-month forecast.
   * So the past sets the pace and the goals set the shape: the curve starts at
   * what is saved today, climbs by the average monthly contribution, and drops
   * when a goal comes due.
   */
  async getSavingsProjection(
    months = DEFAULT_PROJECTION_MONTHS,
  ): Promise<SavingsProjection> {
    const [history, goals] = await Promise.all([
      httpClient.get<ProjectionDto>(PROJECTION_PATH),
      this.list(),
    ])

    const open = goals.filter(goal => goal.status !== 'completed')
    const monthlyContribution = inferMonthlyContribution(
      history.data.points ?? [],
    )
    const eventsByMonth = toEventsByMonth(open)

    const startMonth = getCurrentMonthKey()
    let amount = goals.reduce((total, goal) => total + goal.currentAmount, 0)

    const points: SavingsProjectionPoint[] = []
    for (let offset = 0; offset < months; offset += 1) {
      const month = shiftMonthKey(startMonth, offset)
      const event = eventsByMonth[month]

      if (offset > 0) {
        amount += monthlyContribution
      }
      if (event) {
        amount += event.amount
      }

      points.push({
        month,
        amount,
        ...(event ? { event } : {}),
      })
    }

    return {
      points,
      monthlyContribution,
      targetAmount: open.reduce((total, goal) => total + goal.targetAmount, 0),
    }
  }
}

export const httpGoalRepository: GoalRepository = new HttpGoalRepository()
