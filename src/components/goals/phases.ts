import type { GoalPhase } from '@/api/types'

/** The order the method walks phases in, from most to least urgent. */
export const PHASE_ORDER: readonly GoalPhase[] = [
  'urgent',
  'short_term',
  'medium_term',
  'long_term',
]

export const PHASE_LABELS: Record<GoalPhase, string> = {
  urgent: 'Metas urgentes',
  short_term: 'Corto plazo',
  medium_term: 'Mediano plazo',
  long_term: 'Largo plazo',
}

/** Goals carry no icon of their own, so the phase stands in for one. */
export const PHASE_GLYPHS: Record<GoalPhase, string> = {
  urgent: '🛡️',
  short_term: '✈️',
  medium_term: '🚗',
  long_term: '🏡',
}

/** 1-based position of a phase, as shown in "Fase 2 — Corto plazo". */
export function getPhaseNumber(phase: GoalPhase): number {
  return PHASE_ORDER.indexOf(phase) + 1
}
