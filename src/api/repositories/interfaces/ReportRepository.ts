import type { MonthlyReport } from '../../types/report'

export interface ReportRepository {
  /** @param month Period to report on, formatted 'YYYY-MM'. */
  getMonthlyReport(month: string): Promise<MonthlyReport>
}
