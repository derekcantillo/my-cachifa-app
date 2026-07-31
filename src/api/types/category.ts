import type { TransactionKind } from './transaction'

export interface Category {
  /**
   * The backend's `Category` enum value, e.g. 'FOOD'. Categories are an enum
   * there, not a table, so the value is both the id and what travels on every
   * transaction and budget.
   */
  id: string
  /** Spanish name shown in the UI, e.g. 'Alimentación'. */
  name: string
  /**
   * Which kinds of movement may use this category. Most take a single one, but
   * the backend has no income-specific value, so 'OTHER' accepts income too.
   */
  kinds: TransactionKind[]
  icon: string
  color: string
  /** Examples of what belongs here, shown under the name when budgeting. */
  description?: string
}
