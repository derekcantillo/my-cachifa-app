import type { FinancialPeriod } from '../../types/financialPeriod'
import type { FinancialPeriodRepository } from '../interfaces/FinancialPeriodRepository'
import { simulateLatency } from './latency'
import { seedFinancialPeriods } from './seed-data'

class MockFinancialPeriodRepository implements FinancialPeriodRepository {
  async getAll(): Promise<FinancialPeriod[]> {
    await simulateLatency()
    return [...seedFinancialPeriods]
      .sort((a, b) => b.startDate.localeCompare(a.startDate))
      .map(period => ({ ...period }))
  }

  async getCurrent(): Promise<FinancialPeriod> {
    await simulateLatency()
    const current = seedFinancialPeriods.find(period => period.endDate === null)
    if (!current) {
      throw new Error('No open financial period')
    }
    return { ...current }
  }
}

export const mockFinancialPeriodRepository: FinancialPeriodRepository =
  new MockFinancialPeriodRepository()
