import React from 'react'
import { act, create } from 'react-test-renderer'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getCurrentMonthKey } from '@/utils'
import { useBudgets, useResetBudgets, useUpdateBudgets } from '../useBudgets'
import {
  useAddGoalContribution,
  useDeleteGoal,
  useUpdateGoal,
} from '../useCreateGoal'
import {
  useCreateTransaction,
  useUpdateTransaction,
} from '../useCreateTransaction'
import { useGoals } from '../useGoals'
import { useTransactions } from '../useTransactions'

/** Longer than the mock repositories' simulated latency ceiling. */
const SETTLE_MS = 1400

const activeClients: QueryClient[] = []

function createTestClient(): QueryClient {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
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

async function settle(ms = SETTLE_MS): Promise<void> {
  await act(async () => {
    await new Promise<void>(resolve => setTimeout(resolve, ms))
  })
}

function renderWithClient<T>(
  useHook: () => T,
  client: QueryClient,
): { get: () => T } {
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

jest.setTimeout(20000)

describe('transaction mutations (API_MODE=mock)', () => {
  it('refreshes the movement list after creating one', async () => {
    const client = createTestClient()
    const result = renderWithClient(
      () => ({
        list: useTransactions(),
        create: useCreateTransaction(),
      }),
      client,
    )

    await settle()
    const before = result.get().list.data?.length ?? 0

    await act(async () => {
      await result.get().create.mutateAsync({
        kind: 'expense',
        amount: 33,
        categoryId: 'cat-ocio',
        accountId: 'acc-cash',
        date: new Date().toISOString(),
        description: 'Café de prueba',
      })
    })
    await settle()

    expect(result.get().create.isSuccess).toBe(true)
    // The list re-fetched on its own because the mutation invalidated it.
    expect(result.get().list.data?.length).toBe(before + 1)
  })

  it('surfaces an error state when the write fails', async () => {
    const client = createTestClient()
    const result = renderWithClient(() => useUpdateTransaction(), client)

    await act(async () => {
      result.get().mutate({ id: 'txn-does-not-exist', input: { amount: 10 } })
    })
    await settle()

    // This is the state the register/detail screens render with ErrorNotice.
    expect(result.get().isError).toBe(true)
    expect(result.get().error).toBeInstanceOf(Error)
  })
})

describe('goal mutations (API_MODE=mock)', () => {
  it('moves progress and history when a contribution is added', async () => {
    const client = createTestClient()
    const result = renderWithClient(
      () => ({ goals: useGoals(), contribute: useAddGoalContribution() }),
      client,
    )

    await settle()
    const goal = result.get().goals.data?.[0]
    if (!goal) throw new Error('expected at least one seed goal')

    await act(async () => {
      await result.get().contribute.mutateAsync({
        goalId: goal.id,
        amount: 125,
      })
    })
    await settle()

    const updated = result.get().goals.data?.find(item => item.id === goal.id)
    expect(updated?.currentAmount).toBe(goal.currentAmount + 125)
    expect(updated?.contributions.length).toBe(goal.contributions.length + 1)
  })

  it('reports the error when updating a goal that is gone', async () => {
    const client = createTestClient()
    const result = renderWithClient(() => useUpdateGoal(), client)

    await act(async () => {
      result.get().mutate({ id: 'goal-missing', input: { status: 'paused' } })
    })
    await settle()

    expect(result.get().isError).toBe(true)
    expect(result.get().error).toBeInstanceOf(Error)
  })

  it('drops the goal from the list after deleting it', async () => {
    const client = createTestClient()
    const result = renderWithClient(
      () => ({ goals: useGoals(), remove: useDeleteGoal() }),
      client,
    )

    await settle()
    const before = result.get().goals.data ?? []
    const target = before[before.length - 1]
    if (!target) throw new Error('expected at least one seed goal')

    await act(async () => {
      await result.get().remove.mutateAsync(target.id)
    })
    await settle()

    expect(result.get().goals.data?.some(goal => goal.id === target.id)).toBe(
      false,
    )
  })
})

describe('budget mutations (API_MODE=mock)', () => {
  const month = getCurrentMonthKey()

  it('creates, updates and clears limits in one batch', async () => {
    const client = createTestClient()
    const result = renderWithClient(
      () => ({ budgets: useBudgets({ month }), save: useUpdateBudgets() }),
      client,
    )

    await settle()
    const existing = result
      .get()
      .budgets.data?.find(budget => budget.categoryId === 'cat-ocio')
    if (!existing) throw new Error('expected a seed budget for cat-ocio')

    await act(async () => {
      await result.get().save.mutateAsync({
        month,
        limits: [
          {
            categoryId: 'cat-ocio',
            monthlyLimit: 175,
            budgetId: existing.id,
          },
        ],
      })
    })
    await settle()

    const saved = result
      .get()
      .budgets.data?.find(budget => budget.categoryId === 'cat-ocio')
    expect(saved?.monthlyLimit).toBe(175)
  })

  it('clears every limit of the period when the month is reset', async () => {
    const client = createTestClient()
    const resetMonth = '2031-05'

    const result = renderWithClient(
      () => ({
        budgets: useBudgets({ month: resetMonth }),
        save: useUpdateBudgets(),
        reset: useResetBudgets(),
      }),
      client,
    )

    await settle()

    await act(async () => {
      await result.get().save.mutateAsync({
        month: resetMonth,
        limits: [{ categoryId: 'cat-mercado', monthlyLimit: 400 }],
      })
    })
    await settle()
    expect(result.get().budgets.data).toHaveLength(1)

    await act(async () => {
      await result.get().reset.mutateAsync(resetMonth)
    })
    await settle()

    expect(result.get().budgets.data).toHaveLength(0)
  })
})
