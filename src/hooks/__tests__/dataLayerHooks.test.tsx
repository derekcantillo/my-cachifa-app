import React from 'react'
import { act, create } from 'react-test-renderer'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useBudgets } from '../useBudgets'
import { useCreateGoal } from '../useCreateGoal'
import { useCreateTransaction } from '../useCreateTransaction'
import { useGoals } from '../useGoals'
import { useReports } from '../useReports'
import { useTransactions } from '../useTransactions'

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

async function wait(ms: number): Promise<void> {
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

describe('data layer hooks (API_MODE=mock)', () => {
  it('useTransactions starts loading, then resolves with seed data', async () => {
    const client = createTestClient()
    const hook = renderWithClient(() => useTransactions(), client)

    expect(hook.get().isPending).toBe(true)

    await wait(1000)

    expect(hook.get().isSuccess).toBe(true)
    expect(hook.get().data?.length ?? 0).toBeGreaterThan(0)
  })

  it('useBudgets and useGoals resolve with realistic seed data', async () => {
    const client = createTestClient()
    const budgetsHook = renderWithClient(() => useBudgets(), client)
    const goalsHook = renderWithClient(() => useGoals(), client)

    await wait(1000)

    expect(budgetsHook.get().data?.length ?? 0).toBeGreaterThan(0)
    const goalNames = goalsHook.get().data?.map(goal => goal.name) ?? []
    expect(goalNames).toEqual(
      expect.arrayContaining(['Fondo de emergencia', 'Viaje']),
    )
  })

  it('useReports resolves a report for the current month', async () => {
    const client = createTestClient()
    const month = new Date().toISOString().slice(0, 7)
    const hook = renderWithClient(() => useReports(month), client)

    // The report's own latency stacks with the transaction/budget lookups it
    // performs internally, so its worst case is roughly double a plain query.
    await wait(2000)

    expect(hook.get().isSuccess).toBe(true)
    expect(hook.get().data?.month).toBe(month)
  })

  it('useCreateTransaction invalidates useTransactions so the list grows', async () => {
    const client = createTestClient()
    const listHook = renderWithClient(() => useTransactions(), client)
    const createHook = renderWithClient(() => useCreateTransaction(), client)

    await wait(1000)
    const before = listHook.get().data?.length ?? 0

    await act(async () => {
      await createHook.get().mutateAsync({
        kind: 'expense',
        amount: 12,
        categoryId: 'cat-ocio',
        accountId: 'acc-cash',
        date: new Date().toISOString(),
        description: 'Hook-created expense',
      })
    })

    await wait(1000)

    expect(listHook.get().data?.length ?? 0).toBe(before + 1)
  })

  it('useCreateGoal invalidates useGoals so the new goal appears', async () => {
    const client = createTestClient()
    const listHook = renderWithClient(() => useGoals(), client)
    const createHook = renderWithClient(() => useCreateGoal(), client)

    await wait(1000)

    await act(async () => {
      await createHook.get().mutateAsync({
        name: 'Laptop nueva',
        targetAmount: 900,
        phase: 'short_term',
      })
    })

    await wait(1000)

    const names = listHook.get().data?.map(goal => goal.name) ?? []
    expect(names).toContain('Laptop nueva')
  })
})
