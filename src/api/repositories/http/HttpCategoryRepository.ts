import axios from 'axios'
import { httpClient } from '../../httpClient'
import type { Category } from '../../types/category'
import type {
  CategoryRepository,
  ListCategoriesParams,
} from '../interfaces/CategoryRepository'

const BASE_PATH = '/categories'

class HttpCategoryRepository implements CategoryRepository {
  async list(params?: ListCategoriesParams): Promise<Category[]> {
    const response = await httpClient.get<Category[]>(BASE_PATH, { params })
    return response.data
  }

  async getById(id: string): Promise<Category | null> {
    try {
      const response = await httpClient.get<Category>(`${BASE_PATH}/${id}`)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null
      }
      throw error
    }
  }
}

export const httpCategoryRepository: CategoryRepository =
  new HttpCategoryRepository()
