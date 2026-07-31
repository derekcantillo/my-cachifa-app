export type AccountType = 'cash' | 'bank' | 'credit_card' | 'savings'

export interface Account {
  id: string
  name: string
  type: AccountType
  /**
   * The backend tracks no balance per account — money lives in the
   * transactions — so this is only set by the mock.
   */
  balance?: number
  /** Same: the backend is single-currency and does not send one. */
  currency?: string
}
