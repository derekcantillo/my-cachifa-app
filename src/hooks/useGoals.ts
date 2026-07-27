import { useQuery } from '@tanstack/react-query'
import { goalRepository } from '@/api/repositoryFactory'
import { queryKeys } from './queryKeys'

export function useGoals() {
  return useQuery({
    queryKey: queryKeys.goals(),
    queryFn: () => goalRepository.list(),
  })
}
