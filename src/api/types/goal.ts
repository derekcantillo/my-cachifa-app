export type GoalPhase = 'urgent' | 'short_term' | 'medium_term' | 'long_term'

export type GoalStatus = 'active' | 'completed' | 'paused'

export interface GoalContribution {
  id: string
  amount: number
  date: string
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
}

export type UpdateGoalInput = Partial<CreateGoalInput> & { status?: GoalStatus }

export interface AddGoalContributionInput {
  goalId: string
  amount: number
  date?: string
  note?: string
}
