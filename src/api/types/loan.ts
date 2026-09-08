export type LoanStatus = 'active' | 'partially_paid' | 'paid'

export interface LoanRepayment {
  id: string
  amount: number
  paidAt: string
  note?: string
}

export interface Loan {
  id: string
  borrowerName: string
  amount: number
  amountRepaid: number
  remainingAmount: number
  status: LoanStatus
  loanDate: string
  dueDate?: string
  note?: string
  accountId?: string
  /**
   * Populated by `getById`; `getAll` leaves it empty — the list endpoint
   * doesn't send repayment history, only the totals a row needs.
   */
  repayments: LoanRepayment[]
}

export interface CreateLoanInput {
  borrowerName: string
  amount: number
  loanDate: string
  dueDate?: string
  note?: string
  accountId?: string
}

export type UpdateLoanInput = Partial<
  Pick<CreateLoanInput, 'borrowerName' | 'dueDate' | 'note'>
>

export interface CreateLoanRepaymentInput {
  amount: number
  /** Defaults to now when left out. */
  paidAt?: string
  note?: string
}
