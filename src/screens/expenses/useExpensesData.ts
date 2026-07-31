import { useMemo } from 'react'
import type {
  Budget,
  Category,
  Transaction,
  TransactionKind,
} from '@/api/types'
import { useBudgets, useCategories, useTransactions } from '@/hooks'
import {
  indexById,
  sortByDateDesc,
  sumExpensesByCategory,
  type MonthKey,
} from '@/utils'

/** 'all' keeps every kind; the rest map straight onto the repository filter. */
export type KindFilter = TransactionKind | 'all'

export interface ExpenseFilters {
  month: MonthKey
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
  isBudgetsLoading: boolean
  isTransactionsLoading: boolean
  isError: boolean
  refetch: () => void
}

export function useExpensesData(filters: ExpenseFilters): ExpensesData {
  const { month, kind, categoryId } = filters

  const budgetsQuery = useBudgets({ month })
  const categoriesQuery = useCategories()

  // Budget progress always reflects the whole month, independent of the list filter.
  const monthTransactionsQuery = useTransactions({ month })
  const filteredTransactionsQuery = useTransactions({
    month,
    ...(kind === 'all' ? {} : { kind }),
    ...(categoryId ? { categoryId } : {}),
  })

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

  return {
    budgetRows,
    transactions,
    categoriesById,
    filterableCategories,
    isBudgetsLoading:
      budgetsQuery.isPending ||
      categoriesQuery.isPending ||
      monthTransactionsQuery.isPending,
    isTransactionsLoading:
      filteredTransactionsQuery.isPending || categoriesQuery.isPending,
    isError:
      budgetsQuery.isError ||
      categoriesQuery.isError ||
      monthTransactionsQuery.isError ||
      filteredTransactionsQuery.isError,
    refetch: () => {
      budgetsQuery.refetch()
      categoriesQuery.refetch()
      monthTransactionsQuery.refetch()
      filteredTransactionsQuery.refetch()
    },
  }
}
