import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import { transactionRepository } from '@/api/repositoryFactory'
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
} from '@/api/types'
import { queryKeys } from './queryKeys'

/**
 * The dashboard, the expenses list and the monthly report are all derived from
 * movements, so a write to one refreshes every consumer.
 */
function invalidateTransactionConsumers(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: queryKeys.transactionsRoot })
  queryClient.invalidateQueries({ queryKey: queryKeys.reportsRoot })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateTransactionInput) =>
      transactionRepository.create(input),
    onSuccess: () => {
      invalidateTransactionConsumers(queryClient)
    },
  })
}

export interface UpdateTransactionVariables {
  id: string
  input: UpdateTransactionInput
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: UpdateTransactionVariables) =>
      transactionRepository.update(id, input),
    onSuccess: () => {
      invalidateTransactionConsumers(queryClient)
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => transactionRepository.remove(id),
    onSuccess: () => {
      invalidateTransactionConsumers(queryClient)
    },
  })
}
