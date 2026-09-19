import type { FinancialPeriod } from '../../types/financialPeriod'

export interface FinancialPeriodRepository {
  /** Every period, most recent first. */
  getAll(): Promise<FinancialPeriod[]>
  /** The open period (`endDate === null`). */
  getCurrent(): Promise<FinancialPeriod>
}
