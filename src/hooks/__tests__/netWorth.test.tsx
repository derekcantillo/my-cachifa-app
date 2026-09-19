import React from 'react'
import { act, create } from 'react-test-renderer'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAccounts, useSetInitialBalance } from '../useAccounts'
import { useCreateTransaction } from '../useCreateTransaction'
import { useNetWorth } from '../useNetWorth'

jest.setTimeout(20000)

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

describe('net worth (API_MODE=mock)', () => {
  it('adds up the accounts, what is owed and what the goals hold', async () => {
    const client = createTestClient()
    const result = renderWithClient(
      () => ({ netWorth: useNetWorth(), accounts: useAccounts() }),
      client,
    )

    // Net worth reads three other mocks, so its latency stacks.
    await wait(2500)

    const netWorth = result.get().netWorth.data
    const accounts = result.get().accounts.data ?? []
    if (!netWorth) throw new Error('expected a net worth snapshot')

    expect(netWorth.assets.accountsBalance).toBeCloseTo(
      accounts.reduce((sum, account) => sum + account.currentBalance, 0),
      5,
    )
    expect(netWorth.assets.creditCardsAvailable).toBe(0)
    expect(netWorth.liabilities).toEqual({ debts: 0, creditCardsDebt: 0 })
    expect(netWorth.netWorth).toBeCloseTo(
      netWorth.assets.accountsBalance +
        netWorth.assets.receivables +
        netWorth.assets.goalsSavings,
      5,
    )
  })

  it('refreshes accounts and net worth when a starting balance is set', async () => {
    const client = createTestClient()
    const result = renderWithClient(
      () => ({
        netWorth: useNetWorth(),
        accounts: useAccounts(),
        setInitialBalance: useSetInitialBalance(),
      }),
      client,
    )

    await wait(2500)
    const cash = result.get().accounts.data?.find(a => a.id === 'acc-cash')
    const before = result.get().netWorth.data?.assets.accountsBalance
    if (!cash || before === undefined) throw new Error('expected seed data')

    await act(async () => {
      await result.get().setInitialBalance.mutateAsync({
        id: cash.id,
        input: {
          amount: cash.initialBalance + 100,
          date: new Date().toISOString(),
        },
      })
    })
    await wait(2500)

    const after = result.get().accounts.data?.find(a => a.id === 'acc-cash')
    expect(after?.initialBalance).toBe(cash.initialBalance + 100)
    expect(after?.currentBalance).toBe(cash.currentBalance + 100)
    expect(result.get().netWorth.data?.assets.accountsBalance).toBeCloseTo(
      before + 100,
      5,
    )
  })

  it('refetches net worth after a movement is registered', async () => {
    const client = createTestClient()
    const result = renderWithClient(
      () => ({ netWorth: useNetWorth(), create: useCreateTransaction() }),
      client,
    )

    await wait(2500)
    const fetchedAt = result.get().netWorth.dataUpdatedAt
    expect(fetchedAt).toBeGreaterThan(0)

    await act(async () => {
      await result.get().create.mutateAsync({
        kind: 'expense',
        amount: 10,
        categoryId: 'FOOD',
        accountId: 'acc-cash',
        date: new Date().toISOString(),
        description: 'Café',
      })
    })
    await wait(2500)

    expect(result.get().netWorth.dataUpdatedAt).toBeGreaterThan(fetchedAt)
  })
})
