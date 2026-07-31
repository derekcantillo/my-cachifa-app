import { httpClient } from '../../httpClient'
import { toAmount, toPercentage } from '../../mappers/decimalMapper'
import {
  toCategoryId,
  type BackendCategory,
} from '../../mappers/categoryMapper'
import type { CategoryExpenseShare, MonthlyReport } from '../../types/report'
import type { ReportRepository } from '../interfaces/ReportRepository'
import { httpTransactionRepository } from './HttpTransactionRepository'

const SUMMARY_PATH = '/reports/summary'
const DISTRIBUTION_PATH = '/reports/distribution'

interface SummaryDto {
  biggestExpense: {
    category: BackendCategory
    amount: number | string
  } | null
  savingsProgress: {
    actual: number | string
    planned: number | string
    percentage: number | string
  }
  mostFrequentCategory: {
    category: BackendCategory
    count: number
  } | null
}

interface DistributionItemDto {
  category: BackendCategory
  amount: number | string
  percentage: number | string
}

function toShare(dto: DistributionItemDto): CategoryExpenseShare {
  return {
    categoryId: toCategoryId(dto.category),
    amount: toAmount(dto.amount),
    percentage: toPercentage(dto.percentage),
  }
}

/**
 * The month's report as the screen wants it, composed from the two period
 * endpoints the API exposes. Totals it does not report are derived here:
 * spending from the distribution it just sent, and income from the month's
 * movements, which the query cache is holding anyway for the other screens.
 */
class HttpReportRepository implements ReportRepository {
  async getMonthlyReport(month: string): Promise<MonthlyReport> {
    const [summary, distribution, income] = await Promise.all([
      httpClient.get<SummaryDto>(SUMMARY_PATH, { params: { month } }),
      httpClient.get<DistributionItemDto[]>(DISTRIBUTION_PATH, {
        params: { month },
      }),
      httpTransactionRepository.list({ month, kind: 'income' }),
    ])

    const expenseDistribution = distribution.data.map(toShare)
    const { biggestExpense, savingsProgress, mostFrequentCategory } =
      summary.data

    const actualSaving = toAmount(savingsProgress?.actual)

    return {
      month,
      totalIncome: income.reduce(
        (total, transaction) => total + transaction.amount,
        0,
      ),
      totalExpense: expenseDistribution.reduce(
        (total, share) => total + share.amount,
        0,
      ),
      totalSaving: actualSaving,
      topExpenseCategoryId: biggestExpense
        ? toCategoryId(biggestExpense.category)
        : null,
      mostFrequentCategoryId: mostFrequentCategory
        ? toCategoryId(mostFrequentCategory.category)
        : null,
      plannedSaving: toAmount(savingsProgress?.planned),
      actualSaving,
      expenseDistribution,
    }
  }
}

export const httpReportRepository: ReportRepository = new HttpReportRepository()
