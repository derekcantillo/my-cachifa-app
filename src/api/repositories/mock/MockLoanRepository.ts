import { generateId } from '@/utils'
import type {
  CreateLoanInput,
  CreateLoanRepaymentInput,
  Loan,
  UpdateLoanInput,
} from '../../types/loan'
import type { LoanRepository } from '../interfaces/LoanRepository'
import { simulateLatency, simulateWrite } from './latency'
import { seedLoans } from './seed-data'

let loans: Loan[] = seedLoans.map(loan => ({
  ...loan,
  repayments: loan.repayments.map(repayment => ({ ...repayment })),
}))

class MockLoanRepository implements LoanRepository {
  async getAll(): Promise<Loan[]> {
    await simulateLatency()
    // Mirrors the backend: the list doesn't carry repayment history.
    return loans.map(loan => ({ ...loan, repayments: [] }))
  }

  async getById(id: string): Promise<Loan | null> {
    await simulateLatency()
    const found = loans.find(loan => loan.id === id)
    return found
      ? { ...found, repayments: found.repayments.map(r => ({ ...r })) }
      : null
  }

  async create(input: CreateLoanInput): Promise<Loan> {
    await simulateWrite()

    const created: Loan = {
      id: generateId('loan'),
      borrowerName: input.borrowerName,
      amount: input.amount,
      amountRepaid: 0,
      remainingAmount: input.amount,
      status: 'active',
      loanDate: input.loanDate,
      dueDate: input.dueDate,
      note: input.note,
      accountId: input.accountId,
      repayments: [],
    }
    loans = [created, ...loans]
    return { ...created }
  }

  async addRepayment(
    id: string,
    input: CreateLoanRepaymentInput,
  ): Promise<Loan> {
    await simulateWrite()

    const existing = loans.find(loan => loan.id === id)
    if (!existing) {
      throw new Error(`Loan ${id} not found`)
    }

    const amountRepaid = existing.amountRepaid + input.amount
    const updated: Loan = {
      ...existing,
      amountRepaid,
      remainingAmount: Math.max(0, existing.amount - amountRepaid),
      status: amountRepaid >= existing.amount ? 'paid' : 'partially_paid',
      repayments: [
        {
          id: generateId('loan-repay'),
          amount: input.amount,
          paidAt: input.paidAt ?? new Date().toISOString(),
          note: input.note,
        },
        ...existing.repayments,
      ],
    }
    loans = loans.map(loan => (loan.id === id ? updated : loan))
    return { ...updated }
  }

  async update(id: string, input: UpdateLoanInput): Promise<Loan> {
    await simulateWrite()

    const existing = loans.find(loan => loan.id === id)
    if (!existing) {
      throw new Error(`Loan ${id} not found`)
    }

    const updated: Loan = { ...existing, ...input }
    loans = loans.map(loan => (loan.id === id ? updated : loan))
    return { ...updated }
  }

  async delete(id: string): Promise<void> {
    await simulateWrite()

    const existing = loans.find(loan => loan.id === id)
    if (existing && existing.amountRepaid > 0) {
      throw new Error(
        'No puedes eliminar un préstamo con abonos registrados.',
      )
    }

    loans = loans.filter(loan => loan.id !== id)
  }
}

export const mockLoanRepository: LoanRepository = new MockLoanRepository()
