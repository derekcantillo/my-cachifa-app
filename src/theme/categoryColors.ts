/**
 * Category colors are fixed in the app instead of being taken from whatever the
 * API sends, so a category reads the same everywhere: the reports donut, the
 * expense chips and every icon. The hues are picked to stay legible on both the
 * light and the dark surface, so there is one value per category, not two.
 */

interface CategoryColorEntry {
  /**
   * Category id, which is the backend's `Category` enum value — see
   * `src/api/mappers/categoryMapper.ts`.
   */
  id?: string
  /** Icon the category ships with, so callers that only know the glyph match. */
  icon: string
  color: string
}

const ENTRIES: readonly CategoryColorEntry[] = [
  { id: 'FOOD', icon: 'utensils', color: '#F97316' },
  { id: 'TRANSPORT', icon: 'car', color: '#3B82F6' },
  { id: 'ENTERTAINMENT', icon: 'game-controller', color: '#A855F7' },
  { id: 'SERVICES', icon: 'bolt', color: '#EAB308' },
  { id: 'DEBT', icon: 'credit-card', color: '#EF4444' },
  { id: 'HOUSING', icon: 'home', color: '#0EA5E9' },
  { id: 'VEHICLE', icon: 'vehicle', color: '#22C55E' },
  { id: 'HEALTH', icon: 'health', color: '#14B8A6' },
  { id: 'SAVING', icon: 'piggy-bank', color: '#2563EB' },
  { id: 'SALARY', icon: 'salary', color: '#16A34A' },
  { id: 'CONTINGENCY', icon: 'contingency', color: '#F59E0B' },
  { id: 'LOAN', icon: 'loan', color: '#0D9488' },
  { id: 'EDUCATION', icon: 'education', color: '#84CC16' },
  { id: 'TAXES', icon: 'receipt', color: '#7C2D12' },
  { id: 'PERSONAL', icon: 'shopping-bag', color: '#EC4899' },
  { id: 'OTHER', icon: 'wallet', color: '#64748B' },
  { icon: 'shopping-cart', color: '#16A34A' },
  { icon: 'film', color: '#EC4899' },
  { icon: 'banknote', color: '#16A34A' },
  { icon: 'gift', color: '#F43F5E' },
]

/** Used when a category is unknown and has no key to derive a color from. */
export const NEUTRAL_CATEGORY_COLOR = '#64748B'

/**
 * Categories the app does not know yet still need to be told apart in a chart,
 * so they get a stable color derived from their key.
 */
const FALLBACK_PALETTE: readonly string[] = [
  '#0891B2',
  '#7C3AED',
  '#DB2777',
  '#CA8A04',
  '#0F766E',
  '#B45309',
]

function indexBy(
  key: (entry: CategoryColorEntry) => string | undefined,
): Record<string, string> {
  return ENTRIES.reduce<Record<string, string>>((index, entry) => {
    const value = key(entry)
    if (value) {
      index[value] = entry.color
    }
    return index
  }, {})
}

const COLORS_BY_ID = indexBy(entry => entry.id)
const COLORS_BY_ICON = indexBy(entry => entry.icon)

/** Fixed color per category id — the map the rest of the app reads. */
export const categoryColors: Readonly<Record<string, string>> = COLORS_BY_ID

function pickFallback(key: string): string {
  let hash = 0
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) % 1_000_003
  }
  return (
    FALLBACK_PALETTE[hash % FALLBACK_PALETTE.length] ?? NEUTRAL_CATEGORY_COLOR
  )
}

/** Anything that can identify a category: a full `Category`, an id, an icon. */
export interface CategoryColorSource {
  id?: string
  icon?: string
}

/**
 * Color for a category, matched by id first and by icon second. Unknown
 * categories get a stable color from the fallback palette rather than all
 * collapsing onto the same gray.
 */
export function getCategoryColor(category?: CategoryColorSource): string {
  if (!category) {
    return NEUTRAL_CATEGORY_COLOR
  }

  const { id, icon } = category
  const known = (id && COLORS_BY_ID[id]) || (icon && COLORS_BY_ICON[icon])
  if (known) {
    return known
  }

  const key = id ?? icon
  return key ? pickFallback(key) : NEUTRAL_CATEGORY_COLOR
}

/** Shorthand for callers that only hold the id, e.g. a report distribution row. */
export function getCategoryColorById(categoryId?: string): string {
  return getCategoryColor(categoryId ? { id: categoryId } : undefined)
}
