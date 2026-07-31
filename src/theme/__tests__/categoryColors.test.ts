import { CATEGORY_CATALOG } from '@/api/mappers/categoryMapper'
import {
  categoryColors,
  getCategoryColor,
  getCategoryColorById,
  NEUTRAL_CATEGORY_COLOR,
} from '../categoryColors'

describe('categoryColors', () => {
  it('covers every category the app ships with', () => {
    CATEGORY_CATALOG.forEach(category => {
      expect(categoryColors[category.id]).toBeDefined()
    })
  })

  it('resolves a category to the same color by id, by icon and by both', () => {
    CATEGORY_CATALOG.forEach(category => {
      const byBoth = getCategoryColor(category)

      expect(byBoth).toBe(categoryColors[category.id])
      expect(getCategoryColorById(category.id)).toBe(byBoth)
      expect(getCategoryColor({ icon: category.icon })).toBe(byBoth)
    })
  })

  it('gives unknown categories a stable color instead of a shared gray', () => {
    const first = getCategoryColorById('cat-unknown')
    expect(first).toBe(getCategoryColorById('cat-unknown'))
    expect(first).not.toBe(getCategoryColorById('cat-other-unknown'))
  })

  it('falls back to the neutral color when nothing identifies the category', () => {
    expect(getCategoryColor()).toBe(NEUTRAL_CATEGORY_COLOR)
    expect(getCategoryColor({})).toBe(NEUTRAL_CATEGORY_COLOR)
  })
})
