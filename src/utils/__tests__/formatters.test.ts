import { lightColors } from '@/theme/colors'
import { getBudgetStatus, getBudgetStatusColor, toPercent } from '@/theme'
import { formatCurrency } from '../currency'
import {
  daysLeftInMonth,
  formatMonthName,
  formatMonthYear,
  formatRelativeTime,
  getCurrentMonthKey,
  shiftMonthKey,
} from '../date'
import {
  sumByKind,
  sumExpensesByCategory,
  sortByDateDesc,
} from '../transactions'
import type { Transaction } from '@/api/types'

/** Digits are grouped with '.' and the currency symbol may carry a NBSP. */
function digitsOf(value: string): string {
  return value.replace(/[^\d]/g, '')
}

describe('formatCurrency', () => {
  it('formats whole pesos by default', () => {
    const formatted = formatCurrency(1250.4)
    expect(formatted).toContain('$')
    expect(digitsOf(formatted)).toBe('1250')
  })

  it('keeps decimals when asked', () => {
    expect(digitsOf(formatCurrency(1250.4, { withDecimals: true }))).toBe(
      '125040',
    )
  })

  it('marks positive amounts when signed', () => {
    expect(formatCurrency(100, { signed: true }).startsWith('+')).toBe(true)
    expect(formatCurrency(-100, { signed: true }).startsWith('+')).toBe(false)
    expect(formatCurrency(100).startsWith('+')).toBe(false)
  })
})

describe('month keys', () => {
  it('shifts across year boundaries', () => {
    expect(shiftMonthKey('2026-01', -1)).toBe('2025-12')
    expect(shiftMonthKey('2026-12', 1)).toBe('2027-01')
  })

  it('builds the current period as YYYY-MM', () => {
    expect(getCurrentMonthKey()).toMatch(/^\d{4}-\d{2}$/)
  })

  it('labels a month in Spanish with a capital initial', () => {
    const label = formatMonthYear('2026-07')
    expect(label).toContain('2026')
    expect(label.charAt(0)).toBe(label.charAt(0).toUpperCase())
  })

  it('labels a bare month without the year', () => {
    expect(formatMonthName('2026-07')).not.toContain('2026')
  })
})

describe('daysLeftInMonth', () => {
  it('counts today as one of the remaining days', () => {
    expect(daysLeftInMonth('2026-07', new Date('2026-07-24T12:00:00Z'))).toBe(8)
    expect(daysLeftInMonth('2026-07', new Date('2026-07-31T12:00:00Z'))).toBe(1)
  })

  it('is zero for months already gone and full for months ahead', () => {
    expect(daysLeftInMonth('2026-06', new Date('2026-07-10T12:00:00Z'))).toBe(0)
    expect(daysLeftInMonth('2026-08', new Date('2026-07-10T12:00:00Z'))).toBe(
      31,
    )
  })
})

describe('formatRelativeTime', () => {
  const now = new Date('2026-07-27T12:00:00.000Z')

  it('describes recent moments in minutes and hours', () => {
    expect(formatRelativeTime('2026-07-27T11:30:00.000Z', now)).toBe(
      'Hace 30 min',
    )
    expect(formatRelativeTime('2026-07-27T08:00:00.000Z', now)).toBe('Hace 4 h')
  })

  it('describes the previous days in words', () => {
    expect(formatRelativeTime('2026-07-26T11:00:00.000Z', now)).toBe('Ayer')
    expect(formatRelativeTime('2026-07-24T11:00:00.000Z', now)).toBe(
      'Hace 3 días',
    )
  })

  it('falls back to a date past a week', () => {
    expect(formatRelativeTime('2026-07-01T11:00:00.000Z', now)).not.toContain(
      'Hace',
    )
  })
})

describe('budget status', () => {
  it('classifies by the 70% and 100% thresholds', () => {
    expect(getBudgetStatus(69.9)).toBe('healthy')
    expect(getBudgetStatus(70)).toBe('warning')
    expect(getBudgetStatus(99.9)).toBe('warning')
    expect(getBudgetStatus(100)).toBe('exceeded')
    expect(getBudgetStatus(140)).toBe('exceeded')
  })

  it('maps each status onto a palette color', () => {
    expect(getBudgetStatusColor(10, lightColors)).toBe(lightColors.positive)
    expect(getBudgetStatusColor(80, lightColors)).toBe(lightColors.warning)
    expect(getBudgetStatusColor(120, lightColors)).toBe(lightColors.negative)
  })

  it('treats a missing limit as 0%', () => {
    expect(toPercent(50, 0)).toBe(0)
    expect(toPercent(50, 200)).toBe(25)
  })
})

describe('transaction aggregations', () => {
  const base = {
    accountId: 'acc-main',
    tags: [],
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-01T00:00:00.000Z',
  }

  const transactions: Transaction[] = [
    {
      ...base,
      id: 't1',
      kind: 'expense',
      amount: 100,
      categoryId: 'cat-a',
      date: '2026-07-01T00:00:00.000Z',
      description: 'a',
    },
    {
      ...base,
      id: 't2',
      kind: 'expense',
      amount: 50,
      categoryId: 'cat-a',
      date: '2026-07-05T00:00:00.000Z',
      description: 'b',
    },
    {
      ...base,
      id: 't3',
      kind: 'income',
      amount: 900,
      categoryId: 'cat-b',
      date: '2026-07-03T00:00:00.000Z',
      description: 'c',
    },
  ]

  it('sums by kind', () => {
    expect(sumByKind(transactions, 'expense')).toBe(150)
    expect(sumByKind(transactions, 'income')).toBe(900)
    expect(sumByKind(transactions, 'saving')).toBe(0)
  })

  it('sums expenses per category, ignoring other kinds', () => {
    expect(sumExpensesByCategory(transactions)).toEqual({ 'cat-a': 150 })
  })

  it('sorts most recent first without mutating the input', () => {
    const sorted = sortByDateDesc(transactions)
    expect(sorted.map(transaction => transaction.id)).toEqual([
      't2',
      't3',
      't1',
    ])
    expect(transactions[0]?.id).toBe('t1')
  })
})
