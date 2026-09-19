import { httpClient } from '../../httpClient'
import type { FinancialPeriod } from '../../types/financialPeriod'
import type { FinancialPeriodRepository } from '../interfaces/FinancialPeriodRepository'

const BASE_PATH = '/financial-periods'

/** The response already has the app's shape; this only drops extra fields. */
function toFinancialPeriod(dto: FinancialPeriod): FinancialPeriod {
  return {
    id: dto.id,
    label: dto.label,
    startDate: dto.startDate,
    endDate: dto.endDate ?? null,
  }
}

class HttpFinancialPeriodRepository implements FinancialPeriodRepository {
  async getAll(): Promise<FinancialPeriod[]> {
    const response = await httpClient.get<FinancialPeriod[]>(BASE_PATH)
    return response.data.map(toFinancialPeriod)
  }

  async getCurrent(): Promise<FinancialPeriod> {
    const response = await httpClient.get<FinancialPeriod>(
      `${BASE_PATH}/current`,
    )
    return toFinancialPeriod(response.data)
  }
}

export const httpFinancialPeriodRepository: FinancialPeriodRepository =
  new HttpFinancialPeriodRepository()
