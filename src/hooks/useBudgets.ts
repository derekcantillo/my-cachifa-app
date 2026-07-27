import { useQuery } from '@tanstack/react-query'
import { budgetRepository } from '@/api/repositoryFactory'
import type { ListBudgetsParams } from '@/api/repositories/interfaces/BudgetRepository'
import { queryKeys } from './queryKeys'

export function useBudgets(params?: ListBudgetsParams) {
  return useQuery({
    queryKey: queryKeys.budgets(params),
    queryFn: () => budgetRepository.list(params),
  })
}
