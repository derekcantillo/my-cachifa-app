import { useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionRepository } from '@/api/repositoryFactory'
import type { CreateTransactionInput } from '@/api/types'
import { queryKeys } from './queryKeys'

export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateTransactionInput) =>
      transactionRepository.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactionsRoot })
      queryClient.invalidateQueries({ queryKey: queryKeys.reportsRoot })
    },
  })
}
