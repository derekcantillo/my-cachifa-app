import { httpClient } from '../../httpClient'
import type { MonthlyReport } from '../../types/report'
import type { ReportRepository } from '../interfaces/ReportRepository'

class HttpReportRepository implements ReportRepository {
  async getMonthlyReport(month: string): Promise<MonthlyReport> {
    const response = await httpClient.get<MonthlyReport>('/reports/monthly', {
      params: { month },
    })
    return response.data
  }
}

export const httpReportRepository: ReportRepository = new HttpReportRepository()
