import type { ListBudgetsParams } from '@/api/repositories/interfaces/BudgetRepository'
import type { ListCategoriesParams } from '@/api/repositories/interfaces/CategoryRepository'
import type { ListTransactionsParams } from '@/api/repositories/interfaces/TransactionRepository'

export const queryKeys = {
  transactionsRoot: ['transactions'] as const,
  transactions: (params?: ListTransactionsParams) =>
    ['transactions', params ?? {}] as const,
  // Nested under the transactions root so any write refreshes the detail too.
  transaction: (id: string) => ['transactions', 'detail', id] as const,
  budgetsRoot: ['budgets'] as const,
  budgets: (params?: ListBudgetsParams) => ['budgets', params ?? {}] as const,
  categories: (params?: ListCategoriesParams) =>
    ['categories', params ?? {}] as const,
  accounts: () => ['accounts'] as const,
  // Nested under the goals root so invalidating goals refreshes the projection.
  goals: () => ['goals'] as const,
  goal: (id: string) => ['goals', 'detail', id] as const,
  savingsProjection: (months?: number) =>
    ['goals', 'savings-projection', months ?? null] as const,
  reportsRoot: ['reports'] as const,
  report: (month: string) => ['reports', month] as const,
  recurringExpensesRoot: ['recurring-expenses'] as const,
  recurringExpenses: () => ['recurring-expenses'] as const,
  // Nested under the root so a write to any recurring expense refreshes it too.
  pendingRecurringExpenses: (month: string) =>
    ['recurring-expenses', 'pending', month] as const,
  settings: () => ['settings'] as const,
  alertsRoot: ['alerts'] as const,
  alerts: (unreadOnly?: boolean) =>
    ['alerts', { unreadOnly: unreadOnly ?? false }] as const,
  // Nested under the root so marking one or all as read refreshes it too.
  unreadAlertsCount: () => ['alerts', 'unread-count'] as const,
  loansRoot: ['loans'] as const,
  loans: () => ['loans'] as const,
  // Nested under the root so a write to any loan refreshes the detail too.
  loan: (id: string) => ['loans', 'detail', id] as const,
}
