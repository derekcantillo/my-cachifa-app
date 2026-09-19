export type AccountType = 'cash' | 'bank' | 'credit_card' | 'savings'

export interface Account {
  id: string
  name: string
  type: AccountType
  /**
   * Starting point the balance is computed from. Can be negative: a credit
   * card may start out owing money.
   */
  initialBalance: number
  /** ISO 8601 date `initialBalance` applies from; `null` when never set. */
  initialBalanceDate: string | null
  /**
   * `initialBalance` plus every movement since `initialBalanceDate`,
   * computed by the backend.
   */
  currentBalance: number
}

export interface CreateAccountInput {
  name: string
  type: AccountType
}

export interface SetInitialBalanceInput {
  amount: number
  /** ISO 8601 date the balance applies from. */
  date: string
}
