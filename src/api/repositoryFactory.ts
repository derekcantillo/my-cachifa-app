import { API_MODE } from '@env'
import {
  mockBudgetRepository,
  mockGoalRepository,
  mockReportRepository,
  mockTransactionRepository,
} from './repositories/mock'
import {
  httpBudgetRepository,
  httpGoalRepository,
  httpReportRepository,
  httpTransactionRepository,
} from './repositories/http'
import type {
  BudgetRepository,
  GoalRepository,
  ReportRepository,
  TransactionRepository,
} from './repositories/interfaces'

export type ApiMode = 'mock' | 'http'

export function resolveApiMode(): ApiMode {
  return API_MODE === 'http' ? 'http' : 'mock'
}

const apiMode = resolveApiMode()

export const transactionRepository: TransactionRepository =
  apiMode === 'http' ? httpTransactionRepository : mockTransactionRepository

export const budgetRepository: BudgetRepository =
  apiMode === 'http' ? httpBudgetRepository : mockBudgetRepository

export const goalRepository: GoalRepository =
  apiMode === 'http' ? httpGoalRepository : mockGoalRepository

export const reportRepository: ReportRepository =
  apiMode === 'http' ? httpReportRepository : mockReportRepository
