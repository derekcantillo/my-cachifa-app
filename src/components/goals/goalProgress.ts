import type { Goal, GoalStatus } from '@/api/types'
import { toPercent } from '@/theme'
import { monthsUntil } from '@/utils'
import type { BadgeTone } from '@/components/ui'
import { getPhaseNumber, PHASE_GLYPHS, PHASE_LABELS } from './phases'

const STATUS_LABELS: Record<GoalStatus, string> = {
  active: 'En progreso',
  completed: 'Completada',
  paused: 'Pausada',
}

const STATUS_TONES: Record<GoalStatus, BadgeTone> = {
  active: 'primary',
  completed: 'positive',
  paused: 'neutral',
}

export interface GoalProgress {
  /** Share of the target already saved, 0-100+. */
  percent: number
  /** Same share, rounded and capped at 100 for display. */
  displayPercent: number
  glyph: string
  /** Reads "Fase 3 · Mediano plazo". */
  phaseLabel: string
  /** Just "Fase 3", for the badge on a card. */
  shortPhaseLabel: string
  statusLabel: string
  statusTone: BadgeTone
  /** Months left until the target date; `null` when the goal has none. */
  monthsRemaining: number | null
  /** Still missing to reach the target; never negative. */
  remainingAmount: number
  completed: boolean
}

/**
 * Everything both `GoalCard` variants show about a goal, derived in one place
 * so the compact and the full card can never drift apart.
 */
export function getGoalProgress(
  goal: Goal,
  now: Date = new Date(),
): GoalProgress {
  const percent = toPercent(goal.currentAmount, goal.targetAmount)

  return {
    percent,
    displayPercent: Math.min(Math.round(percent), 100),
    glyph: PHASE_GLYPHS[goal.phase],
    phaseLabel: `Fase ${getPhaseNumber(goal.phase)} · ${
      PHASE_LABELS[goal.phase]
    }`,
    shortPhaseLabel: `Fase ${getPhaseNumber(goal.phase)}`,
    statusLabel: STATUS_LABELS[goal.status],
    statusTone: STATUS_TONES[goal.status],
    monthsRemaining: goal.targetDate ? monthsUntil(goal.targetDate, now) : null,
    remainingAmount: Math.max(0, goal.targetAmount - goal.currentAmount),
    completed: goal.status === 'completed' || percent >= 100,
  }
}

/** "8 meses restantes" / "Último mes" / null when the goal has no target date. */
export function formatMonthsRemaining(months: number | null): string | null {
  if (months === null) {
    return null
  }
  if (months === 0) {
    return 'Plazo cumplido'
  }
  if (months === 1) {
    return 'Último mes'
  }
  return `${months} meses restantes`
}
