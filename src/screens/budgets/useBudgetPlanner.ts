import { useCallback, useMemo, useState } from 'react'
import type { Budget, Category } from '@/api/types'
import { useBudgets, useCategories } from '@/hooks'
import type { BudgetLimitInput } from '@/hooks'
import type { MonthKey } from '@/utils'

export interface BudgetPlanRow {
  category: Category
  /** Existing budget for the period, when the category already has one. */
  budgetId?: string
  /** Limit as saved. */
  savedLimit: number
  /** Limit as currently edited on screen. */
  limit: number
}

export interface BudgetPlan {
  /** Rows for spending categories, the ones that make up the monthly limit. */
  expenseRows: BudgetPlanRow[]
  /** Saving targets, kept apart because they are not money to spend. */
  savingRows: BudgetPlanRow[]
  /** Live sum of the edited expense limits. */
  totalPlanned: number
  /** Live sum of the edited saving targets. */
  totalSaving: number
  hasChanges: boolean
  isLoading: boolean
  isError: boolean
  setLimit: (categoryId: string, limit: number) => void
  /** Drops every local edit, back to what is saved. */
  discardChanges: () => void
  /** Only the rows that actually changed, ready for the batch mutation. */
  changedLimits: () => BudgetLimitInput[]
}

function buildRows(
  categories: readonly Category[],
  budgetsByCategory: Record<string, Budget>,
  edits: Record<string, number>,
): BudgetPlanRow[] {
  return categories.map(category => {
    const budget = budgetsByCategory[category.id]
    const savedLimit = budget?.monthlyLimit ?? 0

    return {
      category,
      ...(budget ? { budgetId: budget.id } : {}),
      savedLimit,
      limit: edits[category.id] ?? savedLimit,
    }
  })
}

function sumLimits(rows: readonly BudgetPlanRow[]): number {
  return rows.reduce((total, row) => total + row.limit, 0)
}

/**
 * Editable plan for a period: every category the user can budget for, with the
 * limits they have typed layered over what is saved. Nothing is written until
 * the screen asks for `changedLimits`.
 */
export function useBudgetPlanner(month: MonthKey): BudgetPlan {
  const budgetsQuery = useBudgets({ month })
  const categoriesQuery = useCategories()

  const [edits, setEdits] = useState<Record<string, number>>({})

  const budgetsByCategory = useMemo(() => {
    return (budgetsQuery.data ?? []).reduce<Record<string, Budget>>(
      (index, budget) => {
        index[budget.categoryId] = budget
        return index
      },
      {},
    )
  }, [budgetsQuery.data])

  const categories = useMemo(
    () => categoriesQuery.data ?? [],
    [categoriesQuery.data],
  )

  const expenseRows = useMemo(
    () =>
      buildRows(
        categories.filter(category => category.kind === 'expense'),
        budgetsByCategory,
        edits,
      ),
    [budgetsByCategory, categories, edits],
  )

  const savingRows = useMemo(
    () =>
      buildRows(
        categories.filter(category => category.kind === 'saving'),
        budgetsByCategory,
        edits,
      ),
    [budgetsByCategory, categories, edits],
  )

  const setLimit = useCallback((categoryId: string, limit: number) => {
    setEdits(current => ({ ...current, [categoryId]: limit }))
  }, [])

  const discardChanges = useCallback(() => {
    setEdits({})
  }, [])

  const allRows = useMemo(
    () => [...expenseRows, ...savingRows],
    [expenseRows, savingRows],
  )

  const changed = useMemo(
    () => allRows.filter(row => row.limit !== row.savedLimit),
    [allRows],
  )

  const changedLimits = useCallback(
    (): BudgetLimitInput[] =>
      changed.map(row => ({
        categoryId: row.category.id,
        monthlyLimit: row.limit,
        ...(row.budgetId ? { budgetId: row.budgetId } : {}),
      })),
    [changed],
  )

  return {
    expenseRows,
    savingRows,
    totalPlanned: sumLimits(expenseRows),
    totalSaving: sumLimits(savingRows),
    hasChanges: changed.length > 0,
    isLoading: budgetsQuery.isPending || categoriesQuery.isPending,
    isError: budgetsQuery.isError || categoriesQuery.isError,
    setLimit,
    discardChanges,
    changedLimits,
  }
}
