import React from 'react'
import { act, create } from 'react-test-renderer'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getCategoryColorById } from '@/theme'
import { getCurrentMonthKey } from '@/utils'
import { useDashboardData } from '../dashboard/useDashboardData'
import {
  useExpensesData,
  type ExpenseFilters,
} from '../expenses/useExpensesData'
import { useGoalsData, PROJECTION_MONTHS } from '../goals/useGoalsData'
import { useReportsData } from '../reports/useReportsData'

/** The mock seed's open period; screens may not import the seed directly. */
const CURRENT_PERIOD_ID = 'per-current'

/** How often `settle` checks whether the queries have come to rest. */
const POLL_MS = 50

/**
 * Ceiling for `settle`. The monthly report stacks three simulated latencies —
 * its own, plus the transaction and budget queries it composes — but the wait
 * ends as soon as they resolve, so this is only reached when something hangs.
 */
const SETTLE_TIMEOUT_MS = 12000

const activeClients: QueryClient[] = []

function createTestClient(): QueryClient {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  activeClients.push(client)
  return client
}

afterEach(() => {
  activeClients.splice(0).forEach(client => {
    client.clear()
    client.unmount()
  })
})

function renderWithClient<T>(useHook: () => T): { get: () => T } {
  const client = createTestClient()
  let latest: T

  function Harness() {
    latest = useHook()
    return null
  }

  act(() => {
    create(
      <QueryClientProvider client={client}>
        <Harness />
      </QueryClientProvider>,
    )
  })

  return { get: () => latest }
}

/**
 * Waits for every query on screen to come to rest. A fixed sleep long enough
 * for the mocks' random latency is either flaky or slow, and worse: an
 * assertion made while a hook is still pending passes on the empty defaults it
 * returns meanwhile, so a test can go green having checked nothing.
 */
async function settle(): Promise<void> {
  const deadline = Date.now() + SETTLE_TIMEOUT_MS
  let idlePolls = 0

  while (Date.now() < deadline) {
    await act(async () => {
      await new Promise<void>(resolve => setTimeout(resolve, POLL_MS))
    })

    const busy = activeClients.some(client => client.isFetching() > 0)
    // A resolved query can start a dependent one in the same tick, so idleness
    // has to hold across two polls before it counts.
    idlePolls = busy ? 0 : idlePolls + 1

    if (idlePolls >= 2) {
      return
    }
  }
}

jest.setTimeout(15000)

describe('useDashboardData (API_MODE=mock)', () => {
  it('starts loading and then exposes figures derived from the mocks', async () => {
    const result = renderWithClient(useDashboardData)

    expect(result.get().isLoading).toBe(true)

    await settle()

    const data = result.get()
    expect(data.isLoading).toBe(false)
    expect(data.isError).toBe(false)
    expect(data.month).toBe(getCurrentMonthKey())
    expect(data.periodId).toBe(CURRENT_PERIOD_ID)

    // Only expense budgets count towards the monthly limit; the saving budget
    // is a target, not something to spend.
    expect(data.monthlyBudget.limit).toBe(1500)

    expect(data.monthlyBudget.remaining).toBe(
      data.monthlyBudget.limit - data.monthlyBudget.spent,
    )
    expect(data.recentTransactions.length).toBeLessThanOrEqual(5)
    expect(data.activeGoals.every(goal => goal.status === 'active')).toBe(true)
    // Seed goals are urgent, short and medium term, so the plan card opens on
    // the most urgent one.
    expect(data.currentPhase).toBe('urgent')
    expect(Object.keys(data.categoriesById).length).toBeGreaterThan(0)
  })
})

