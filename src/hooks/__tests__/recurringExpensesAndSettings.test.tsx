import React from 'react'
import { act, create } from 'react-test-renderer'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CURRENT_PERIOD_ID } from '@/api/repositories/mock/seed-data'
import { useCreateTransaction } from '../useCreateTransaction'
import { useBudgets } from '../useBudgets'
import {
  useCreateRecurringExpense,
  useDeleteRecurringExpense,
  usePendingRecurringExpenses,
  useRecurringExpenses,
  useUpdateRecurringExpense,
} from '../useRecurringExpenses'
import { useSettings, useUpdateSettings } from '../useSettings'

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

/**
 * Polls instead of sleeping a fixed duration — a mutation followed by its own
 * invalidated refetch is two chained round trips through the mocks' random
 * latency, and how long that actually takes swings with however busy the
 * machine is when the whole suite runs in parallel. Waiting for the effect
 * itself, rather than guessing a duration long enough to cover it, is what
 * makes this reliable under that contention instead of just less flaky.
 */
async function waitFor(
  predicate: () => boolean,
  timeoutMs = 10000,
): Promise<void> {
  const start = Date.now()
  while (!predicate()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error('waitFor: condition never became true')
    }
    await act(async () => {
      await new Promise<void>(resolve => setTimeout(resolve, 50))
    })
  }
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

describe('recurring expense mutations (API_MODE=mock)', () => {
  it('reflects a create/update/delete in the list and invalidates budgets', async () => {
    const client = createTestClient()
    const result = renderWithClient(
      () => ({
        list: useRecurringExpenses(),
        budgets: useBudgets({ periodId: CURRENT_PERIOD_ID }),
        create: useCreateRecurringExpense(),
        update: useUpdateRecurringExpense(),
        remove: useDeleteRecurringExpense(),
      }),
      client,
    )

    await settle()
    const seededCount = result.get().list.data?.length ?? 0
    const budgetsFetchedAt = result.get().budgets.dataUpdatedAt

    act(() => {
      result.get().create.mutate({
        name: 'Internet',
        categoryId: 'SERVICES',
        estimatedAmount: 90,
        isAmountFixed: false,
        dayOfMonth: 15,
      })
    })
    await waitFor(
      () =>
        (result.get().list.data ?? []).length === seededCount + 1 &&
        result.get().budgets.dataUpdatedAt > budgetsFetchedAt,
    )

    const afterCreate = result.get().list.data ?? []
    expect(afterCreate).toHaveLength(seededCount + 1)
    const created = afterCreate.find(item => item.name === 'Internet')
    expect(created).toBeDefined()
    // Creating a recurring expense recalculates the current period's budgets.
    expect(result.get().budgets.dataUpdatedAt).toBeGreaterThan(budgetsFetchedAt)

    const beforeUpdateFetchedAt = result.get().budgets.dataUpdatedAt

    act(() => {
      result.get().update.mutate({
        id: created!.id,
        input: { estimatedAmount: 120 },
      })
    })
    await waitFor(
      () =>
        (result.get().list.data ?? []).find(item => item.id === created!.id)
          ?.estimatedAmount === 120 &&
        result.get().budgets.dataUpdatedAt > beforeUpdateFetchedAt,
    )

    const updated = (result.get().list.data ?? []).find(
      item => item.id === created!.id,
    )
    expect(updated?.estimatedAmount).toBe(120)
    expect(result.get().budgets.dataUpdatedAt).toBeGreaterThan(
      beforeUpdateFetchedAt,
    )

    const beforeDeleteFetchedAt = result.get().budgets.dataUpdatedAt

    act(() => {
      result.get().remove.mutate(created!.id)
    })
    await waitFor(
      () =>
        (result.get().list.data ?? []).length === seededCount &&
        result.get().budgets.dataUpdatedAt > beforeDeleteFetchedAt,
    )

    expect(result.get().list.data ?? []).toHaveLength(seededCount)
    expect(result.get().budgets.dataUpdatedAt).toBeGreaterThan(
      beforeDeleteFetchedAt,
    )
  })

  it('drops a pending expense from the list once its movement for the period exists', async () => {
    const client = createTestClient()
    const result = renderWithClient(
      () => ({
        pending: usePendingRecurringExpenses(CURRENT_PERIOD_ID),
        createTransaction: useCreateTransaction(),
      }),
      client,
    )

    await settle()

    // Seeded as active, with no movement linked to it this period.
    const beforePending = result.get().pending.data ?? []
    expect(beforePending.some(item => item.id === 'rec-arriendo')).toBe(true)
    // Seeded as inactive — never pending, movement or not.
    expect(beforePending.some(item => item.id === 'rec-gimnasio')).toBe(false)

    act(() => {
      result.get().createTransaction.mutate({
        kind: 'expense',
        amount: 1200,
        categoryId: 'HOUSING',
        accountId: 'acc-main',
        date: new Date().toISOString(),
        description: 'Arriendo de septiembre',
        recurringExpenseId: 'rec-arriendo',
      })
    })
    await waitFor(
      () =>
        !(result.get().pending.data ?? []).some(
          item => item.id === 'rec-arriendo',
        ),
    )

    const afterPending = result.get().pending.data ?? []
    expect(afterPending.some(item => item.id === 'rec-arriendo')).toBe(false)
  })
})

describe('settings (API_MODE=mock)', () => {
  it('reflects an update to the target savings percentage', async () => {
    const client = createTestClient()
    const result = renderWithClient(
      () => ({
        settings: useSettings(),
        update: useUpdateSettings(),
      }),
      client,
    )

    await settle()
    expect(result.get().settings.data?.targetSavingsPercentage).toBe(30)

    act(() => {
      result.get().update.mutate({ targetSavingsPercentage: 25 })
    })
    await waitFor(
      () => result.get().settings.data?.targetSavingsPercentage === 25,
    )

    expect(result.get().settings.data?.targetSavingsPercentage).toBe(25)
  })
})
