import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import { budgetRepository } from '@/api/repositoryFactory'
import type { ListBudgetsParams } from '@/api/repositories/interfaces/BudgetRepository'
import type { Budget } from '@/api/types'
import type { MonthKey } from '@/utils'
import { queryKeys } from './queryKeys'

export function useBudgets(params?: ListBudgetsParams) {
  return useQuery({
    queryKey: queryKeys.budgets(params),
    queryFn: () => budgetRepository.list(params),
  })
}

/**
 * The expenses screen reads budgets directly and the monthly report derives its
 * planned saving from them, so a write refreshes both.
 */
function invalidateBudgetConsumers(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: queryKeys.budgetsRoot })
  queryClient.invalidateQueries({ queryKey: queryKeys.reportsRoot })
}

export interface BudgetLimitInput {
  categoryId: string
  monthlyLimit: number
  /** Id of the existing budget, when the category already has one this period. */
  budgetId?: string
}

export interface UpdateBudgetsVariables {
  month: MonthKey
  limits: BudgetLimitInput[]
}

function applyLimit(
  month: MonthKey,
  { budgetId, categoryId, monthlyLimit }: BudgetLimitInput,
): Promise<Budget | void> {
  if (budgetId === undefined) {
    // A category with no limit and no budget yet has nothing to save.
    return monthlyLimit > 0
      ? budgetRepository.create({ categoryId, monthlyLimit, month })
      : Promise.resolve()
  }

  // Clearing a limit to zero drops the budget rather than keeping an empty one.
  return monthlyLimit > 0
    ? budgetRepository.update(budgetId, { monthlyLimit })
    : budgetRepository.remove(budgetId)
}

/**
 * Saves a whole month of limits at once: existing ones are updated, new
 * categories get a budget created, and a limit cleared to zero is removed.
 * The screen passes only the rows the user actually touched.
 */
export function useUpdateBudgets() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      month,
      limits,
    }: UpdateBudgetsVariables): Promise<void> => {
      await Promise.all(limits.map(limit => applyLimit(month, limit)))
    },
    onSuccess: () => {
      invalidateBudgetConsumers(queryClient)
    },
  })
}

/** Clears every limit set for a period, so the month can be planned from scratch. */
export function useResetBudgets() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (month: MonthKey): Promise<void> => {
      const budgets = await budgetRepository.list({ month })
      await Promise.all(
        budgets.map(budget => budgetRepository.remove(budget.id)),
      )
    },
    onSuccess: () => {
      invalidateBudgetConsumers(queryClient)
    },
  })
}
