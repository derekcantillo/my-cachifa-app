import axios from 'axios'
import { httpClient } from '../../httpClient'
import type {
  CreateTransactionInput,
  Transaction,
  UpdateTransactionInput,
} from '../../types/transaction'
import type {
  ListTransactionsParams,
  TransactionRepository,
} from '../interfaces/TransactionRepository'

const BASE_PATH = '/transactions'

class HttpTransactionRepository implements TransactionRepository {
  async list(params?: ListTransactionsParams): Promise<Transaction[]> {
    const response = await httpClient.get<Transaction[]>(BASE_PATH, { params })
    return response.data
  }

  async getById(id: string): Promise<Transaction | null> {
    try {
      const response = await httpClient.get<Transaction>(`${BASE_PATH}/${id}`)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null
      }
      throw error
    }
  }

  async create(input: CreateTransactionInput): Promise<Transaction> {
    const response = await httpClient.post<Transaction>(BASE_PATH, input)
    return response.data
  }

  async update(
    id: string,
    input: UpdateTransactionInput,
  ): Promise<Transaction> {
    const response = await httpClient.patch<Transaction>(
      `${BASE_PATH}/${id}`,
      input,
    )
    return response.data
  }

  async remove(id: string): Promise<void> {
    await httpClient.delete(`${BASE_PATH}/${id}`)
  }
}

export const httpTransactionRepository: TransactionRepository =
  new HttpTransactionRepository()
