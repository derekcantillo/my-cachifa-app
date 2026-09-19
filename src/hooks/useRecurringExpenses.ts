import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import { recurringExpenseRepository } from '@/api/repositoryFactory'
import type {
  CreateRecurringExpenseInput,
  UpdateRecurringExpenseInput,
} from '@/api/types'
import { queryKeys } from './queryKeys'

export function useRecurringExpenses() {
  return useQuery({
    queryKey: queryKeys.recurringExpenses(),
    queryFn: () => recurringExpenseRepository.getAll(),
  })
}

/** Waits (stays pending) until a `periodId` is known. */
export function usePendingRecurringExpenses(periodId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.pendingRecurringExpenses(periodId ?? ''),
    queryFn: () => recurringExpenseRepository.getPending(periodId ?? ''),
    enabled: periodId !== undefined,
  })
}

/**
 * The backend recalculates the current period's budgets whenever a recurring
 * expense is created, edited or deleted, so a write here has to refresh
 * budgets too, not just the recurring-expenses list.
 */
function invalidateRecurringExpenseConsumers(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: queryKeys.recurringExpensesRoot })
  queryClient.invalidateQueries({ queryKey: queryKeys.budgetsRoot })
}

export function useCreateRecurringExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateRecurringExpenseInput) =>
      recurringExpenseRepository.create(input),
    onSuccess: () => {
      invalidateRecurringExpenseConsumers(queryClient)
    },
  })
}

export interface UpdateRecurringExpenseVariables {
  id: string
  input: UpdateRecurringExpenseInput
}

export function useUpdateRecurringExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: UpdateRecurringExpenseVariables) =>
      recurringExpenseRepository.update(id, input),
    onSuccess: () => {
      invalidateRecurringExpenseConsumers(queryClient)
    },
  })
}

export function useDeleteRecurringExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => recurringExpenseRepository.delete(id),
    onSuccess: () => {
      invalidateRecurringExpenseConsumers(queryClient)
    },
  })
}
