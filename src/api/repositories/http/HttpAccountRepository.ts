import axios from 'axios'
import { httpClient } from '../../httpClient'
import type { Account } from '../../types/account'
import type { AccountRepository } from '../interfaces/AccountRepository'

const BASE_PATH = '/accounts'

class HttpAccountRepository implements AccountRepository {
  async list(): Promise<Account[]> {
    const response = await httpClient.get<Account[]>(BASE_PATH)
    return response.data
  }

  async getById(id: string): Promise<Account | null> {
    try {
      const response = await httpClient.get<Account>(`${BASE_PATH}/${id}`)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null
      }
      throw error
    }
  }
}

export const httpAccountRepository: AccountRepository =
  new HttpAccountRepository()
