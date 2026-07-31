import { CATEGORY_CATALOG } from '../../mappers/categoryMapper'
import type { Category } from '../../types/category'
import type {
  CategoryRepository,
  ListCategoriesParams,
} from '../interfaces/CategoryRepository'
import { simulateLatency } from './latency'

/**
 * Categories are the backend's `Category` enum, so the mock serves the very
 * same catalog the HTTP repository does — only with simulated latency.
 */
class MockCategoryRepository implements CategoryRepository {
  async list(params: ListCategoriesParams = {}): Promise<Category[]> {
    await simulateLatency()

    return CATEGORY_CATALOG.filter(category =>
      params.kind ? category.kinds.includes(params.kind) : true,
    ).map(category => ({ ...category }))
  }

  async getById(id: string): Promise<Category | null> {
    await simulateLatency()
    const found = CATEGORY_CATALOG.find(category => category.id === id)
    return found ? { ...found } : null
  }
}

export const mockCategoryRepository: CategoryRepository =
  new MockCategoryRepository()
