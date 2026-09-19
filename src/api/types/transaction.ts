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
}

export type UpdateTransactionInput = Partial<CreateTransactionInput>
