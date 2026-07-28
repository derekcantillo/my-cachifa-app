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

/**
 * Longer than the mock repositories' simulated latency ceiling. The monthly
 * report stacks three of them — its own, plus the transaction and budget
 * queries it composes — so the window has to clear all three.
 */
const RESOLVE_MS = 2600

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

async function settle(): Promise<void> {
  await act(async () => {
    await new Promise<void>(resolve => setTimeout(resolve, RESOLVE_MS))
  })
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
    month: getCurrentMonthKey(),
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
    expect(data.budgetRows.every(row => row.category?.kind === 'expense')).toBe(
      true,
    )
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
      data.filterableCategories.every(category => category.kind === 'expense'),
    ).toBe(true)
  })

  it('returns nothing for a month without movements', async () => {
    const result = renderWithClient(() =>
      useExpensesData({ ...baseFilters, month: '1999-01' }),
    )

    await settle()

    const data = result.get()
    expect(data.transactions).toHaveLength(0)
    expect(data.budgetRows).toHaveLength(0)
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
  })
})

describe('useReportsData (API_MODE=mock)', () => {
  it('derives the monthly insights and the expense distribution', async () => {
    const month = getCurrentMonthKey()
    const result = renderWithClient(() => useReportsData(month))

    expect(result.get().isLoading).toBe(true)

    await settle()

    const data = result.get()
    expect(data.isError).toBe(false)
    expect(data.topExpense?.category?.kind).toBe('expense')
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

  it('stays empty-but-valid for a month without movements', async () => {
    const result = renderWithClient(() => useReportsData('1999-01'))

    await settle()

    const data = result.get()
    expect(data.isError).toBe(false)
    expect(data.distribution).toHaveLength(0)
    expect(data.totalExpense).toBe(0)
    expect(data.topExpense).toBeNull()
  })
})
