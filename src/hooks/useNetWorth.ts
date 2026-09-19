import { useQuery } from '@tanstack/react-query'
import { netWorthRepository } from '@/api/repositoryFactory'
import { queryKeys } from './queryKeys'

/**
 * Moves only when money does — a movement, a repayment, a new starting
 * balance — and each of those invalidates it, so five minutes is plenty.
 */
const NET_WORTH_STALE_TIME = 1000 * 60 * 5

/** Today's net worth snapshot, independent of any financial period. */
export function useNetWorth() {
  return useQuery({
    queryKey: queryKeys.netWorth(),
    queryFn: () => netWorthRepository.get(),
    staleTime: NET_WORTH_STALE_TIME,
  })
}
