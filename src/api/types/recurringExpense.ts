export interface RecurringExpense {
  id: string
  name: string
  categoryId: string
  estimatedAmount: number
  /** Whether the real charge is always exactly `estimatedAmount` (rent) or just varies (a utility bill). */
  isAmountFixed: boolean
  /** Day of the month, 1-31, the charge is due on. */
  dayOfMonth: number
  active: boolean
}

export interface CreateRecurringExpenseInput {
  name: string
  categoryId: string
  estimatedAmount: number
  isAmountFixed: boolean
  dayOfMonth: number
  active?: boolean
}

export type UpdateRecurringExpenseInput = Partial<CreateRecurringExpenseInput>
