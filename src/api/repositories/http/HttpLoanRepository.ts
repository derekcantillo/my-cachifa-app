import { isNotFoundError } from '../../apiError'
import { httpClient } from '../../httpClient'
import { toAmount } from '../../mappers/decimalMapper'
import type {
  CreateLoanInput,
  CreateLoanRepaymentInput,
  Loan,
  LoanRepayment,
  LoanStatus,
  UpdateLoanInput,
} from '../../types/loan'
import type { LoanRepository } from '../interfaces/LoanRepository'

const BASE_PATH = '/loans'

type BackendLoanStatus = 'ACTIVE' | 'PARTIALLY_PAID' | 'PAID'

const LOAN_STATUSES: Record<BackendLoanStatus, LoanStatus> = {
  ACTIVE: 'active',
  PARTIALLY_PAID: 'partially_paid',
  PAID: 'paid',
}

interface LoanRepaymentDto {
  id: string
  amount: number | string
  paidAt: string
  note: string | null
  createdAt: string
}

interface LoanDto {
  id: string
  borrowerName: string
  amount: number | string
  amountRepaid: number | string
  remainingAmount: number | string
  status: BackendLoanStatus
  loanDate: string
  dueDate: string | null
  note: string | null
  accountId: string | null
  createdAt: string
  updatedAt: string
}

interface LoanDetailDto extends LoanDto {
  repayments: LoanRepaymentDto[]
}

function toLoanRepayment(dto: LoanRepaymentDto): LoanRepayment {
  return {
    id: dto.id,
    amount: toAmount(dto.amount),
    paidAt: dto.paidAt,
    note: dto.note ?? undefined,
  }
}

function toLoan(dto: LoanDto, repayments: LoanRepaymentDto[] = []): Loan {
  return {
    id: dto.id,
    borrowerName: dto.borrowerName,
    amount: toAmount(dto.amount),
    amountRepaid: toAmount(dto.amountRepaid),
    remainingAmount: toAmount(dto.remainingAmount),
    status: LOAN_STATUSES[dto.status] ?? 'active',
    loanDate: dto.loanDate,
    dueDate: dto.dueDate ?? undefined,
    note: dto.note ?? undefined,
    accountId: dto.accountId ?? undefined,
    repayments: repayments.map(toLoanRepayment),
  }
}

interface CreateLoanPayload {
  borrowerName: string
  amount: number
  loanDate: string
  dueDate?: string
  note?: string
  accountId?: string
}

interface UpdateLoanPayload {
  borrowerName?: string
  dueDate?: string
  note?: string
}

interface CreateLoanRepaymentPayload {
  amount: number
  paidAt?: string
  note?: string
}

class HttpLoanRepository implements LoanRepository {
  async getAll(): Promise<Loan[]> {
    const response = await httpClient.get<LoanDto[]>(BASE_PATH)
    return response.data.map(dto => toLoan(dto))
  }

  async getById(id: string): Promise<Loan | null> {
    try {
      const response = await httpClient.get<LoanDetailDto>(
        `${BASE_PATH}/${id}`,
      )
      return toLoan(response.data, response.data.repayments)
    } catch (error) {
      if (isNotFoundError(error)) {
        return null
      }
      throw error
    }
  }

  async create(input: CreateLoanInput): Promise<Loan> {
    const payload: CreateLoanPayload = {
      borrowerName: input.borrowerName,
      amount: input.amount,
      loanDate: input.loanDate,
      ...(input.dueDate !== undefined ? { dueDate: input.dueDate } : {}),
      ...(input.note !== undefined ? { note: input.note } : {}),
      ...(input.accountId !== undefined ? { accountId: input.accountId } : {}),
    }
    const response = await httpClient.post<LoanDto>(BASE_PATH, payload)
    return toLoan(response.data)
  }

  async addRepayment(
    id: string,
    input: CreateLoanRepaymentInput,
  ): Promise<Loan> {
    const payload: CreateLoanRepaymentPayload = {
      amount: input.amount,
      ...(input.paidAt !== undefined ? { paidAt: input.paidAt } : {}),
      ...(input.note !== undefined ? { note: input.note } : {}),
    }
    const response = await httpClient.post<LoanDetailDto>(
      `${BASE_PATH}/${id}/repayments`,
      payload,
    )
    return toLoan(response.data, response.data.repayments)
  }

  async update(id: string, input: UpdateLoanInput): Promise<Loan> {
    const payload: UpdateLoanPayload = {
      ...(input.borrowerName !== undefined
        ? { borrowerName: input.borrowerName }
        : {}),
      ...(input.dueDate !== undefined ? { dueDate: input.dueDate } : {}),
      ...(input.note !== undefined ? { note: input.note } : {}),
    }
    const response = await httpClient.patch<LoanDto>(
      `${BASE_PATH}/${id}`,
      payload,
    )
    return toLoan(response.data)
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`${BASE_PATH}/${id}`)
  }
}

export const httpLoanRepository: LoanRepository = new HttpLoanRepository()
