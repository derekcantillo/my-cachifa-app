import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { categoryRepository } from '@/api/repositoryFactory'
import type { ListCategoriesParams } from '@/api/repositories/interfaces/CategoryRepository'
import type { Category, TransactionKind } from '@/api/types'
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

/**
 * Categories offered for a kind, in the order the catalog lists them. Shared
 * by every form that picks a category for a given movement kind — the
 * register-transaction form and the recurring-expense form alike.
 */
export function useCategoriesForKind(
  categories: readonly Category[] | undefined,
  kind: TransactionKind,
): Category[] {
  return useMemo(
    () => (categories ?? []).filter(category => category.kinds.includes(kind)),
    [categories, kind],
  )
}
