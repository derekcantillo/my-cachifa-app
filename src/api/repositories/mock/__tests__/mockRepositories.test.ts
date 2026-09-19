import { CATEGORY_CATALOG } from '@/api/mappers/categoryMapper'
import { getCurrentMonthKey, shiftMonthKey } from '@/utils'
import { mockBudgetRepository } from '../MockBudgetRepository'
import { mockFinancialPeriodRepository } from '../MockFinancialPeriodRepository'
import { mockGoalRepository } from '../MockGoalRepository'
import { mockReportRepository } from '../MockReportRepository'
import { mockTransactionRepository } from '../MockTransactionRepository'
import {
  CURRENT_PERIOD_ID,
  seedAccounts,
  seedBudgets,
  seedTransactions,
} from '../seed-data'

describe('seed data', () => {
  it('covers the requested expense categories', () => {
    const names = CATEGORY_CATALOG.map(category => category.name)
    expect(names).toEqual(
      expect.arrayContaining([
        'Alimentación',
        'Transporte',
        'Ocio y entretenimiento',
        'Servicios',
        'Deuda',
        'Vivienda',
      ]),
    )
  })

  it('has one category per backend enum value, "Ocio" and "Entretenimiento" included', () => {
    const ids = CATEGORY_CATALOG.map(category => category.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toContain('ENTERTAINMENT')
    expect(catalogNamesMatching(/ocio|entreten/i)).toHaveLength(1)
  })

  it('seeds only categories the backend knows', () => {
    const ids = new Set(CATEGORY_CATALOG.map(category => category.id))
    seedTransactions.forEach(transaction => {
      expect(ids.has(transaction.categoryId)).toBe(true)
    })
    seedBudgets.forEach(budget => {
      expect(ids.has(budget.categoryId)).toBe(true)
    })
  })

  it('keeps at most one budget per category and period', () => {
    const keys = seedBudgets.map(
      budget => `${budget.periodId}:${budget.categoryId}`,
    )
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('defines at least one account', () => {
    expect(seedAccounts.length).toBeGreaterThan(0)
  })
})

/** Catalog names matching a pattern, for the uniqueness checks above. */
function catalogNamesMatching(pattern: RegExp): string[] {
  return CATEGORY_CATALOG.map(category => category.name).filter(name =>
    pattern.test(name),
  )
}

describe('mockTransactionRepository', () => {
  it('lists seed transactions sorted by most recent date', async () => {
    const transactions = await mockTransactionRepository.list()
    expect(transactions.length).toBeGreaterThan(0)
    for (let i = 1; i < transactions.length; i += 1) {
      expect(transactions[i - 1]!.date >= transactions[i]!.date).toBe(true)
    }
  })

  it('filters by kind', async () => {
    const incomeOnly = await mockTransactionRepository.list({ kind: 'income' })
    expect(incomeOnly.every(transaction => transaction.kind === 'income')).toBe(
      true,
    )
  })

  it('persists a created transaction across subsequent queries', async () => {
    const before = await mockTransactionRepository.list()

    const created = await mockTransactionRepository.create({
      kind: 'expense',
      amount: 42,
      categoryId: 'ENTERTAINMENT',
      accountId: 'acc-cash',
      date: new Date().toISOString(),
      description: 'Test expense',
    })

    const after = await mockTransactionRepository.list()
    expect(after.length).toBe(before.length + 1)
    expect(
      after.find(transaction => transaction.id === created.id),
    ).toBeDefined()

    const fetched = await mockTransactionRepository.getById(created.id)
    expect(fetched?.description).toBe('Test expense')

    await mockTransactionRepository.remove(created.id)
    const afterRemoval = await mockTransactionRepository.list()
    expect(
      afterRemoval.find(transaction => transaction.id === created.id),
    ).toBeUndefined()
  })

  it('updates an existing transaction in place', async () => {
    const [first] = await mockTransactionRepository.list()
    if (!first) throw new Error('expected at least one seed transaction')

    const updated = await mockTransactionRepository.update(first.id, {
      amount: 999,
    })
    expect(updated.amount).toBe(999)

    const refetched = await mockTransactionRepository.getById(first.id)
    expect(refetched?.amount).toBe(999)
  })
})

describe('mockBudgetRepository', () => {
  it('lists budgets for every period by default', async () => {
    const budgets = await mockBudgetRepository.list()
    expect(budgets.length).toBeGreaterThan(0)
  })

  it('creates and removes a budget', async () => {
    const created = await mockBudgetRepository.create({
      categoryId: 'ENTERTAINMENT',
      monthlyLimit: 10,
      periodId: 'per-future',
    })
    expect(await mockBudgetRepository.getById(created.id)).not.toBeNull()

    await mockBudgetRepository.remove(created.id)
    expect(await mockBudgetRepository.getById(created.id)).toBeNull()
  })
})

describe('mockGoalRepository', () => {
  it('includes the reference goals with realistic amounts', async () => {
    const goals = await mockGoalRepository.list()
    const names = goals.map(goal => goal.name)
    expect(names).toEqual(
      expect.arrayContaining([
        'Fondo de emergencia',
        'Cuota inicial carro Suzuki Fronx',
        'Viaje',
      ]),
    )
    expect(goals.every(goal => goal.targetAmount > 0)).toBe(true)
  })

  it('accumulates contributions into currentAmount', async () => {
    const [goal] = await mockGoalRepository.list()
    if (!goal) throw new Error('expected at least one seed goal')

    const before = goal.currentAmount
    const updated = await mockGoalRepository.addContribution({
      goalId: goal.id,
      amount: 50,
    })

    expect(updated.currentAmount).toBe(before + 50)
    expect(updated.contributions.length).toBe(goal.contributions.length + 1)
  })

  it('projects accumulated savings month by month, starting today', async () => {
    const months = 12
    const projection = await mockGoalRepository.getSavingsProjection(months)
    const goals = await mockGoalRepository.list()

    expect(projection.points).toHaveLength(months)
    expect(projection.monthlyContribution).toBeGreaterThan(0)
    expect(projection.targetAmount).toBeGreaterThan(0)

    const [first] = projection.points
    if (!first) throw new Error('expected at least one projected point')

    expect(first.month).toBe(getCurrentMonthKey())
    expect(first.amount).toBe(
      goals.reduce((total, goal) => total + goal.currentAmount, 0),
    )

    // Periods run forward without gaps.
    projection.points.forEach((point, index) => {
      expect(point.month).toBe(shiftMonthKey(first.month, index))
    })
  })

  it('marks the extraordinary movements that bend the projection', async () => {
    const projection = await mockGoalRepository.getSavingsProjection()
    const events = projection.points.flatMap(point =>
      point.event ? [point.event] : [],
    )

    expect(events.length).toBeGreaterThan(0)
    expect(events.map(event => event.label)).toEqual(
      expect.arrayContaining(['Venta del carro', 'Compra del vehículo']),
    )
    // Outflows carry a negative amount so the curve dips at that period.
    expect(
      events.every(event =>
        event.kind === 'outflow' ? event.amount < 0 : event.amount > 0,
      ),
    ).toBe(true)
  })
})

describe('mockReportRepository', () => {
  it('aggregates income, expense and saving totals for the current period', async () => {
    const report = await mockReportRepository.getMonthlyReport(
      CURRENT_PERIOD_ID,
    )

    expect(report.periodId).toBe(CURRENT_PERIOD_ID)
    expect(report.totalIncome).toBeGreaterThan(0)
    expect(report.totalExpense).toBeGreaterThan(0)
    expect(report.topExpenseCategoryId).not.toBeNull()
    expect(report.expenseDistribution.length).toBeGreaterThan(0)

    const distributionTotal = report.expenseDistribution.reduce(
      (sum, entry) => sum + entry.amount,
      0,
    )
    expect(distributionTotal).toBeCloseTo(report.totalExpense, 5)
  })

  it('returns an empty-but-valid report for a period with no data', async () => {
    const report = await mockReportRepository.getMonthlyReport('per-unknown')
    expect(report.totalIncome).toBe(0)
    expect(report.totalExpense).toBe(0)
    expect(report.topExpenseCategoryId).toBeNull()
    expect(report.expenseDistribution).toEqual([])
  })
})

describe('mockFinancialPeriodRepository', () => {
  it('lists the periods most recent first, with exactly one open', async () => {
    const periods = await mockFinancialPeriodRepository.getAll()

    expect(periods.length).toBeGreaterThanOrEqual(2)
    expect(periods.filter(period => period.endDate === null)).toHaveLength(1)
    expect(periods[0]?.endDate).toBeNull()
    periods.slice(1).forEach((period, index) => {
      // Each closed period ends exactly where the next one starts.
      expect(period.endDate).toBe(periods[index]?.startDate)
    })
  })

  it('returns the open period as the current one', async () => {
    const current = await mockFinancialPeriodRepository.getCurrent()

    expect(current.id).toBe(CURRENT_PERIOD_ID)
    expect(current.endDate).toBeNull()
    expect(current.label).toMatch(/– en curso$/)
  })
})
