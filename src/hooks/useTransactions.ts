import { useQuery } from '@tanstack/react-query'
import { transactionRepository } from '@/api/repositoryFactory'
import type { ListTransactionsParams } from '@/api/repositories/interfaces/TransactionRepository'
import { queryKeys } from './queryKeys'

export function useTransactions(params?: ListTransactionsParams) {
  return useQuery({
    queryKey: queryKeys.transactions(params),
    queryFn: () => transactionRepository.list(params),
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
