import { useQuery } from '@tanstack/react-query'
import { goalRepository } from '@/api/repositoryFactory'
import { queryKeys } from './queryKeys'

export function useGoals() {
  return useQuery({
    queryKey: queryKeys.goals(),
    queryFn: () => goalRepository.list(),
  })
}

/** @param months How many periods to project, the current one included. */
export function useSavingsProjection(months?: number) {
  return useQuery({
    queryKey: queryKeys.savingsProjection(months),
    queryFn: () => goalRepository.getSavingsProjection(months),
  })
}
