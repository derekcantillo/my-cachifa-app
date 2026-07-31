export type GoalPhase = 'urgent' | 'short_term' | 'medium_term' | 'long_term'

export type GoalStatus = 'active' | 'completed' | 'paused'

export interface GoalContribution {
  id: string
  amount: number
  /** ISO 8601. The API calls this `contributedAt`. */
  date: string
  /** The API sends `null` for a contribution with no note; here it is absent. */
  note?: string
}

export interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  phase: GoalPhase
  status: GoalStatus
  targetDate?: string
  contributions: GoalContribution[]
  createdAt: string
}

export interface CreateGoalInput {
  name: string
  targetAmount: number
  phase: GoalPhase
  targetDate?: string
  /** Amount already saved towards the goal when it is created. Defaults to 0. */
  currentAmount?: number
  /** Defaults to 'active'. */
  status?: GoalStatus
}

export type UpdateGoalInput = Partial<CreateGoalInput> & { status?: GoalStatus }

export interface AddGoalContributionInput {
  goalId: string
  amount: number
  date?: string
  note?: string
}

/** What makes a projected period jump: money in, money out, or a goal reached. */
export type ProjectionEventKind = 'inflow' | 'outflow' | 'milestone'

export interface SavingsProjectionEvent {
  id: string
  /** Shown as the marker on the projection chart, e.g. 'Venta del carro'. */
  label: string
  /** Signed impact on the accumulated amount. */
  amount: number
  kind: ProjectionEventKind
}

export interface SavingsProjectionPoint {
  /** Period the point closes, formatted 'YYYY-MM'. */
  month: string
  /** Savings accumulated across every goal by the end of the period. */
  amount: number
  /** Set when something out of the ordinary lands on this period. */
  event?: SavingsProjectionEvent
}

/** Accumulated-savings curve for the coming periods, with the events that bend it. */
export interface SavingsProjection {
  /** Chronological, starting at the current period. */
  points: SavingsProjectionPoint[]
  /** Recurring amount the plan sets aside each period, before events. */
  monthlyContribution: number
  /** Sum of every open goal's target — what the curve is climbing towards. */
  targetAmount: number
}
