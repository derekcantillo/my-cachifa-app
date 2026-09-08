export type TransactionKind = 'expense' | 'income' | 'saving'

export interface Transaction {
  id: string
  kind: TransactionKind
  amount: number
  categoryId: string
  accountId: string
  /** ISO 8601 date the transaction occurred on. */
  date: string
  description: string
  tags: string[]
  /** Set when this movement fulfils a `RecurringExpense` for the period. */
  recurringExpenseId?: string
  /**
   * `YYYY-MM` this income counts toward. Only meaningful for a SALARY income
   * — see `RegisterTransactionScreen` — every other movement is filed under
   * the month `date` falls in.
   */
  budgetPeriod?: string
  createdAt: string
  updatedAt: string
}

export interface CreateTransactionInput {
  kind: TransactionKind
  amount: number
  categoryId: string
  accountId: string
  date: string
  description: string
  tags?: string[]
  recurringExpenseId?: string
  budgetPeriod?: string
}

export type UpdateTransactionInput = Partial<CreateTransactionInput>
