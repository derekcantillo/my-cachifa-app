import type { MonthlyReport } from '../../types/report'

export interface ReportRepository {
  /** @param periodId `FinancialPeriod.id` to report on. */
  getMonthlyReport(periodId: string): Promise<MonthlyReport>
}
