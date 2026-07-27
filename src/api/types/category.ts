import type { TransactionKind } from './transaction'

export interface Category {
  id: string
  name: string
  /** Which kind of transaction this category applies to. */
  kind: TransactionKind
  icon: string
  color: string
}
