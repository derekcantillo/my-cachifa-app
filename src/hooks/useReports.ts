import { useQuery } from '@tanstack/react-query'
import { reportRepository } from '@/api/repositoryFactory'
import { queryKeys } from './queryKeys'

export function useReports(month: string) {
  return useQuery({
    queryKey: queryKeys.report(month),
    queryFn: () => reportRepository.getMonthlyReport(month),
  })
}