describe('useExpensesData (API_MODE=mock)', () => {
  const baseFilters: ExpenseFilters = {
    periodId: CURRENT_PERIOD_ID,
    kind: 'all',
    categoryId: null,
  }

  it('lists expense budgets with the amount spent in each category', async () => {
    const result = renderWithClient(() => useExpensesData(baseFilters))

    expect(result.get().isBudgetsLoading).toBe(true)

    await settle()

    const data = result.get()
    expect(data.isError).toBe(false)
    expect(data.budgetRows.length).toBeGreaterThan(0)
    expect(
      data.budgetRows.every(row => row.category?.kinds.includes('expense')),
    ).toBe(true)
    expect(data.budgetRows.every(row => row.spent >= 0)).toBe(true)
  })

  it('narrows the movement list by kind', async () => {
    const result = renderWithClient(() =>
      useExpensesData({ ...baseFilters, kind: 'expense' }),
    )

    await settle()

    const data = result.get()
    expect(data.transactions.length).toBeGreaterThan(0)
    expect(
      data.transactions.every(transaction => transaction.kind === 'expense'),
    ).toBe(true)
    expect(
      data.filterableCategories.every(category =>
        category.kinds.includes('expense'),
      ),
    ).toBe(true)
  })

  it('returns nothing for a period without movements', async () => {
    const result = renderWithClient(() =>
      useExpensesData({ ...baseFilters, periodId: 'per-empty' }),
    )

    await settle()

    const data = result.get()
    expect(data.transactions).toHaveLength(0)
    expect(data.budgetRows).toHaveLength(0)
    // Nothing to filter out: the period itself is empty, which is the empty
    // state that offers to register a movement.
    expect(data.hasMonthMovements).toBe(false)
    expect(data.isTransactionsLoading).toBe(false)
  })

  it('tells an empty period apart from a filter that excludes everything', async () => {
    // Income never carries a spending category, so the pair matches nothing in
    // a period that does have movements.
    const result = renderWithClient(() =>
      useExpensesData({ ...baseFilters, kind: 'income', categoryId: 'FOOD' }),
    )

    await settle()

    const data = result.get()
    expect(data.transactions).toHaveLength(0)
    expect(data.hasMonthMovements).toBe(true)
  })
})

describe('useGoalsData (API_MODE=mock)', () => {
  it('exposes the goal list, its totals and the savings projection', async () => {
    const result = renderWithClient(useGoalsData)

    expect(result.get().isLoading).toBe(true)

    await settle()

    const data = result.get()
    expect(data.isError).toBe(false)
    expect(data.goals.length).toBeGreaterThan(0)
    expect(data.totalSaved).toBe(
      data.goals.reduce((total, goal) => total + goal.currentAmount, 0),
    )
    expect(data.totalTarget).toBe(
      data.goals.reduce((total, goal) => total + goal.targetAmount, 0),
    )

    // Goals already met sink to the bottom of the list.
    const completedAt = data.goals.findIndex(
      goal => goal.status === 'completed',
    )
    if (completedAt >= 0) {
      expect(
        data.goals
          .slice(completedAt)
          .every(goal => goal.status === 'completed'),
      ).toBe(true)
    }

    expect(data.projection?.points).toHaveLength(PROJECTION_MONTHS)
    expect(data.projection?.points[0]?.month).toBe(getCurrentMonthKey())

    // The projection card only draws a curve once something has been set
    // aside; the seed goals all carry contributions.
    expect(data.hasContributions).toBe(true)
  })
})

describe('useReportsData (API_MODE=mock)', () => {
  it('derives the monthly insights and the expense distribution', async () => {
    const result = renderWithClient(() => useReportsData(CURRENT_PERIOD_ID))

    expect(result.get().isLoading).toBe(true)

    await settle()

    const data = result.get()
    expect(data.isError).toBe(false)
    expect(data.hasMovements).toBe(true)
    expect(data.topExpense?.category?.kinds).toContain('expense')
    expect(data.topExpense?.amount).toBeGreaterThan(0)
    expect(data.mostFrequent?.label).toBeTruthy()
    expect(data.saving.difference).toBe(
      data.saving.actual - data.saving.planned,
    )

    // Slices come out largest first and add up to the period's expenses.
    const values = data.distribution.map(slice => slice.value)
    expect([...values].sort((a, b) => b - a)).toEqual(values)
    expect(values.reduce((total, value) => total + value, 0)).toBeCloseTo(
      data.totalExpense,
      5,
    )

    // Every slice is colored from the app's fixed category map.
    data.distribution.forEach(slice => {
      expect(slice.color).toBe(getCategoryColorById(slice.key))
    })
  })

  it('stays empty-but-valid for a period without movements', async () => {
    const result = renderWithClient(() => useReportsData('per-empty'))

    await settle()

    const data = result.get()
    expect(data.isError).toBe(false)
    expect(data.distribution).toHaveLength(0)
    expect(data.totalExpense).toBe(0)
    expect(data.topExpense).toBeNull()

    // One empty state stands in for the whole screen instead of four cards
    // reading "Sin datos" and a donut with nothing in it.
    expect(data.isLoading).toBe(false)
    expect(data.hasMovements).toBe(false)

    // Nothing derived from an empty period may come out as NaN.
    expect(Number.isNaN(data.saving.percentOfPlan)).toBe(false)
    expect(Number.isNaN(data.saving.difference)).toBe(false)
  })
})
