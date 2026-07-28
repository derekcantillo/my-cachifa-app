const LOCALE = 'es-CO'

/** A period key formatted 'YYYY-MM', the shape repositories filter by. */
export type MonthKey = string

// Month keys are UTC-based to match how the API filters periods (the ISO date
// prefix), so the label has to be rendered in UTC too.
const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat(LOCALE, {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

const DAY_LABEL_FORMATTER = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'short',
})

const FULL_DATE_FORMATTER = new Intl.DateTimeFormat(LOCALE, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

/** Bare month name, for headings like "Presupuesto Julio". */
const MONTH_NAME_FORMATTER = new Intl.DateTimeFormat(LOCALE, {
  month: 'long',
  timeZone: 'UTC',
})

/** Abbreviated month, for chart axes where a full name would not fit. */
const MONTH_SHORT_FORMATTER = new Intl.DateTimeFormat(LOCALE, {
  month: 'short',
  timeZone: 'UTC',
})

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/** Parses 'YYYY-MM' into the first instant of that month, in UTC. */
function parseMonthKey(month: MonthKey): Date {
  const [year, monthNumber] = month.split('-')
  return new Date(Date.UTC(Number(year), Number(monthNumber) - 1, 1))
}

/**
 * Repositories filter by the ISO date prefix, so a period key is the UTC month
 * of the date — deriving it locally would drift by one month near boundaries.
 */
export function toMonthKey(date: Date): MonthKey {
  return date.toISOString().slice(0, 7)
}

export function getCurrentMonthKey(): MonthKey {
  return toMonthKey(new Date())
}

/** Moves a month key forward (positive) or backward (negative) by whole months. */
export function shiftMonthKey(month: MonthKey, offset: number): MonthKey {
  const date = parseMonthKey(month)
  date.setUTCMonth(date.getUTCMonth() + offset)
  return toMonthKey(date)
}

/** 'YYYY-MM' -> 'Julio 2026'. */
export function formatMonthYear(month: MonthKey): string {
  return capitalize(MONTH_LABEL_FORMATTER.format(parseMonthKey(month)))
}

/** 'YYYY-MM' -> 'Julio'. */
export function formatMonthName(month: MonthKey): string {
  return capitalize(MONTH_NAME_FORMATTER.format(parseMonthKey(month)))
}

/** 'YYYY-MM' -> 'Jul'. The locale's trailing dot is dropped for chart axes. */
export function formatMonthShort(month: MonthKey): string {
  const label = MONTH_SHORT_FORMATTER.format(parseMonthKey(month))
  return capitalize(label.replace(/\.$/, ''))
}

/** Date -> 'Lunes, 24 de julio'. */
export function formatFullDate(date: Date = new Date()): string {
  return capitalize(FULL_DATE_FORMATTER.format(date))
}

/** ISO date -> '27 jul'. */
export function formatDayMonth(isoDate: string): string {
  return DAY_LABEL_FORMATTER.format(new Date(isoDate))
}

/**
 * Days still to come in a period, today included. Returns 0 once the month is
 * in the past and the whole month's length when it is still ahead.
 */
export function daysLeftInMonth(
  month: MonthKey,
  now: Date = new Date(),
): number {
  const start = parseMonthKey(month)
  const monthLength = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0),
  ).getUTCDate()

  const currentMonth = toMonthKey(now)
  if (month < currentMonth) {
    return 0
  }
  if (month > currentMonth) {
    return monthLength
  }

  return monthLength - now.getUTCDate() + 1
}

const MINUTE_MS = 60_000
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS

/**
 * ISO date -> 'Hace 3 días'. Falls back to a day/month label past a week, where
 * a relative distance stops being easier to read than the date itself.
 */
export function formatRelativeTime(
  isoDate: string,
  now: Date = new Date(),
): string {
  const elapsed = now.getTime() - new Date(isoDate).getTime()

  if (elapsed < 0) {
    return formatDayMonth(isoDate)
  }
  if (elapsed < HOUR_MS) {
    const minutes = Math.max(1, Math.floor(elapsed / MINUTE_MS))
    return `Hace ${minutes} min`
  }
  if (elapsed < DAY_MS) {
    const hours = Math.floor(elapsed / HOUR_MS)
    return `Hace ${hours} h`
  }

  const days = Math.floor(elapsed / DAY_MS)
  if (days === 1) {
    return 'Ayer'
  }
  if (days < 7) {
    return `Hace ${days} días`
  }

  return formatDayMonth(isoDate)
}

/** True when the ISO date falls within the last `days` days (inclusive of now). */
export function isWithinLastDays(
  isoDate: string,
  days: number,
  now: Date = new Date(),
): boolean {
  const elapsed = now.getTime() - new Date(isoDate).getTime()
  return elapsed >= 0 && elapsed <= days * DAY_MS
}
