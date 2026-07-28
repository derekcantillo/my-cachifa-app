import { useQuery } from '@tanstack/react-query'
import { accountRepository } from '@/api/repositoryFactory'
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
