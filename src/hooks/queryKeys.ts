import type { ListBudgetsParams } from '@/api/repositories/interfaces/BudgetRepository'
import type { ListTransactionsParams } from '@/api/repositories/interfaces/TransactionRepository'

export const queryKeys = {
  transactionsRoot: ['transactions'] as const,
  transactions: (params?: ListTransactionsParams) =>
    ['transactions', params ?? {}] as const,
  budgets: (params?: ListBudgetsParams) => ['budgets', params ?? {}] as const,
  goals: () => ['goals'] as const,
  reportsRoot: ['reports'] as const,
  report: (month: string) => ['reports', month] as const,
}
