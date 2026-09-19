import { useCallback, useMemo, useState } from 'react'
import type { Budget, Category, TransactionKind } from '@/api/types'
import { useBudgets, useCategories } from '@/hooks'
import type { BudgetLimitInput } from '@/hooks'

export interface BudgetPlanRow {
  category: Category
  /** Existing budget for the period, when the category already has one. */
  budgetId?: string
  /** Limit as saved. */
  savedLimit: number
  /** Limit as currently edited on screen. */
  limit: number
  /** True for a row the user just added, which opens straight into editing. */
  isNew: boolean
}

export interface BudgetPlan {
  /** Rows for spending categories, the ones that make up the monthly limit. */
  expenseRows: BudgetPlanRow[]
  /** Saving targets, kept apart because they are not money to spend. */
  savingRows: BudgetPlanRow[]
  /** Expense categories with no limit yet, offered by "Añadir categoría". */
  availableCategories: Category[]
  /** Live sum of the edited expense limits. */
  totalPlanned: number
  /** Live sum of the edited saving targets. */
  totalSaving: number
  hasChanges: boolean
  isLoading: boolean
  isError: boolean
  setLimit: (categoryId: string, limit: number) => void
  /** Brings a category into the plan, ready to receive its first limit. */
  addCategory: (categoryId: string) => void
  /** Drops every local edit, back to what is saved. */
  discardChanges: () => void
  /** Only the rows that actually changed, ready for the batch mutation. */
  changedLimits: () => BudgetLimitInput[]
}

function sumLimits(rows: readonly BudgetPlanRow[]): number {
  return rows.reduce((total, row) => total + row.limit, 0)
}

/**
 * Editable plan for a period: the categories that already have a limit plus the
 * ones the user brings in, with their edits layered over what is saved. Nothing
 * is written until the screen asks for `changedLimits`.
 */
export function useBudgetPlanner(periodId: string): BudgetPlan {
  const budgetsQuery = useBudgets({ periodId })
  const categoriesQuery = useCategories()

  const [edits, setEdits] = useState<Record<string, number>>({})
  const [added, setAdded] = useState<string[]>([])

  const budgetsByCategory = useMemo(
    () =>
      (budgetsQuery.data ?? []).reduce<Record<string, Budget>>(
        (index, budget) => {
          index[budget.categoryId] = budget
          return index
        },
        {},
      ),
    [budgetsQuery.data],
  )

  const categories = useMemo(
    () => categoriesQuery.data ?? [],
    [categoriesQuery.data],
  )

  const buildRows = useCallback(
    (kind: TransactionKind): BudgetPlanRow[] =>
      categories
        .filter(category => category.kinds.includes(kind))
        .filter(
          category =>
            budgetsByCategory[category.id] !== undefined ||
            added.includes(category.id),
        )
        .map(category => {
          const budget = budgetsByCategory[category.id]
          const savedLimit = budget?.monthlyLimit ?? 0

          return {
            category,
            ...(budget ? { budgetId: budget.id } : {}),
            savedLimit,
            limit: edits[category.id] ?? savedLimit,
            isNew: budget === undefined,
          }
        }),
    [added, budgetsByCategory, categories, edits],
  )

  const expenseRows = useMemo(() => buildRows('expense'), [buildRows])
  const savingRows = useMemo(() => buildRows('saving'), [buildRows])

  const availableCategories = useMemo(
    () =>
      categories.filter(
        category =>
          category.kinds.includes('expense') &&
          budgetsByCategory[category.id] === undefined &&
          !added.includes(category.id),
      ),
    [added, budgetsByCategory, categories],
  )

  const setLimit = useCallback((categoryId: string, limit: number) => {
    setEdits(current => ({ ...current, [categoryId]: limit }))
  }, [])

  const addCategory = useCallback((categoryId: string) => {
    setAdded(current =>
      current.includes(categoryId) ? current : [...current, categoryId],
    )
  }, [])

  const discardChanges = useCallback(() => {
    setEdits({})
    setAdded([])
  }, [])

  const changed = useMemo(
    () =>
      [...expenseRows, ...savingRows].filter(
        row => row.limit !== row.savedLimit,
      ),
    [expenseRows, savingRows],
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
    availableCategories,
    totalPlanned: sumLimits(expenseRows),
    totalSaving: sumLimits(savingRows),
    hasChanges: changed.length > 0,
    isLoading: budgetsQuery.isPending || categoriesQuery.isPending,
    isError: budgetsQuery.isError || categoriesQuery.isError,
    setLimit,
    addCategory,
    discardChanges,
    changedLimits,
  }
}
