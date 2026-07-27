import { mockBudgetRepository } from '../MockBudgetRepository'
import { mockGoalRepository } from '../MockGoalRepository'
import { mockReportRepository } from '../MockReportRepository'
import { mockTransactionRepository } from '../MockTransactionRepository'
import { seedAccounts, seedCategories } from '../seed-data'

describe('seed data', () => {
  it('covers the requested expense categories', () => {
    const names = seedCategories.map(category => category.name)
    expect(names).toEqual(
      expect.arrayContaining([
        'Alimentación',
        'Transporte',
        'Ocio',
        'Servicios',
        'Deuda',
        'Vivienda',
        'Mercado',
        'Entretenimiento',
      ]),
    )
  })

  it('defines at least one account', () => {
    expect(seedAccounts.length).toBeGreaterThan(0)
  })
})

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
      categoryId: 'cat-ocio',
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
  it('lists budgets for the current month by default', async () => {
    const budgets = await mockBudgetRepository.list()
    expect(budgets.length).toBeGreaterThan(0)
  })

  it('creates and removes a budget', async () => {
    const created = await mockBudgetRepository.create({
      categoryId: 'cat-ocio',
      monthlyLimit: 10,
      month: '2099-01',
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
})

describe('mockReportRepository', () => {
  it('aggregates income, expense and saving totals for the current month', async () => {
    const month = new Date().toISOString().slice(0, 7)
    const report = await mockReportRepository.getMonthlyReport(month)

    expect(report.month).toBe(month)
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

  it('returns an empty-but-valid report for a month with no data', async () => {
    const report = await mockReportRepository.getMonthlyReport('2000-01')
    expect(report.totalIncome).toBe(0)
    expect(report.totalExpense).toBe(0)
    expect(report.topExpenseCategoryId).toBeNull()
    expect(report.expenseDistribution).toEqual([])
  })
})
