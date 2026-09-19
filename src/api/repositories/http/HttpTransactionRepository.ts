import { isNotFoundError } from '../../apiError'
import { httpClient } from '../../httpClient'
import { toAmount } from '../../mappers/decimalMapper'
import {
  toBackendCategory,
  toCategoryId,
  type BackendCategory,
} from '../../mappers/categoryMapper'
import type {
  CreateTransactionInput,
  Transaction,
  TransactionKind,
  UpdateTransactionInput,
} from '../../types/transaction'
import type {
  ListTransactionsParams,
  TransactionRepository,
} from '../interfaces/TransactionRepository'

const BASE_PATH = '/transactions'

/** `TransactionType` as declared in the backend's Prisma schema. */
type BackendTransactionType = 'EXPENSE' | 'INCOME' | 'SAVING' | 'DEBT_PAYMENT'

interface TransactionDto {
  id: string
  amount: number | string
  type: BackendTransactionType
  category: BackendCategory
  description: string | null
  tags: string[]
  accountId: string | null
  recurringExpenseId: string | null
  transactionDate: string
  periodId: string | null
  createdAt: string
  updatedAt: string
}

interface TransactionPayload {
  amount?: number
  type?: BackendTransactionType
  category?: BackendCategory
  description?: string
  accountId?: string
  recurringExpenseId?: string
  tags?: string[]
  transactionDate?: string
}

/**
 * `DEBT_PAYMENT` has no counterpart in the app — it is money out just like an
 * expense, and only the WhatsApp flow creates one — so it reads as an expense
 * and is never written back as one.
 */
const KINDS: Record<BackendTransactionType, TransactionKind> = {
  EXPENSE: 'expense',
  INCOME: 'income',
  SAVING: 'saving',
  DEBT_PAYMENT: 'expense',
}

const TYPES: Record<TransactionKind, BackendTransactionType> = {
  expense: 'EXPENSE',
  income: 'INCOME',
  saving: 'SAVING',
}

function toTransaction(dto: TransactionDto): Transaction {
  return {
    id: dto.id,
    kind: KINDS[dto.type] ?? 'expense',
    amount: toAmount(dto.amount),
    categoryId: toCategoryId(dto.category),
    accountId: dto.accountId ?? '',
    date: dto.transactionDate,
    description: dto.description ?? '',
    tags: dto.tags ?? [],
    ...(dto.recurringExpenseId
      ? { recurringExpenseId: dto.recurringExpenseId }
      : {}),
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  }
}

/** Only the fields actually present are sent, so a PATCH stays partial. */
function toPayload(input: UpdateTransactionInput): TransactionPayload {
  return {
    ...(input.amount !== undefined ? { amount: input.amount } : {}),
    ...(input.kind !== undefined ? { type: TYPES[input.kind] } : {}),
    ...(input.categoryId !== undefined
      ? { category: toBackendCategory(input.categoryId) }
      : {}),
    ...(input.description !== undefined
      ? { description: input.description }
      : {}),
    ...(input.accountId ? { accountId: input.accountId } : {}),
    ...(input.recurringExpenseId
      ? { recurringExpenseId: input.recurringExpenseId }
      : {}),
    ...(input.tags !== undefined ? { tags: input.tags } : {}),
    ...(input.date !== undefined ? { transactionDate: input.date } : {}),
  }
}

class HttpTransactionRepository implements TransactionRepository {
  /**
   * The API filters by period only, so the remaining filters are applied here
   * on the period's rows — a handful of records the screen already needs whole
   * to compute what each budget has spent.
   */
  async list(params: ListTransactionsParams = {}): Promise<Transaction[]> {
    const response = await httpClient.get<TransactionDto[]>(BASE_PATH, {
      params: params.periodId ? { periodId: params.periodId } : {},
    })

    const categoryId = params.categoryId
      ? toBackendCategory(params.categoryId)
      : undefined

    return response.data
      .map(toTransaction)
      .filter(transaction =>
        params.kind ? transaction.kind === params.kind : true,
      )
      .filter(transaction =>
        categoryId ? transaction.categoryId === categoryId : true,
      )
      .filter(transaction =>
        params.accountId ? transaction.accountId === params.accountId : true,
      )
      .sort((a, b) => b.date.localeCompare(a.date))
  }

  async getById(id: string): Promise<Transaction | null> {
    try {
      const response = await httpClient.get<TransactionDto>(
        `${BASE_PATH}/${id}`,
      )
      return toTransaction(response.data)
    } catch (error) {
      if (isNotFoundError(error)) {
        return null
      }
      throw error
    }
  }

  async create(input: CreateTransactionInput): Promise<Transaction> {
    const response = await httpClient.post<TransactionDto>(
      BASE_PATH,
      toPayload(input),
    )
    return toTransaction(response.data)
  }

  async update(
    id: string,
    input: UpdateTransactionInput,
  ): Promise<Transaction> {
    const response = await httpClient.patch<TransactionDto>(
      `${BASE_PATH}/${id}`,
      toPayload(input),
    )
    return toTransaction(response.data)
  }

  async remove(id: string): Promise<void> {
    await httpClient.delete(`${BASE_PATH}/${id}`)
  }
}

export const httpTransactionRepository: TransactionRepository =
  new HttpTransactionRepository()
