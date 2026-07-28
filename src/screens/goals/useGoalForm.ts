import { useCallback, useState } from 'react'
import type {
  CreateGoalInput,
  Goal,
  GoalPhase,
  UpdateGoalInput,
} from '@/api/types'

export interface GoalFormValues {
  name: string
  targetAmount: number
  /** What is already saved. Only editable while creating the goal. */
  currentAmount: number
  targetDate: Date | null
  phase: GoalPhase
  active: boolean
}

export type GoalFormErrors = Partial<
  Record<'name' | 'targetAmount' | 'currentAmount', string>
>

export interface GoalFormState {
  values: GoalFormValues
  errors: GoalFormErrors
  setName: (name: string) => void
  setTargetAmount: (amount: number) => void
  setCurrentAmount: (amount: number) => void
  setTargetDate: (date: Date | null) => void
  setPhase: (phase: GoalPhase) => void
  setActive: (active: boolean) => void
  /** Validates and returns the payload, or `null` when something is missing. */
  validate: () => CreateGoalInput | null
}

const DEFAULT_TARGET_MONTHS = 6

/** New goals open on a date a few months out, the one the field shows. */
export function defaultTargetDate(now: Date = new Date()): Date {
  const date = new Date(now)
  date.setMonth(date.getMonth() + DEFAULT_TARGET_MONTHS)
  return date
}

function initialValues(goal: Goal | null | undefined): GoalFormValues {
  if (!goal) {
    return {
      name: '',
      targetAmount: 0,
      currentAmount: 0,
      targetDate: defaultTargetDate(),
      phase: 'short_term',
      active: true,
    }
  }

  return {
    name: goal.name,
    targetAmount: goal.targetAmount,
    currentAmount: goal.currentAmount,
    targetDate: goal.targetDate ? new Date(goal.targetDate) : null,
    phase: goal.phase,
    active: goal.status !== 'paused',
  }
}

/**
 * Form state for creating or editing a goal. The screen renders a live preview
 * from `values`, so every field is kept as the shape `GoalCard` expects.
 */
export function useGoalForm(goal?: Goal | null): GoalFormState {
  const [values, setValues] = useState<GoalFormValues>(() =>
    initialValues(goal),
  )
  const [errors, setErrors] = useState<GoalFormErrors>({})

  const update = useCallback(
    <TKey extends keyof GoalFormValues>(
      key: TKey,
      value: GoalFormValues[TKey],
    ) => {
      setValues(current => ({ ...current, [key]: value }))
      setErrors(current => ({ ...current, [key]: undefined }))
    },
    [],
  )

  const validate = useCallback((): CreateGoalInput | null => {
    const nextErrors: GoalFormErrors = {}

    if (!values.name.trim()) {
      nextErrors.name = 'Ponle un nombre a tu meta.'
    }
    if (values.targetAmount <= 0) {
      nextErrors.targetAmount = 'Ingresa un monto objetivo mayor a cero.'
    }
    if (values.currentAmount > values.targetAmount) {
      nextErrors.currentAmount =
        'El ahorro actual no puede superar el objetivo.'
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return null
    }

    return {
      name: values.name.trim(),
      targetAmount: values.targetAmount,
      phase: values.phase,
      currentAmount: values.currentAmount,
      status: values.active ? 'active' : 'paused',
      ...(values.targetDate
        ? { targetDate: values.targetDate.toISOString() }
        : {}),
    }
  }, [values])

  return {
    values,
    errors,
    setName: useCallback(name => update('name', name), [update]),
    setTargetAmount: useCallback(
      amount => update('targetAmount', amount),
      [update],
    ),
    setCurrentAmount: useCallback(
      amount => update('currentAmount', amount),
      [update],
    ),
    setTargetDate: useCallback(date => update('targetDate', date), [update]),
    setPhase: useCallback(phase => update('phase', phase), [update]),
    setActive: useCallback(active => update('active', active), [update]),
    validate,
  }
}

/**
 * The subset of the form an existing goal accepts: what is already saved moves
 * through contributions, never through the edit form.
 */
export function toUpdateInput(input: CreateGoalInput): UpdateGoalInput {
  const { currentAmount: _currentAmount, ...editable } = input
  return editable
}

/** Builds the goal the live preview card renders, straight from the form. */
export function toPreviewGoal(values: GoalFormValues): Goal {
  return {
    id: 'preview',
    name: values.name.trim() || 'Tu nueva meta',
    targetAmount: values.targetAmount || 1,
    currentAmount: values.currentAmount,
    phase: values.phase,
    status: values.active ? 'active' : 'paused',
    ...(values.targetDate
      ? { targetDate: values.targetDate.toISOString() }
      : {}),
    contributions: [],
    createdAt: new Date().toISOString(),
  }
}
