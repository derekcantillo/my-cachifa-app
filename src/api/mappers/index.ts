export {
  BACKEND_CATEGORIES,
  CATEGORY_CATALOG,
  FALLBACK_CATEGORY,
  getCategoriesForKind,
  getCategoryLabel,
  isBackendCategory,
  toBackendCategory,
  toCategoryId,
} from './categoryMapper'
export type { BackendCategory } from './categoryMapper'
export { toAmount, toOptionalAmount, toPercentage } from './decimalMapper'
