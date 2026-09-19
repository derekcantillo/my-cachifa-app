import { useQuery } from '@tanstack/react-query'
import { transactionRepository } from '@/api/repositoryFactory'
import type { ListTransactionsParams } from '@/api/repositories/interfaces/TransactionRepository'
import { queryKeys } from './queryKeys'

/**
 * Pass `enabled: false` while the period to filter by is still loading, so the
 * list is not fetched for the backend's default period first.
 */
export function useTransactions(
  params?: ListTransactionsParams,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: queryKeys.transactions(params),
    queryFn: () => transactionRepository.list(params),
    enabled: options.enabled ?? true,
  })
}

/**
 * A single movement, for the detail screen. Resolves to `null` when it is gone.
 * Pass `enabled: false` on the create path, where there is nothing to load yet.
 */
export function useTransaction(
  id: string,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: queryKeys.transaction(id),
    queryFn: () => transactionRepository.getById(id),
    enabled: options.enabled ?? true,
  })
}
