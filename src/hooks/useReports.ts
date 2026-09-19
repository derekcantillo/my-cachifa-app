import { useQuery } from '@tanstack/react-query'
import { reportRepository } from '@/api/repositoryFactory'
import { queryKeys } from './queryKeys'

/** Waits (stays pending) until a `periodId` is known. */
export function useReports(periodId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.report(periodId ?? ''),
    queryFn: () => reportRepository.getMonthlyReport(periodId ?? ''),
    enabled: periodId !== undefined,
  })
}
