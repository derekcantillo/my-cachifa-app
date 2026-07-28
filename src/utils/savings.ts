const MS_PER_DAY = 86_400_000
const DAYS_PER_MONTH = 30.44

/**
 * Whole months left until a date, counting the current one. Returns 0 when the
 * date has passed, so callers can treat "overdue" as "due now".
 */
export function monthsUntil(isoDate: string, now: Date = new Date()): number {
  const remaining = new Date(isoDate).getTime() - now.getTime()
  return Math.max(0, Math.ceil(remaining / (DAYS_PER_MONTH * MS_PER_DAY)))
}

/**
 * How much has to be set aside each month to close `remaining` by `targetDate`.
 *
 * Returns `null` when there is no target date to pace against, and the whole
 * remaining amount once the date is here or past — at that point the advice is
 * to cover it now, not to spread it over zero months.
 */
export function monthlySavingNeeded(
  remaining: number,
  targetDate?: string,
  now: Date = new Date(),
): number | null {
  if (remaining <= 0) {
    return 0
  }
  if (!targetDate) {
    return null
  }

  const months = monthsUntil(targetDate, now)
  return months <= 0 ? remaining : remaining / months
}
