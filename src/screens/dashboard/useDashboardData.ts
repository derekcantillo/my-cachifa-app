import { useMemo } from 'react'
import type {
  Budget,
  Category,
  Goal,
  GoalPhase,
  Transaction,
} from '@/api/types'
import { PHASE_ORDER } from '@/components/goals/phases'
import {
  useBudgets,
  useCategories,
  useCurrentPeriod,
  useGoals,
  useNetWorth,
  useTransactions,
} from '@/hooks'
import {
  getCurrentMonthKey,
  indexById,
  isWithinLastDays,
  sortByDateDesc,
  sumByKind,
  type MonthKey,
} from '@/utils'

const RECENT_TRANSACTIONS_LIMIT = 5
const WEEK_DAYS = 7

interface WeeklySummary {
  expense: number
  saving: number
}

interface MonthlyBudgetSummary {
  limit: number
  spent: number
  remaining: number
  percent: number
}

export interface DashboardData {
  /** Calendar month, only for the budget card's heading and days-left count. */
  month: MonthKey
  /** The open financial period every figure comes from; `undefined` while loading. */
  periodId: string | undefined
  isLoading: boolean
  isError: boolean
  monthlyBudget: MonthlyBudgetSummary
  weekly: WeeklySummary
  /** Phase the active goals are on, driving the "Plan actual" card. */
  currentPhase: GoalPhase | null
  activeGoals: Goal[]
  recentTransactions: Transaction[]
  categoriesById: Record<string, Category>
  refetch: () => void
}

function sumExpenseBudgets(
  budgets: readonly Budget[],
  categoriesById: Record<string, Category>,
): number {
  return budgets.reduce((total, budget) => {
    const category = categoriesById[budget.categoryId]
    return category?.kinds.includes('expense')
      ? total + budget.monthlyLimit
      : total
  }, 0)
}

function toPercentage(value: number, total: number): number {
  return total > 0 ? (value / total) * 100 : 0
}

/** The most urgent phase that still has goals to work on. */
function resolveCurrentPhase(goals: readonly Goal[]): GoalPhase | null {
  return (
    PHASE_ORDER.find(phase => goals.some(goal => goal.phase === phase)) ?? null
  )
}

/**
 * Composes the current period's transactions, budgets, goals and categories
 * into the figures the dashboard renders. All data comes from the repository
 * hooks — the screen holds no numbers of its own.
 */
export function useDashboardData(): DashboardData {
  const month = getCurrentMonthKey()

  // The dashboard always shows the open period; there is no selector here.
  const currentPeriodQuery = useCurrentPeriod()
  const periodId = currentPeriodQuery.data?.id
  const enabled = periodId !== undefined

  const transactionsQuery = useTransactions({ periodId }, { enabled })
  const budgetsQuery = useBudgets({ periodId }, { enabled })
  const goalsQuery = useGoals()
  // Rendered by its own card; held here only so pull-to-refresh reaches it.
  const netWorthQuery = useNetWorth()
  const categoriesQuery = useCategories()

  const transactions = useMemo(
    () => transactionsQuery.data ?? [],
    [transactionsQuery.data],
  )

  const categoriesById = useMemo(
    () => indexById(categoriesQuery.data ?? []),
    [categoriesQuery.data],
  )

  const monthlyBudget = useMemo<MonthlyBudgetSummary>(() => {
    // Only expense budgets make up the monthly limit; the saving budget is a
    // target, not something to spend.
    const limit = sumExpenseBudgets(budgetsQuery.data ?? [], categoriesById)
    const spent = sumByKind(transactions, 'expense')

    return {
      limit,
      spent,
      remaining: limit - spent,
      percent: toPercentage(spent, limit),
    }
  }, [budgetsQuery.data, categoriesById, transactions])

  const weekly = useMemo<WeeklySummary>(() => {
    const recent = transactions.filter(transaction =>
      isWithinLastDays(transaction.date, WEEK_DAYS),
    )

    return {
      expense: sumByKind(recent, 'expense'),
      saving: sumByKind(recent, 'saving'),
    }
  }, [transactions])

  const activeGoals = useMemo(
    () => (goalsQuery.data ?? []).filter(goal => goal.status === 'active'),
    [goalsQuery.data],
  )

  const currentPhase = useMemo(
    () => resolveCurrentPhase(activeGoals),
    [activeGoals],
  )

  const recentTransactions = useMemo(
    () => sortByDateDesc(transactions).slice(0, RECENT_TRANSACTIONS_LIMIT),
    [transactions],
  )

  return {
    month,
    periodId,
    isLoading:
      currentPeriodQuery.isPending ||
      transactionsQuery.isPending ||
      budgetsQuery.isPending ||
      goalsQuery.isPending ||
      categoriesQuery.isPending,
    isError:
      currentPeriodQuery.isError ||
      transactionsQuery.isError ||
      budgetsQuery.isError ||
      goalsQuery.isError ||
      categoriesQuery.isError,
    monthlyBudget,
    weekly,
    currentPhase,
    activeGoals,
    recentTransactions,
    categoriesById,
    refetch: () => {
      currentPeriodQuery.refetch()
      netWorthQuery.refetch()
      transactionsQuery.refetch()
      budgetsQuery.refetch()
      goalsQuery.refetch()
      categoriesQuery.refetch()
    },
  }
}
