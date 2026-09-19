import { getCategoryColorById } from '@/theme/categoryColors'
import type { Category } from '../types/category'
import type { TransactionKind } from '../types/transaction'

/**
 * The backend's `Category` enum is the single source of truth for categories:
 * there is no `/categories` endpoint, the value travels inside every
 * transaction and every budget, and the app shows a Spanish label for it.
 *
 * So a category id in the app *is* the enum value. That keeps the mapping
 * one-to-one in both directions and removes the class of bugs where the mock
 * and the real API disagree on what identifies a category.
 */
export const BACKEND_CATEGORIES = [
  'FOOD',
  'TRANSPORT',
  'ENTERTAINMENT',
  'SERVICES',
  'DEBT',
  'HOUSING',
  'VEHICLE',
  'HEALTH',
  'SAVING',
  'SALARY',
  'CONTINGENCY',
  'LOAN',
  'EDUCATION',
  'TAXES',
  'PERSONAL',
  'OTHER',
] as const

export type BackendCategory = (typeof BACKEND_CATEGORIES)[number]

/** Where an unknown or unmappable value lands, matching the backend's default. */
export const FALLBACK_CATEGORY: BackendCategory = 'OTHER'

interface CategoryDefinition {
  /** Spanish name shown everywhere in the UI. */
  label: string
  /** Which kinds of movement may use this category. */
  kinds: TransactionKind[]
  icon: string
  description: string
}

/**
 * One entry per enum value, in the order the chips and the budget planner list
 * them. "Ocio" and "Entretenimiento" are a single concept here (ENTERTAINMENT),
 * as are "Alimentación" and "Mercado" (FOOD) — the mock used to split both.
 */
const DEFINITIONS: Record<BackendCategory, CategoryDefinition> = {
  FOOD: {
    label: 'Alimentación',
    kinds: ['expense'],
    icon: 'utensils',
    description: 'Mercado, restaurantes, domicilios',
  },
  TRANSPORT: {
    label: 'Transporte',
    kinds: ['expense'],
    icon: 'car',
    description: 'Gasolina, transporte público',
  },
  ENTERTAINMENT: {
    label: 'Ocio y entretenimiento',
    kinds: ['expense'],
    icon: 'game-controller',
    description: 'Salidas, cine, suscripciones',
  },
  SERVICES: {
    label: 'Servicios',
    kinds: ['expense'],
    icon: 'bolt',
    description: 'Internet, celular, luz',
  },
  DEBT: {
    label: 'Deuda',
    kinds: ['expense'],
    icon: 'credit-card',
    description: 'Cuotas y tarjetas',
  },
  HOUSING: {
    label: 'Vivienda',
    kinds: ['expense'],
    icon: 'home',
    description: 'Arriendo, administración',
  },
  VEHICLE: {
    label: 'Vehículo',
    kinds: ['expense'],
    icon: 'vehicle',
    description: 'Mantenimiento, seguro, parqueadero',
  },
  HEALTH: {
    label: 'Salud',
    kinds: ['expense'],
    icon: 'health',
    description: 'Consultas, medicamentos, gimnasio',
  },
  SAVING: {
    label: 'Ahorro',
    kinds: ['saving'],
    icon: 'piggy-bank',
    description: 'Lo que apartas cada mes',
  },
  SALARY: {
    label: 'Salario',
    kinds: ['income'],
    icon: 'salary',
    description: 'Sueldo mensual',
  },
  CONTINGENCY: {
    label: 'Imprevistos',
    kinds: ['expense'],
    icon: 'contingency',
    description: 'Gastos inesperados',
  },
  // Loans never go through the movement form — they're created and repaid
  // from the Loans screens directly — so no `kind` claims this category.
  LOAN: {
    label: 'Préstamo',
    kinds: [],
    icon: 'loan',
    description: 'Dinero prestado a terceros',
  },
  EDUCATION: {
    label: 'Educación',
    kinds: ['expense'],
    icon: 'education',
    description: 'Matrículas, cursos, libros',
  },
  TAXES: {
    label: 'Impuestos',
    kinds: ['expense'],
    icon: 'receipt',
    description: 'Renta, predial, impuesto vehicular',
  },
  PERSONAL: {
    label: 'Gastos personales',
    kinds: ['expense'],
    icon: 'shopping-bag',
    description: 'Ropa, cuidado personal, compras',
  },
  // The backend has no other income-specific value, so OTHER carries income too.
  OTHER: {
    label: 'Otros',
    kinds: ['expense', 'income'],
    icon: 'wallet',
    description: 'Ingresos y gastos sin categoría',
  },
}

/**
 * Ids the mock used before the categories were keyed by the backend enum.
 * Kept so a value stored on a device from an earlier build still resolves —
 * note how both halves of each split concept land on the same enum value.
 */
const LEGACY_IDS: Record<string, BackendCategory> = {
  'cat-alimentacion': 'FOOD',
  'cat-mercado': 'FOOD',
  'cat-transporte': 'TRANSPORT',
  'cat-ocio': 'ENTERTAINMENT',
  'cat-entretenimiento': 'ENTERTAINMENT',
  'cat-servicios': 'SERVICES',
  'cat-deuda': 'DEBT',
  'cat-vivienda': 'HOUSING',
  'cat-ahorro': 'SAVING',
  'cat-salario': 'SALARY',
}

const BY_VALUE = new Set<string>(BACKEND_CATEGORIES)

/** True for a string that is already a backend enum value. */
export function isBackendCategory(value: string): value is BackendCategory {
  return BY_VALUE.has(value)
}

/**
 * Category id used by the app -> enum value the backend persists. Anything
 * unrecognised falls back to `OTHER` rather than failing the request, which is
 * what the backend itself does with categories it cannot place.
 */
export function toBackendCategory(categoryId: string): BackendCategory {
  if (isBackendCategory(categoryId)) {
    return categoryId
  }
  return LEGACY_IDS[categoryId] ?? FALLBACK_CATEGORY
}

/** Enum value the backend sent -> category id the app indexes rows by. */
export function toCategoryId(category: string): BackendCategory {
  return isBackendCategory(category) ? category : FALLBACK_CATEGORY
}

/** Spanish label for an enum value, e.g. 'ENTERTAINMENT' -> 'Ocio y entretenimiento'. */
export function getCategoryLabel(category: string): string {
  return DEFINITIONS[toCategoryId(category)].label
}

function toCategory(value: BackendCategory): Category {
  const definition = DEFINITIONS[value]

  return {
    id: value,
    name: definition.label,
    kinds: definition.kinds,
    icon: definition.icon,
    color: getCategoryColorById(value),
    description: definition.description,
  }
}

/**
 * The category catalog, served by both the mock and the HTTP repository so the
 * two modes label and color categories identically.
 */
export const CATEGORY_CATALOG: readonly Category[] =
  BACKEND_CATEGORIES.map(toCategory)

/** Catalog entries that accept the given kind of movement. */
export function getCategoriesForKind(kind: TransactionKind): Category[] {
  return CATEGORY_CATALOG.filter(category => category.kinds.includes(kind))
}
