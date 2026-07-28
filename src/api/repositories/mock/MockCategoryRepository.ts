import type { Category } from '../../types/category'
import type {
  CategoryRepository,
  ListCategoriesParams,
} from '../interfaces/CategoryRepository'
import { simulateLatency } from './latency'
import { seedCategories } from './seed-data'

const categories: Category[] = seedCategories.map(category => ({ ...category }))

class MockCategoryRepository implements CategoryRepository {
  async list(params: ListCategoriesParams = {}): Promise<Category[]> {
    await simulateLatency()

    return categories
      .filter(category => (params.kind ? category.kind === params.kind : true))
      .map(category => ({ ...category }))
  }

  async getById(id: string): Promise<Category | null> {
    await simulateLatency()
    const found = categories.find(category => category.id === id)
    return found ? { ...found } : null
  }
}

export const mockCategoryRepository: CategoryRepository =
  new MockCategoryRepository()
