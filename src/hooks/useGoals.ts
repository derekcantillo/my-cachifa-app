import { useQuery } from '@tanstack/react-query'
import { goalRepository } from '@/api/repositoryFactory'
import { queryKeys } from './queryKeys'

export function useGoals() {
  return useQuery({
    queryKey: queryKeys.goals(),
    queryFn: () => goalRepository.list(),
  })
}

/**
 * A single goal, for the detail screen. Resolves to `null` when it is gone.
 * Pass `enabled: false` on the create path, where there is nothing to load yet.
 */
export function useGoal(id: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.goal(id),
    queryFn: () => goalRepository.getById(id),
    enabled: options.enabled ?? true,
  })
}

/** @param months How many periods to project, the current one included. */
export function useSavingsProjection(months?: number) {
  return useQuery({
    queryKey: queryKeys.savingsProjection(months),
    queryFn: () => goalRepository.getSavingsProjection(months),
  })
}
