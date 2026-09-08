import { httpClient } from '../../httpClient'
import { toAmount } from '../../mappers/decimalMapper'
import {
  toBackendCategory,
  toCategoryId,
  type BackendCategory,
} from '../../mappers/categoryMapper'
import type {
  CreateRecurringExpenseInput,
  RecurringExpense,
  UpdateRecurringExpenseInput,
} from '../../types/recurringExpense'
import type { RecurringExpenseRepository } from '../interfaces/RecurringExpenseRepository'

const BASE_PATH = '/recurring-expenses'

interface RecurringExpenseDto {
  id: string
  name: string
  category: BackendCategory
  estimatedAmount: number | string
  isAmountFixed: boolean
  dayOfMonth: number
  active: boolean
  createdAt: string
  updatedAt: string
}

interface RecurringExpensePayload {
  name?: string
  category?: BackendCategory
  estimatedAmount?: number
  isAmountFixed?: boolean
  dayOfMonth?: number
  active?: boolean
}

function toRecurringExpense(dto: RecurringExpenseDto): RecurringExpense {
  return {
    id: dto.id,
    name: dto.name,
    categoryId: toCategoryId(dto.category),
    estimatedAmount: toAmount(dto.estimatedAmount),
    isAmountFixed: dto.isAmountFixed,
    dayOfMonth: dto.dayOfMonth,
    active: dto.active,
  }
}

function toPayload(
  input: UpdateRecurringExpenseInput,
): RecurringExpensePayload {
  return {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.categoryId !== undefined
      ? { category: toBackendCategory(input.categoryId) }
      : {}),
    ...(input.estimatedAmount !== undefined
      ? { estimatedAmount: input.estimatedAmount }
      : {}),
    ...(input.isAmountFixed !== undefined
      ? { isAmountFixed: input.isAmountFixed }
      : {}),
    ...(input.dayOfMonth !== undefined
      ? { dayOfMonth: input.dayOfMonth }
      : {}),
    ...(input.active !== undefined ? { active: input.active } : {}),
  }
}

class HttpRecurringExpenseRepository implements RecurringExpenseRepository {
  async getAll(): Promise<RecurringExpense[]> {
    const response = await httpClient.get<RecurringExpenseDto[]>(BASE_PATH)
    return response.data.map(toRecurringExpense)
  }

  async getPending(month: string): Promise<RecurringExpense[]> {
    const response = await httpClient.get<RecurringExpenseDto[]>(
      `${BASE_PATH}/pending`,
      { params: { month } },
    )
    return response.data.map(toRecurringExpense)
  }

  async create(
    input: CreateRecurringExpenseInput,
  ): Promise<RecurringExpense> {
    const response = await httpClient.post<RecurringExpenseDto>(
      BASE_PATH,
      toPayload(input),
    )
    return toRecurringExpense(response.data)
  }

  async update(
    id: string,
    input: UpdateRecurringExpenseInput,
  ): Promise<RecurringExpense> {
    const response = await httpClient.patch<RecurringExpenseDto>(
      `${BASE_PATH}/${id}`,
      toPayload(input),
    )
    return toRecurringExpense(response.data)
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`${BASE_PATH}/${id}`)
  }
}

export const httpRecurringExpenseRepository: RecurringExpenseRepository =
  new HttpRecurringExpenseRepository()
