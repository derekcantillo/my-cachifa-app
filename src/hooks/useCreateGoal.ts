import { useMutation, useQueryClient } from '@tanstack/react-query'
import { goalRepository } from '@/api/repositoryFactory'
import type { CreateGoalInput } from '@/api/types'
import { queryKeys } from './queryKeys'

export function useCreateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateGoalInput) => goalRepository.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals() })
    },
  })
}
