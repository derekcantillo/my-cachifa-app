import { useCallback, useState } from 'react'
import type {
  CreateRecurringExpenseInput,
  RecurringExpense,
} from '@/api/types'

export interface RecurringExpenseFormValues {
  name: string
  categoryId: string | null
  estimatedAmount: number
  isAmountFixed: boolean
  /** Day of the month, 1-31, kept as text so an empty field isn't "day 0". */
  dayOfMonth: string
  active: boolean
}

export type RecurringExpenseFormErrors = Partial<
  Record<'name' | 'categoryId' | 'estimatedAmount' | 'dayOfMonth', string>
>

export interface RecurringExpenseFormState {
  values: RecurringExpenseFormValues
  errors: RecurringExpenseFormErrors
  setName: (name: string) => void
  setCategoryId: (categoryId: string) => void
  setEstimatedAmount: (amount: number) => void
  setIsAmountFixed: (value: boolean) => void
  setDayOfMonth: (value: string) => void
  setActive: (value: boolean) => void
  /** Validates and returns the payload, or `null` when something is missing. */
  validate: () => CreateRecurringExpenseInput | null
}

const MIN_DAY = 1
const MAX_DAY = 31

function initialValues(
  expense: RecurringExpense | null | undefined,
): RecurringExpenseFormValues {
  if (!expense) {
    return {
      name: '',
      categoryId: null,
      estimatedAmount: 0,
      isAmountFixed: false,
      dayOfMonth: '',
      active: true,
    }
  }

  return {
    name: expense.name,
    categoryId: expense.categoryId,
    estimatedAmount: expense.estimatedAmount,
    isAmountFixed: expense.isAmountFixed,
    dayOfMonth: String(expense.dayOfMonth),
    active: expense.active,
  }
}

/** Form state for creating or editing a recurring expense. */
export function useRecurringExpenseForm(
  expense?: RecurringExpense | null,
): RecurringExpenseFormState {
  const [values, setValues] = useState<RecurringExpenseFormValues>(() =>
    initialValues(expense),
  )
  const [errors, setErrors] = useState<RecurringExpenseFormErrors>({})

  const update = useCallback(
    <TKey extends keyof RecurringExpenseFormValues>(
      key: TKey,
      value: RecurringExpenseFormValues[TKey],
    ) => {
      setValues(current => ({ ...current, [key]: value }))
      setErrors(current => ({ ...current, [key]: undefined }))
    },
    [],
  )

  const validate = useCallback((): CreateRecurringExpenseInput | null => {
    const nextErrors: RecurringExpenseFormErrors = {}

    if (!values.name.trim()) {
      nextErrors.name = 'Ponle un nombre a este gasto.'
    }
    if (!values.categoryId) {
      nextErrors.categoryId = 'Elige una categoría.'
    }
    if (values.estimatedAmount <= 0) {
      nextErrors.estimatedAmount = 'Ingresa un monto mayor a cero.'
    }

    const day = Number(values.dayOfMonth)
    if (
      !values.dayOfMonth.trim() ||
      !Number.isInteger(day) ||
      day < MIN_DAY ||
      day > MAX_DAY
    ) {
      nextErrors.dayOfMonth = 'Ingresa un día entre 1 y 31.'
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0 || !values.categoryId) {
      return null
    }

    return {
      name: values.name.trim(),
      categoryId: values.categoryId,
      estimatedAmount: values.estimatedAmount,
      isAmountFixed: values.isAmountFixed,
      dayOfMonth: day,
      active: values.active,
    }
  }, [values])

  return {
    values,
    errors,
    setName: useCallback(name => update('name', name), [update]),
    setCategoryId: useCallback(
      categoryId => update('categoryId', categoryId),
      [update],
    ),
    setEstimatedAmount: useCallback(
      amount => update('estimatedAmount', amount),
      [update],
    ),
    setIsAmountFixed: useCallback(
      value => update('isAmountFixed', value),
      [update],
    ),
    setDayOfMonth: useCallback(
      value => update('dayOfMonth', value),
      [update],
    ),
    setActive: useCallback(value => update('active', value), [update]),
    validate,
  }
}
