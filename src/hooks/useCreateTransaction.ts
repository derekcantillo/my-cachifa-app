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
 * movements, so a write to one refreshes every consumer. An income also makes
 * the backend recalculate that month's `Budget.limitAmount`s, and a movement
 * that links to a `RecurringExpense` changes whether that expense is still
 * pending, so both refresh here too rather than only from their own screens.
 */
function invalidateTransactionConsumers(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: queryKeys.transactionsRoot })
  queryClient.invalidateQueries({ queryKey: queryKeys.reportsRoot })
  queryClient.invalidateQueries({ queryKey: queryKeys.budgetsRoot })
  queryClient.invalidateQueries({ queryKey: queryKeys.recurringExpensesRoot })
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
