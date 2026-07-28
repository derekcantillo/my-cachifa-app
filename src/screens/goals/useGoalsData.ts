import { useMemo } from 'react'
import type { Goal, SavingsProjection } from '@/api/types'
import { PHASE_ORDER } from '@/components/goals/phases'
import { useGoals, useSavingsProjection } from '@/hooks'

/** How far ahead the savings projection card looks. */
export const PROJECTION_MONTHS = 12

export interface GoalsData {
  /** Open goals first, then completed ones, each block ordered by phase. */
  goals: Goal[]
  totalSaved: number
  totalTarget: number
  projection: SavingsProjection | undefined
  isLoading: boolean
  isProjectionLoading: boolean
  isError: boolean
  refetch: () => void
}

/** Most urgent phase first, and goals already met pushed to the bottom. */
function sortForList(goals: readonly Goal[]): Goal[] {
  return [...goals].sort((a, b) => {
    const aDone = a.status === 'completed'
    const bDone = b.status === 'completed'
    if (aDone !== bDone) {
      return aDone ? 1 : -1
    }
    return PHASE_ORDER.indexOf(a.phase) - PHASE_ORDER.indexOf(b.phase)
  })
}

/**
 * Feeds the goals screen: the goal list itself plus the savings projection
 * behind the chart. Every figure comes from the repository hooks.
 */
export function useGoalsData(): GoalsData {
  const goalsQuery = useGoals()
  const projectionQuery = useSavingsProjection(PROJECTION_MONTHS)

  const goals = useMemo(
    () => sortForList(goalsQuery.data ?? []),
    [goalsQuery.data],
  )

  const totals = useMemo(
    () =>
      goals.reduce(
        (accumulated, goal) => ({
          saved: accumulated.saved + goal.currentAmount,
          target: accumulated.target + goal.targetAmount,
        }),
        { saved: 0, target: 0 },
      ),
    [goals],
  )

  return {
    goals,
    totalSaved: totals.saved,
    totalTarget: totals.target,
    projection: projectionQuery.data,
    isLoading: goalsQuery.isPending,
    isProjectionLoading: projectionQuery.isPending,
    isError: goalsQuery.isError || projectionQuery.isError,
    refetch: () => {
      goalsQuery.refetch()
      projectionQuery.refetch()
    },
  }
}
