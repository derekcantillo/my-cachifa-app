import type { CategoryExpenseShare, MonthlyReport } from '../../types/report'
import type { Transaction, TransactionKind } from '../../types/transaction'
import type { ReportRepository } from '../interfaces/ReportRepository'
import { mockBudgetRepository } from './MockBudgetRepository'
import { mockTransactionRepository } from './MockTransactionRepository'
import { simulateLatency } from './latency'
import { seedCategories } from './seed-data'

function sumByKind(transactions: Transaction[], kind: TransactionKind): number {
  return transactions
    .filter(transaction => transaction.kind === kind)
    .reduce((sum, transaction) => sum + transaction.amount, 0)
}

function sumExpenseByCategory(
  transactions: Transaction[],
): Record<string, number> {
  return transactions
    .filter(transaction => transaction.kind === 'expense')
    .reduce<Record<string, number>>((totals, transaction) => {
      totals[transaction.categoryId] =
        (totals[transaction.categoryId] ?? 0) + transaction.amount
      return totals
    }, {})
}

function countByCategory(transactions: Transaction[]): Record<string, number> {
  return transactions.reduce<Record<string, number>>((counts, transaction) => {
    counts[transaction.categoryId] = (counts[transaction.categoryId] ?? 0) + 1
    return counts
  }, {})
}

function pickHighestKey(totals: Record<string, number>): string | null {
  return Object.entries(totals).reduce<string | null>(
    (topKey, [key, value]) => {
      if (!topKey) return key
      const topValue = totals[topKey] ?? 0
      return value > topValue ? key : topKey
    },
    null,
  )
}

class MockReportRepository implements ReportRepository {
  async getMonthlyReport(month: string): Promise<MonthlyReport> {
    await simulateLatency()

    const [transactions, budgets] = await Promise.all([
      mockTransactionRepository.list({ month }),
      mockBudgetRepository.list({ month }),
    ])

    const totalIncome = sumByKind(transactions, 'income')
    const totalExpense = sumByKind(transactions, 'expense')
    const actualSaving = sumByKind(transactions, 'saving')

    const savingCategoryId =
      seedCategories.find(category => category.kind === 'saving')?.id ?? null
    const plannedSaving =
      budgets.find(budget => budget.categoryId === savingCategoryId)
        ?.monthlyLimit ?? 0

    const expenseByCategory = sumExpenseByCategory(transactions)
    const expenseDistribution: CategoryExpenseShare[] = Object.entries(
      expenseByCategory,
    ).map(([categoryId, amount]) => ({
      categoryId,
      amount,
      percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
    }))

    return {
      month,
      totalIncome,
      totalExpense,
      totalSaving: actualSaving,
      topExpenseCategoryId: pickHighestKey(expenseByCategory),
      mostFrequentCategoryId: pickHighestKey(countByCategory(transactions)),
      plannedSaving,
      actualSaving,
      expenseDistribution,
    }
  }
}

export const mockReportRepository: ReportRepository = new MockReportRepository()
