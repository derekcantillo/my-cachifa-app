import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import { goalRepository } from '@/api/repositoryFactory'
import type {
  AddGoalContributionInput,
  CreateGoalInput,
  UpdateGoalInput,
} from '@/api/types'
import { queryKeys } from './queryKeys'

/**
 * The goals key is the root of the list, the detail and the savings
 * projection, so invalidating it refreshes the goals screen and the dashboard
 * carousel in one go. What the goals hold counts towards net worth, so that
 * refreshes too.
 */
function invalidateGoalConsumers(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: queryKeys.goals() })
  queryClient.invalidateQueries({ queryKey: queryKeys.netWorth() })
}

export function useCreateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateGoalInput) => goalRepository.create(input),
    onSuccess: () => {
      invalidateGoalConsumers(queryClient)
    },
  })
}

export interface UpdateGoalVariables {
  id: string
  input: UpdateGoalInput
}

export function useUpdateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: UpdateGoalVariables) =>
      goalRepository.update(id, input),
    onSuccess: () => {
      invalidateGoalConsumers(queryClient)
    },
  })
}

export function useDeleteGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => goalRepository.remove(id),
    onSuccess: () => {
      invalidateGoalConsumers(queryClient)
    },
  })
}

/** Logs money set aside towards a goal, which also moves its progress. */
export function useAddGoalContribution() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AddGoalContributionInput) =>
      goalRepository.addContribution(input),
    onSuccess: () => {
      invalidateGoalConsumers(queryClient)
    },
  })
}
