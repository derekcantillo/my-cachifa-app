export type AccountType = 'cash' | 'bank' | 'credit_card' | 'savings'

export interface Account {
  id: string
  name: string
  type: AccountType
  currency: string
  balance: number
}
