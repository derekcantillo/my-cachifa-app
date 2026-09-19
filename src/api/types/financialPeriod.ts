/**
 * A salary-anchored budgeting period. The backend opens one each time a SALARY
 * income lands, so periods do not line up with calendar months — every
 * period-scoped endpoint takes a `periodId` instead of a 'YYYY-MM' key.
 */
export interface FinancialPeriod {
  /** cuid. */
  id: string
  /** Human label, e.g. "28 ago 2026 – 27 sep 2026" or "28 ago 2026 – en curso". */
  label: string
  /** ISO 8601 instant the period starts at (inclusive). */
  startDate: string
  /**
   * ISO 8601 instant the next period starts at (exclusive). `null` for the
   * open, current period.
   */
  endDate: string | null
}
