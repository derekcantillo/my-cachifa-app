import { useCallback, useMemo, useState } from 'react'
import type {
  CreateTransactionInput,
  Transaction,
  TransactionKind,
} from '@/api/types'

/** Tag that marks the twice-a-year bonus, the one income the plan treats apart. */
export const SEMESTER_BONUS_TAG = 'prima-semestral'

export interface TransactionFormValues {
  kind: TransactionKind
  /** Amount in whole units; 0 means "not filled in yet". */
  amount: number
  categoryId: string | null
  accountId: string | null
  description: string
  date: Date
  /** Only meaningful for income; adds `prima-semestral` to the tags. */
  semesterBonus: boolean
  /** Set from a "Pendientes este mes" prefill; cleared the moment kind or category changes. */
  recurringExpenseId: string | null
}

export type TransactionFormErrors = Partial<
  Record<'amount' | 'categoryId' | 'accountId', string>
>

/** Stands in for an empty description, which the form leaves optional. */
const KIND_FALLBACK_DESCRIPTIONS: Record<TransactionKind, string> = {
  expense: 'Gasto',
  income: 'Ingreso',
  saving: 'Ahorro',
}

function fallbackDescription(values: TransactionFormValues): string {
  return KIND_FALLBACK_DESCRIPTIONS[values.kind]
}

export interface TransactionFormPrefill {
  categoryId?: string
  /** Suggested amount; the user can still change it before saving. */
  amount?: number
  recurringExpenseId?: string
}

interface UseTransactionFormOptions {
  /** Movement being edited; leaving it out starts an empty expense. */
  transaction?: Transaction | null
  /** Used to preselect the only sensible account when there is just one. */
  defaultAccountId?: string
  /**
   * Seeds a new movement from a pending recurring expense — "Registrar" on
   * the expenses screen hands these off here. Ignored while editing.
   */
  prefill?: TransactionFormPrefill
}

export interface TransactionFormState {
  values: TransactionFormValues
  errors: TransactionFormErrors
  setKind: (kind: TransactionKind) => void
  setAmount: (amount: number) => void
  setCategoryId: (categoryId: string) => void
  setAccountId: (accountId: string) => void
  setDescription: (description: string) => void
  setDate: (date: Date) => void
  setSemesterBonus: (value: boolean) => void
  /** Validates and returns the payload, or `null` when something is missing. */
  validate: () => CreateTransactionInput | null
}

function initialValues(
  transaction: Transaction | null | undefined,
  defaultAccountId: string | undefined,
  prefill: TransactionFormPrefill | undefined,
): TransactionFormValues {
  if (!transaction) {
    return {
      kind: 'expense',
      amount: prefill?.amount ?? 0,
      categoryId: prefill?.categoryId ?? null,
      accountId: defaultAccountId ?? null,
      description: '',
      date: new Date(),
      semesterBonus: false,
      recurringExpenseId: prefill?.recurringExpenseId ?? null,
    }
  }

  return {
    kind: transaction.kind,
    amount: transaction.amount,
    categoryId: transaction.categoryId,
    accountId: transaction.accountId,
    description: transaction.description,
    date: new Date(transaction.date),
    semesterBonus: transaction.tags.includes(SEMESTER_BONUS_TAG),
    recurringExpenseId: transaction.recurringExpenseId ?? null,
  }
}

/**
 * Form state for registering or editing a movement. Kept apart from the screen
 * so the create and the edit route share one set of rules.
 */
export function useTransactionForm({
  transaction,
  defaultAccountId,
  prefill,
}: UseTransactionFormOptions = {}): TransactionFormState {
  const [values, setValues] = useState<TransactionFormValues>(() =>
    initialValues(transaction, defaultAccountId, prefill),
  )
  const [errors, setErrors] = useState<TransactionFormErrors>({})

  // Tags the form does not surface — 'recurrente' and anything the backend
  // adds — are carried through so editing a movement never drops them.
  const passthroughTags = useMemo(
    () => (transaction?.tags ?? []).filter(tag => tag !== SEMESTER_BONUS_TAG),
    [transaction],
  )

  const update = useCallback(
    <TKey extends keyof TransactionFormValues>(
      key: TKey,
      value: TransactionFormValues[TKey],
    ) => {
      setValues(current => ({ ...current, [key]: value }))
      setErrors(current => ({ ...current, [key]: undefined }))
    },
    [],
  )

  const setKind = useCallback((kind: TransactionKind) => {
    // Categories belong to a single kind, so switching kinds drops the pick
    // — and with it, whether this is still the same pending recurring expense.
    setValues(current => ({
      ...current,
      kind,
      categoryId: null,
      semesterBonus: kind === 'income' ? current.semesterBonus : false,
      recurringExpenseId: null,
    }))
    setErrors(current => ({ ...current, categoryId: undefined }))
  }, [])

  const setCategoryId = useCallback((categoryId: string) => {
    setValues(current => ({
      ...current,
      categoryId,
      // A category picked by hand is no longer the prefilled expense.
      recurringExpenseId: null,
    }))
    setErrors(current => ({ ...current, categoryId: undefined }))
  }, [])

  const validate = useCallback((): CreateTransactionInput | null => {
    const nextErrors: TransactionFormErrors = {}

    if (values.amount <= 0) {
      nextErrors.amount = 'Ingresa un monto mayor a cero.'
    }
    if (!values.categoryId) {
      nextErrors.categoryId = 'Elige una categoría.'
    }
    if (!values.accountId) {
      nextErrors.accountId = 'Elige una cuenta.'
    }

    setErrors(nextErrors)

    if (
      Object.keys(nextErrors).length > 0 ||
      !values.categoryId ||
      !values.accountId
    ) {
      return null
    }

    return {
      kind: values.kind,
      amount: values.amount,
      categoryId: values.categoryId,
      accountId: values.accountId,
      date: values.date.toISOString(),
      // The description is optional; the category names the movement when the
      // user leaves it empty.
      description: values.description.trim() || fallbackDescription(values),
      tags:
        values.kind === 'income' && values.semesterBonus
          ? [...passthroughTags, SEMESTER_BONUS_TAG]
          : passthroughTags,
      // The backend only accepts this on create — editing never resends it.
      ...(!transaction && values.recurringExpenseId
        ? { recurringExpenseId: values.recurringExpenseId }
        : {}),
    }
  }, [passthroughTags, transaction, values])

  return {
    values,
    errors,
    setKind,
    setCategoryId,
    setAmount: useCallback(amount => update('amount', amount), [update]),
    setAccountId: useCallback(
      accountId => update('accountId', accountId),
      [update],
    ),
    setDescription: useCallback(
      description => update('description', description),
      [update],
    ),
    setDate: useCallback(date => update('date', date), [update]),
    setSemesterBonus: useCallback(
      value => update('semesterBonus', value),
      [update],
    ),
    validate,
  }
}
