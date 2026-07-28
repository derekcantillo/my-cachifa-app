import { useQuery } from '@tanstack/react-query'
import { categoryRepository } from '@/api/repositoryFactory'
import type { ListCategoriesParams } from '@/api/repositories/interfaces/CategoryRepository'
import { queryKeys } from './queryKeys'

/** Categories change rarely, so they stay fresh far longer than movements. */
const CATEGORIES_STALE_TIME_MS = 60 * 60 * 1000

export function useCategories(params?: ListCategoriesParams) {
  return useQuery({
    queryKey: queryKeys.categories(params),
    queryFn: () => categoryRepository.list(params),
    staleTime: CATEGORIES_STALE_TIME_MS,
  })
}
