import { API_MODE } from '@env'
import { env } from '@/config/env'
// Offline development only. `my-cachifa-backend` is the real source of truth
// and `http` is the default mode; these in-memory repositories exist so the
// app can be worked on with no backend (or no network) reachable, and to give
// the data-layer tests a deterministic fixture. Nothing ships against them:
// they hold seed data that never leaves the device, so any figure they show is
// fiction. Reaching them takes an explicit `API_MODE=mock`.
import {
  mockAccountRepository,
  mockAlertRepository,
  mockBudgetRepository,
  mockCategoryRepository,
  mockGoalRepository,
  mockLoanRepository,
  mockRecurringExpenseRepository,
  mockReportRepository,
  mockSettingsRepository,
  mockTransactionRepository,
} from './repositories/mock'
import {
  httpAccountRepository,
  httpAlertRepository,
  httpBudgetRepository,
  httpCategoryRepository,
  httpGoalRepository,
  httpLoanRepository,
  httpRecurringExpenseRepository,
  httpReportRepository,
  httpSettingsRepository,
  httpTransactionRepository,
} from './repositories/http'
import type {
  AccountRepository,
  AlertRepository,
  BudgetRepository,
  CategoryRepository,
  GoalRepository,
  LoanRepository,
  RecurringExpenseRepository,
  ReportRepository,
  SettingsRepository,
  TransactionRepository,
} from './repositories/interfaces'

export type ApiMode = 'mock' | 'http'

/**
 * The real API is the default: serving mock data is a deliberate choice, never
 * something you land on by leaving `API_MODE` out or misspelling it. Silently
 * falling back to the mocks is the one failure that looks like success — the
 * app renders fine, with numbers that belong to nobody.
 */
export function resolveApiMode(): ApiMode {
  // Trimmed and lowercased because `.env` is hand-edited by a person.
  const configured = API_MODE?.trim().toLowerCase()

  if (configured === 'mock') {
    return 'mock'
  }

  if (env.isDev && configured !== 'http') {
    console.warn(
      `[api] API_MODE=${JSON.stringify(
        API_MODE,
      )} is not 'http' or 'mock' — using 'http'.`,
    )
  }

  return 'http'
}

const apiMode = resolveApiMode()

if (env.isDev) {
  // `.env` is inlined at bundle time by react-native-dotenv, and Metro does not
  // invalidate its transform cache when the file changes — so editing API_MODE
  // without `pnpm start --reset-cache` leaves the old value baked into the
  // bundle. This line says which one actually shipped.
  // eslint-disable-next-line no-console
  console.log(
    `[api] target=${env.buildTarget} mode=${apiMode}${
      apiMode === 'http' ? ` baseURL=${env.apiBaseUrl}` : ''
    }`,
  )
}

export const transactionRepository: TransactionRepository =
  apiMode === 'http' ? httpTransactionRepository : mockTransactionRepository

export const budgetRepository: BudgetRepository =
  apiMode === 'http' ? httpBudgetRepository : mockBudgetRepository

export const categoryRepository: CategoryRepository =
  apiMode === 'http' ? httpCategoryRepository : mockCategoryRepository

export const goalRepository: GoalRepository =
  apiMode === 'http' ? httpGoalRepository : mockGoalRepository

export const reportRepository: ReportRepository =
  apiMode === 'http' ? httpReportRepository : mockReportRepository

export const accountRepository: AccountRepository =
  apiMode === 'http' ? httpAccountRepository : mockAccountRepository

export const recurringExpenseRepository: RecurringExpenseRepository =
  apiMode === 'http'
    ? httpRecurringExpenseRepository
    : mockRecurringExpenseRepository

export const settingsRepository: SettingsRepository =
  apiMode === 'http' ? httpSettingsRepository : mockSettingsRepository

export const alertRepository: AlertRepository =
  apiMode === 'http' ? httpAlertRepository : mockAlertRepository

export const loanRepository: LoanRepository =
  apiMode === 'http' ? httpLoanRepository : mockLoanRepository
