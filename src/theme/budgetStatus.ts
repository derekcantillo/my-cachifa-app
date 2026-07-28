import type { ColorPalette } from './colors'

export type BudgetStatus = 'healthy' | 'warning' | 'exceeded'

const WARNING_THRESHOLD = 70
const EXCEEDED_THRESHOLD = 100

/** Classifies how much of a budget has been consumed. `percent` is 0-100+. */
export function getBudgetStatus(percent: number): BudgetStatus {
  if (percent >= EXCEEDED_THRESHOLD) {
    return 'exceeded'
  }
  if (percent >= WARNING_THRESHOLD) {
    return 'warning'
  }
  return 'healthy'
}

/**
 * Green under 70%, amber from 70% to 99%, red at 100% or above.
 * Colors come from the active palette so both schemes stay in sync.
 */
export function getBudgetStatusColor(
  percent: number,
  colors: ColorPalette,
): string {
  switch (getBudgetStatus(percent)) {
    case 'exceeded':
      return colors.negative
    case 'warning':
      return colors.warning
    case 'healthy':
      return colors.positive
  }
}

/** Share of a limit already used, 0-100+ (0 when there is no limit set). */
export function toPercent(used: number, limit: number): number {
  if (limit <= 0) {
    return 0
  }
  return (used / limit) * 100
}
