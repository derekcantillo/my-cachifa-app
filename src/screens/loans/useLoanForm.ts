import { useCallback, useState } from 'react'
import type { CreateLoanInput, Loan, UpdateLoanInput } from '@/api/types'

export interface LoanFormValues {
  borrowerName: string
  amount: number
  loanDate: Date
  dueDate: Date | null
  note: string
  /** `null` leaves the loan unlinked to any account. */
  accountId: string | null
}

export type LoanFormErrors = Partial<Record<'borrowerName' | 'amount', string>>

export interface LoanFormState {
  values: LoanFormValues
  errors: LoanFormErrors
  setBorrowerName: (name: string) => void
  setAmount: (amount: number) => void
  setLoanDate: (date: Date) => void
  setDueDate: (date: Date | null) => void
  setNote: (note: string) => void
  setAccountId: (accountId: string) => void
  /** Validates and returns the payload, or `null` when something is missing. */
  validate: () => CreateLoanInput | null
}

function initialValues(loan: Loan | null | undefined): LoanFormValues {
  if (!loan) {
    return {
      borrowerName: '',
      amount: 0,
      loanDate: new Date(),
      dueDate: null,
      note: '',
      accountId: null,
    }
  }

  return {
    borrowerName: loan.borrowerName,
    amount: loan.amount,
    loanDate: new Date(loan.loanDate),
    dueDate: loan.dueDate ? new Date(loan.dueDate) : null,
    note: loan.note ?? '',
    accountId: loan.accountId ?? null,
  }
}

/**
 * Form state for creating or editing a loan. Editing only ever sends
 * `borrowerName`/`dueDate`/`note` (see `toUpdateInput`) — the amount, the
 * date it was given and the account are fixed once the linked movement
 * exists — but the form keeps every field so the same screen can render both.
 */
export function useLoanForm(loan?: Loan | null): LoanFormState {
  const [values, setValues] = useState<LoanFormValues>(() =>
    initialValues(loan),
  )
  const [errors, setErrors] = useState<LoanFormErrors>({})

  const update = useCallback(
    <TKey extends keyof LoanFormValues>(
      key: TKey,
      value: LoanFormValues[TKey],
    ) => {
      setValues(current => ({ ...current, [key]: value }))
      setErrors(current => ({ ...current, [key]: undefined }))
    },
    [],
  )

  const validate = useCallback((): CreateLoanInput | null => {
    const nextErrors: LoanFormErrors = {}

    if (!values.borrowerName.trim()) {
      nextErrors.borrowerName = 'Ingresa el nombre de quien recibe el préstamo.'
    }
    if (values.amount <= 0) {
      nextErrors.amount = 'Ingresa un monto mayor a cero.'
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return null
    }

    return {
      borrowerName: values.borrowerName.trim(),
      amount: values.amount,
      loanDate: values.loanDate.toISOString(),
      ...(values.dueDate ? { dueDate: values.dueDate.toISOString() } : {}),
      ...(values.note.trim() ? { note: values.note.trim() } : {}),
      ...(values.accountId ? { accountId: values.accountId } : {}),
    }
  }, [values])

  return {
    values,
    errors,
    setBorrowerName: useCallback(
      name => update('borrowerName', name),
      [update],
    ),
    setAmount: useCallback(amount => update('amount', amount), [update]),
    setLoanDate: useCallback(date => update('loanDate', date), [update]),
    setDueDate: useCallback(date => update('dueDate', date), [update]),
    setNote: useCallback(note => update('note', note), [update]),
    setAccountId: useCallback(
      accountId => update('accountId', accountId),
      [update],
    ),
    validate,
  }
}

/** The subset an edit may change — the movement already exists for the rest. */
export function toUpdateInput(input: CreateLoanInput): UpdateLoanInput {
  return {
    borrowerName: input.borrowerName,
    ...(input.dueDate !== undefined ? { dueDate: input.dueDate } : {}),
    ...(input.note !== undefined ? { note: input.note } : {}),
  }
}
