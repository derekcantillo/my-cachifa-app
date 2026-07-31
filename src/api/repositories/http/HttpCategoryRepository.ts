import { CATEGORY_CATALOG } from '../../mappers/categoryMapper'
import type { Category } from '../../types/category'
import type {
  CategoryRepository,
  ListCategoriesParams,
} from '../interfaces/CategoryRepository'

/**
 * Categories are the backend's `Category` enum, not a table: there is no
 * `/categories` endpoint to call, and the enum only travels inside
 * transactions and budgets. The catalog — Spanish label, icon, color and the
 * kinds of movement each value accepts — lives in the category mapper, so this
 * repository serves it straight from there and stays in step with whatever the
 * API sends on every other resource.
 */
class HttpCategoryRepository implements CategoryRepository {
  async list(params: ListCategoriesParams = {}): Promise<Category[]> {
    return CATEGORY_CATALOG.filter(category =>
      params.kind ? category.kinds.includes(params.kind) : true,
    ).map(category => ({ ...category }))
  }

  async getById(id: string): Promise<Category | null> {
    const found = CATEGORY_CATALOG.find(category => category.id === id)
    return found ? { ...found } : null
  }
}

export const httpCategoryRepository: CategoryRepository =
  new HttpCategoryRepository()
