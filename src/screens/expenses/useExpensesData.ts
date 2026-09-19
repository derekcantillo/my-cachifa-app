import { useMemo } from 'react'
import type {
  Budget,
  Category,
  Transaction,
  TransactionKind,
} from '@/api/types'
import { useBudgets, useCategories, useTransactions } from '@/hooks'
import { indexById, sortByDateDesc, sumExpensesByCategory } from '@/utils'

/** 'all' keeps every kind; the rest map straight onto the repository filter. */
export type KindFilter = TransactionKind | 'all'

export interface ExpenseFilters {
  /** `undefined` while the current period is still loading. */
  periodId: string | undefined
  kind: KindFilter
  /** `null` means "every category". */
  categoryId: string | null
}

export interface BudgetRow {
  budget: Budget
  category?: Category
  spent: number
}

export interface ExpensesData {
  budgetRows: BudgetRow[]
  transactions: Transaction[]
  categoriesById: Record<string, Category>
  /** Categories offered by the chip filter, narrowed to the selected kind. */
  filterableCategories: Category[]
  /**
   * Whether the period holds any movement at all, ignoring the filters. Tells
   * "nothing registered this period" apart from "the filter excludes it all",
   * which read the same in `transactions` but call for different copy.
   */
  hasMonthMovements: boolean
  isBudgetsLoading: boolean
  isTransactionsLoading: boolean
  isBudgetsError: boolean
  isTransactionsError: boolean
  isError: boolean
  refetch: () => void
}

export function useExpensesData(filters: ExpenseFilters): ExpensesData {
  const { periodId, kind, categoryId } = filters
  const enabled = periodId !== undefined

  const budgetsQuery = useBudgets({ periodId }, { enabled })
  const categoriesQuery = useCategories()

  // Budget progress always reflects the whole period, independent of the list filter.
  const monthTransactionsQuery = useTransactions({ periodId }, { enabled })
  const filteredTransactionsQuery = useTransactions(
    {
      periodId,
      ...(kind === 'all' ? {} : { kind }),
      ...(categoryId ? { categoryId } : {}),
    },
    { enabled },
  )

  const categoriesById = useMemo(
    () => indexById(categoriesQuery.data ?? []),
    [categoriesQuery.data],
  )

  const budgetRows = useMemo<BudgetRow[]>(() => {
    const spentByCategory = sumExpensesByCategory(
      monthTransactionsQuery.data ?? [],
    )

    return (budgetsQuery.data ?? [])
      .map(budget => ({
        budget,
        category: categoriesById[budget.categoryId],
        spent: spentByCategory[budget.categoryId] ?? 0,
      }))
      .filter(row => row.category?.kinds.includes('expense'))
      .sort((a, b) => b.spent - a.spent)
  }, [budgetsQuery.data, categoriesById, monthTransactionsQuery.data])

  const transactions = useMemo(
    () => sortByDateDesc(filteredTransactionsQuery.data ?? []),
    [filteredTransactionsQuery.data],
  )

  const filterableCategories = useMemo(
    () =>
      (categoriesQuery.data ?? []).filter(category =>
        kind === 'all' ? true : category.kinds.includes(kind),
      ),
    [categoriesQuery.data, kind],
  )

  const isBudgetsError =
    budgetsQuery.isError ||
    categoriesQuery.isError ||
    monthTransactionsQuery.isError
  const isTransactionsError =
    filteredTransactionsQuery.isError || categoriesQuery.isError

  return {
    budgetRows,
    transactions,
    categoriesById,
    filterableCategories,
    hasMonthMovements: (monthTransactionsQuery.data ?? []).length > 0,
    isBudgetsLoading:
      budgetsQuery.isPending ||
      categoriesQuery.isPending ||
      monthTransactionsQuery.isPending,
    isTransactionsLoading:
      filteredTransactionsQuery.isPending || categoriesQuery.isPending,
    isBudgetsError,
    isTransactionsError,
    isError: isBudgetsError || isTransactionsError,
    refetch: () => {
      budgetsQuery.refetch()
      categoriesQuery.refetch()
      monthTransactionsQuery.refetch()
      filteredTransactionsQuery.refetch()
    },
  }
}
