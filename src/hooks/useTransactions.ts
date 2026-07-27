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
