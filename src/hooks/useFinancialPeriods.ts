import { useQuery } from '@tanstack/react-query'
import { financialPeriodRepository } from '@/api/repositoryFactory'
import { queryKeys } from './queryKeys'

/** A period only opens when a salary lands, so an hour is plenty fresh. */
const PERIODS_STALE_TIME = 1000 * 60 * 60

/** Every financial period, most recent first. */
export function useFinancialPeriods() {
  return useQuery({
    queryKey: queryKeys.financialPeriods(),
    queryFn: () => financialPeriodRepository.getAll(),
    staleTime: PERIODS_STALE_TIME,
  })
}

/** The open period — what every period-scoped screen shows by default. */
export function useCurrentPeriod() {
  return useQuery({
    queryKey: queryKeys.currentFinancialPeriod(),
    queryFn: () => financialPeriodRepository.getCurrent(),
    staleTime: PERIODS_STALE_TIME,
  })
}
