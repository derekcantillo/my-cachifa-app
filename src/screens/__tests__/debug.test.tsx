import React from 'react'
import { act, create } from 'react-test-renderer'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getCurrentMonthKey } from '@/utils'
import { useReportsData } from '@/screens/reports/useReportsData'

jest.setTimeout(15000)

it('debug', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  let latest: ReturnType<typeof useReportsData> | undefined
  function Harness() {
    latest = useReportsData(getCurrentMonthKey())
    return null
  }
  act(() => {
    create(
      <QueryClientProvider client={client}>
        <Harness />
      </QueryClientProvider>,
    )
  })
  await act(async () => {
    await new Promise<void>(r => setTimeout(r, 1500))
  })
  console.log('TOPEXPENSE', JSON.stringify(latest?.topExpense))
  console.log('MOSTFREQ', JSON.stringify(latest?.mostFrequent))
  console.log('SLICES', JSON.stringify(latest?.distribution))
})
