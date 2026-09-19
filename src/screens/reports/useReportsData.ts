import { useMemo } from 'react'
import type { Category, MonthlyReport } from '@/api/types'
import type { PieChartSlice } from '@/components'
import { useCategories, useReports } from '@/hooks'
import { getCategoryColor } from '@/theme'
import { indexById } from '@/utils'

export interface CategoryInsight {
  category: Category | undefined
  /** Falls back to the raw id when the category is unknown. */
  label: string
  amount: number
  /** Share of the period's expenses, 0-100. */
  percentage: number
}

export interface SavingInsight {
  actual: number
  planned: number
  /** Positive when the period beat the plan. */
  difference: number
  /** Share of the planned amount actually saved, 0-100+. */
  percentOfPlan: number
}

export interface ReportsData {
  report: MonthlyReport | undefined
  /**
   * Whether the period holds any movement at all. Every insight on the screen
   * is derived from them, so with none there is nothing to say four times
   * over — the screen says it once.
   */
  hasMovements: boolean
  /** Biggest single expense category of the period. */
  topExpense: CategoryInsight | null
  /** Category with the most movements, whatever their amount. */
  mostFrequent: CategoryInsight | null
  saving: SavingInsight
  /** Expense split, largest slice first, colored from the fixed category map. */
  distribution: PieChartSlice[]
  totalExpense: number
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

const UNKNOWN_CATEGORY_LABEL = 'Sin categoría'

const EMPTY_SAVING: SavingInsight = {
  actual: 0,
  planned: 0,
  difference: 0,
  percentOfPlan: 0,
}

function toInsight(
  categoryId: string | null,
  categoriesById: Record<string, Category>,
  amountFor: (categoryId: string) => { amount: number; percentage: number },
): CategoryInsight | null {
  if (!categoryId) {
    return null
  }

  const category = categoriesById[categoryId]
  const { amount, percentage } = amountFor(categoryId)

  return {
    category,
    label: category?.name ?? UNKNOWN_CATEGORY_LABEL,
    amount,
    percentage,
  }
}

/**
 * Composes the period's report and the category catalog into the insights and
 * the donut the reports screen draws. Every figure comes from the repository
 * hooks — the screen holds no numbers of its own.
 */
export function useReportsData(periodId: string | undefined): ReportsData {
  const reportQuery = useReports(periodId)
  const categoriesQuery = useCategories()

  const categoriesById = useMemo(
    () => indexById(categoriesQuery.data ?? []),
    [categoriesQuery.data],
  )

  const report = reportQuery.data

  const sharesById = useMemo(
    () =>
      (report?.expenseDistribution ?? []).reduce<
        Record<string, { amount: number; percentage: number }>
      >((index, share) => {
        index[share.categoryId] = {
          amount: share.amount,
          percentage: share.percentage,
        }
        return index
      }, {}),
    [report],
  )

  const amountFor = useMemo(
    () => (categoryId: string) =>
      sharesById[categoryId] ?? { amount: 0, percentage: 0 },
    [sharesById],
  )

  const topExpense = useMemo(
    () =>
      toInsight(
        report?.topExpenseCategoryId ?? null,
        categoriesById,
        amountFor,
      ),
    [amountFor, categoriesById, report],
  )

  const mostFrequent = useMemo(
    () =>
      toInsight(
        report?.mostFrequentCategoryId ?? null,
        categoriesById,
        amountFor,
      ),
    [amountFor, categoriesById, report],
  )

  const saving = useMemo<SavingInsight>(() => {
    if (!report) {
      return EMPTY_SAVING
    }

    return {
      actual: report.actualSaving,
      planned: report.plannedSaving,
      difference: report.actualSaving - report.plannedSaving,
      percentOfPlan:
        report.plannedSaving > 0
          ? (report.actualSaving / report.plannedSaving) * 100
          : 0,
    }
  }, [report])

  const distribution = useMemo<PieChartSlice[]>(
    () =>
      (report?.expenseDistribution ?? [])
        .map(share => {
          const category = categoriesById[share.categoryId]
          return {
            key: share.categoryId,
            label: category?.name ?? UNKNOWN_CATEGORY_LABEL,
            value: share.amount,
            color: getCategoryColor(category ?? { id: share.categoryId }),
          }
        })
        .sort((a, b) => b.value - a.value),
    [categoriesById, report],
  )

  return {
    report,
    hasMovements: Boolean(
      report &&
        (report.totalIncome > 0 ||
          report.totalExpense > 0 ||
          report.totalSaving > 0 ||
          report.mostFrequentCategoryId !== null),
    ),
    topExpense,
    mostFrequent,
    saving,
    distribution,
    totalExpense: report?.totalExpense ?? 0,
    isLoading: reportQuery.isPending || categoriesQuery.isPending,
    isError: reportQuery.isError || categoriesQuery.isError,
    refetch: () => {
      reportQuery.refetch()
      categoriesQuery.refetch()
    },
  }
}
