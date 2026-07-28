import { monthlySavingNeeded, monthsUntil } from '../savings'

const NOW = new Date('2026-07-28T12:00:00.000Z')

function inDays(days: number): string {
  return new Date(NOW.getTime() + days * 86_400_000).toISOString()
}

describe('monthsUntil', () => {
  it('rounds up to whole months', () => {
    expect(monthsUntil(inDays(1), NOW)).toBe(1)
    expect(monthsUntil(inDays(31), NOW)).toBe(2)
    expect(monthsUntil(inDays(90), NOW)).toBe(3)
  })

  it('treats past dates as due now', () => {
    expect(monthsUntil(inDays(-10), NOW)).toBe(0)
  })
})

describe('monthlySavingNeeded', () => {
  it('spreads what is missing over the months left', () => {
    // 90 days out is 3 months, so 3000 becomes 1000 a month.
    expect(monthlySavingNeeded(3000, inDays(90), NOW)).toBe(1000)
  })

  it('returns null when the goal has no target date to pace against', () => {
    expect(monthlySavingNeeded(3000, undefined, NOW)).toBeNull()
  })

  it('asks for the whole amount once the date is here or past', () => {
    expect(monthlySavingNeeded(1200, inDays(-5), NOW)).toBe(1200)
  })

  it('needs nothing more once the target is met', () => {
    expect(monthlySavingNeeded(0, inDays(60), NOW)).toBe(0)
    expect(monthlySavingNeeded(-50, inDays(60), NOW)).toBe(0)
  })
})
