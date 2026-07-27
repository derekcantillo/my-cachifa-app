import axios from 'axios'
import { httpClient } from '../../httpClient'
import type {
  Budget,
  CreateBudgetInput,
  UpdateBudgetInput,
} from '../../types/budget'
import type {
  BudgetRepository,
  ListBudgetsParams,
} from '../interfaces/BudgetRepository'

const BASE_PATH = '/budgets'

class HttpBudgetRepository implements BudgetRepository {
  async list(params?: ListBudgetsParams): Promise<Budget[]> {
    const response = await httpClient.get<Budget[]>(BASE_PATH, { params })
    return response.data
  }

  async getById(id: string): Promise<Budget | null> {
    try {
      const response = await httpClient.get<Budget>(`${BASE_PATH}/${id}`)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null
      }
      throw error
    }
  }

  async create(input: CreateBudgetInput): Promise<Budget> {
    const response = await httpClient.post<Budget>(BASE_PATH, input)
    return response.data
  }

  async update(id: string, input: UpdateBudgetInput): Promise<Budget> {
    const response = await httpClient.patch<Budget>(`${BASE_PATH}/${id}`, input)
    return response.data
  }

  async remove(id: string): Promise<void> {
    await httpClient.delete(`${BASE_PATH}/${id}`)
  }
}

export const httpBudgetRepository: BudgetRepository = new HttpBudgetRepository()
