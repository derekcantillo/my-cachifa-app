import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { accountRepository } from '@/api/repositoryFactory'
import type { CreateAccountInput, SetInitialBalanceInput } from '@/api/types'
import { queryKeys } from './queryKeys'

/** Accounts change rarely, so they stay fresh far longer than movements. */
const ACCOUNTS_STALE_TIME_MS = 60 * 60 * 1000

export function useAccounts() {
  return useQuery({
    queryKey: queryKeys.accounts(),
    queryFn: () => accountRepository.list(),
    staleTime: ACCOUNTS_STALE_TIME_MS,
  })
}

export function useCreateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateAccountInput) => accountRepository.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts() })
    },
  })
}

export interface SetInitialBalanceVariables {
  id: string
  input: SetInitialBalanceInput
}

/** A new starting point moves the account's balance, and with it net worth. */
export function useSetInitialBalance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: SetInitialBalanceVariables) =>
      accountRepository.setInitialBalance(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts() })
      queryClient.invalidateQueries({ queryKey: queryKeys.netWorth() })
    },
  })
}
