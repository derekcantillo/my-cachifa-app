import type { Category } from '../../types/category'
import type { TransactionKind } from '../../types/transaction'

export interface ListCategoriesParams {
  kind?: TransactionKind
}

export interface CategoryRepository {
  list(params?: ListCategoriesParams): Promise<Category[]>
  getById(id: string): Promise<Category | null>
}
