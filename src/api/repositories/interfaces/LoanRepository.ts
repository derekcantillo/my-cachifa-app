import type {
  CreateLoanInput,
  CreateLoanRepaymentInput,
  Loan,
  UpdateLoanInput,
} from '../../types/loan'

export interface LoanRepository {
  getAll(): Promise<Loan[]>
  /** Includes `repayments`, which `getAll`'s rows leave empty. */
  getById(id: string): Promise<Loan | null>
  create(input: CreateLoanInput): Promise<Loan>
  addRepayment(id: string, input: CreateLoanRepaymentInput): Promise<Loan>
  update(id: string, input: UpdateLoanInput): Promise<Loan>
  delete(id: string): Promise<void>
}
