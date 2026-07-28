import type { ListBudgetsParams } from '@/api/repositories/interfaces/BudgetRepository'
import type { ListCategoriesParams } from '@/api/repositories/interfaces/CategoryRepository'
import type { ListTransactionsParams } from '@/api/repositories/interfaces/TransactionRepository'

export const queryKeys = {
  transactionsRoot: ['transactions'] as const,
  transactions: (params?: ListTransactionsParams) =>
    ['transactions', params ?? {}] as const,
  budgets: (params?: ListBudgetsParams) => ['budgets', params ?? {}] as const,
  categories: (params?: ListCategoriesParams) =>
    ['categories', params ?? {}] as const,
  // Nested under the goals root so invalidating goals refreshes the projection.
  goals: () => ['goals'] as const,
  savingsProjection: (months?: number) =>
    ['goals', 'savings-projection', months ?? null] as const,
  reportsRoot: ['reports'] as const,
  report: (month: string) => ['reports', month] as const,
}
