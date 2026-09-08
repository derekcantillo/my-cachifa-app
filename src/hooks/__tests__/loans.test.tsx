import React from 'react'
import { act, create } from 'react-test-renderer'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAccounts } from '../useAccounts'
import {
  useCreateLoan,
  useCreateLoanRepayment,
  useDeleteLoan,
  useLoan,
  useLoans,
} from '../useLoans'

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

async function settle(ms = 1400): Promise<void> {
  await act(async () => {
    await new Promise<void>(resolve => setTimeout(resolve, ms))
  })
}

/**
 * Polls instead of sleeping a fixed duration — see the identical helper in
 * `recurringExpensesAndSettings.test.tsx` for why: a mutation followed by its
 * own invalidated refetch is two chained round trips through the mocks'
 * random latency, and guessing a duration long enough to always cover that
 * flakes under parallel load in a way polling for the effect itself does not.
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

describe('loan mutations (API_MODE=mock)', () => {
  it('reflects a new loan in the list and invalidates accounts', async () => {
    const client = createTestClient()
    const result = renderWithClient(
      () => ({
        list: useLoans(),
        accounts: useAccounts(),
        create: useCreateLoan(),
      }),
      client,
    )

    await settle()
    const seededCount = result.get().list.data?.length ?? 0
    const accountsFetchedAt = result.get().accounts.dataUpdatedAt

    act(() => {
      result.get().create.mutate({
        borrowerName: 'Julián',
        amount: 150,
        loanDate: new Date().toISOString(),
      })
    })
    await waitFor(
      () =>
        (result.get().list.data ?? []).length === seededCount + 1 &&
        result.get().accounts.dataUpdatedAt > accountsFetchedAt,
    )

    const created = (result.get().list.data ?? []).find(
      loan => loan.borrowerName === 'Julián',
    )
    expect(created).toBeDefined()
    expect(created?.status).toBe('active')
    expect(created?.remainingAmount).toBe(150)
  })

  it('registers a repayment, updates status and reaches PAID automatically', async () => {
    const client = createTestClient()
    const result = renderWithClient(
      () => ({
        list: useLoans(),
        create: useCreateLoan(),
        repay: useCreateLoanRepayment(),
      }),
      client,
    )

    await settle()

    act(() => {
      result.get().create.mutate({
        borrowerName: 'Sofía',
        amount: 100,
        loanDate: new Date().toISOString(),
      })
    })
    await waitFor(() =>
      (result.get().list.data ?? []).some(loan => loan.borrowerName === 'Sofía'),
    )
    const loanId = (result.get().list.data ?? []).find(
      loan => loan.borrowerName === 'Sofía',
    )!.id

    act(() => {
      result.get().repay.mutate({ id: loanId, input: { amount: 40 } })
    })
    await waitFor(() => {
      const loan = (result.get().list.data ?? []).find(l => l.id === loanId)
      return loan?.status === 'partially_paid'
    })

    let loan = (result.get().list.data ?? []).find(l => l.id === loanId)
    expect(loan?.amountRepaid).toBe(40)
    expect(loan?.remainingAmount).toBe(60)
    expect(loan?.status).toBe('partially_paid')

    act(() => {
      result.get().repay.mutate({ id: loanId, input: { amount: 60 } })
    })
    await waitFor(() => {
      loan = (result.get().list.data ?? []).find(l => l.id === loanId)
      return loan?.status === 'paid'
    })

    expect(loan?.amountRepaid).toBe(100)
    expect(loan?.remainingAmount).toBe(0)
    expect(loan?.status).toBe('paid')
  })

  it('exposes repayment history through useLoan but not through useLoans', async () => {
    const client = createTestClient()
    const result = renderWithClient(
      () => ({
        list: useLoans(),
        detail: useLoan('loan-camila'),
      }),
      client,
    )

    await settle()

    const listed = (result.get().list.data ?? []).find(
      loan => loan.id === 'loan-camila',
    )
    expect(listed?.repayments).toHaveLength(0)
    expect(result.get().detail.data?.repayments.length).toBeGreaterThan(0)
  })

  it('rejects deleting a loan with repayments, and removes one with none', async () => {
    const client = createTestClient()
    const result = renderWithClient(
      () => ({
        list: useLoans(),
        create: useCreateLoan(),
        remove: useDeleteLoan(),
      }),
      client,
    )

    await settle()

    // Seeded with a repayment already applied.
    act(() => {
      result.get().remove.mutate('loan-camila')
    })
    await waitFor(() => result.get().remove.isError || result.get().remove.isSuccess)
    expect(result.get().remove.isError).toBe(true)
    expect(
      (result.get().list.data ?? []).some(loan => loan.id === 'loan-camila'),
    ).toBe(true)

    act(() => {
      result.get().create.mutate({
        borrowerName: 'Mateo',
        amount: 20,
        loanDate: new Date().toISOString(),
      })
    })
    await waitFor(() =>
      (result.get().list.data ?? []).some(loan => loan.borrowerName === 'Mateo'),
    )
    const freshLoanId = (result.get().list.data ?? []).find(
      loan => loan.borrowerName === 'Mateo',
    )!.id
    const countBeforeDelete = (result.get().list.data ?? []).length

    act(() => {
      result.get().remove.mutate(freshLoanId)
    })
    await waitFor(
      () => (result.get().list.data ?? []).length === countBeforeDelete - 1,
    )

    expect(
      (result.get().list.data ?? []).some(loan => loan.id === freshLoanId),
    ).toBe(false)
  })
})
