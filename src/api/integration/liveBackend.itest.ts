/**
 * Drives the HTTP repositories against a *running* my-cachifa-backend, so the
 * data path behind every screen is exercised end to end without booting a
 * simulator. Left out of `pnpm test` on purpose — run it with `pnpm test:api`
 * while the backend is up (`pnpm start:dev` in my-cachifa-backend).
 *
 * It creates a transaction and a throwaway goal and deletes both before it
 * finishes, so the dev database is left as it was found.
 */
/* eslint-disable no-console -- printing what the API returned is the point. */
import { getCurrentMonthKey } from '@/utils'
import { httpAccountRepository } from '../repositories/http/HttpAccountRepository'
import { httpBudgetRepository } from '../repositories/http/HttpBudgetRepository'
import { httpCategoryRepository } from '../repositories/http/HttpCategoryRepository'
import { httpFinancialPeriodRepository } from '../repositories/http/HttpFinancialPeriodRepository'
import { httpGoalRepository } from '../repositories/http/HttpGoalRepository'
import { httpReportRepository } from '../repositories/http/HttpReportRepository'
import { httpTransactionRepository } from '../repositories/http/HttpTransactionRepository'

jest.setTimeout(30_000)

const month = getCurrentMonthKey()

function isNumber(value: unknown): boolean {
  return typeof value === 'number' && Number.isFinite(value)
}

it('drives every screen path against the running backend', async () => {
  const period = await httpFinancialPeriodRepository.getCurrent()
  console.log('período actual:', period)
  expect(period.endDate).toBeNull()
  const periodId = period.id

  const accounts = await httpAccountRepository.list()
  const categories = await httpCategoryRepository.list()
  console.log('accounts:', accounts)
  console.log(
    'categorías:',
    categories.map(c => `${c.id}=${c.name}`).join(', '),
  )

  // --- Gastos / Inicio -------------------------------------------------
  const created = await httpTransactionRepository.create({
    kind: 'expense',
    amount: 45.5,
    categoryId: 'FOOD',
    accountId: accounts[0]?.id ?? '',
    date: new Date().toISOString(),
    description: 'Prueba de integración',
    tags: [],
  })
  console.log('transacción creada:', created)
  expect(isNumber(created.amount)).toBe(true)
  expect(created.categoryId).toBe('FOOD')

  const list = await httpTransactionRepository.list({ periodId })
  expect(list.some(t => t.id === created.id)).toBe(true)
  expect(list.every(t => isNumber(t.amount))).toBe(true)

  const filtered = await httpTransactionRepository.list({
    periodId,
    kind: 'expense',
    categoryId: 'FOOD',
  })
  expect(filtered.some(t => t.id === created.id)).toBe(true)

  const fetched = await httpTransactionRepository.getById(created.id)
  expect(fetched?.id).toBe(created.id)
  await httpTransactionRepository.update(created.id, { amount: 60 })

  const budgets = await httpBudgetRepository.list({ periodId })
  console.log('presupuestos:', budgets)
  expect(
    budgets.every(b => isNumber(b.monthlyLimit) && b.monthlyLimit > 0),
  ).toBe(true)

  // --- Reportes --------------------------------------------------------
  const report = await httpReportRepository.getMonthlyReport(periodId)
  console.log('reporte:', report)
  expect(
    [
      report.totalIncome,
      report.totalExpense,
      report.totalSaving,
      report.plannedSaving,
      report.actualSaving,
    ].every(isNumber),
  ).toBe(true)
  expect(report.expenseDistribution.every(s => isNumber(s.amount))).toBe(true)
  expect(report.totalExpense).toBeGreaterThan(0)

  // --- Metas -----------------------------------------------------------
  const goals = await httpGoalRepository.list()
  console.log(
    'metas:',
    goals.map(
      g =>
        `${g.name} ${g.currentAmount}/${g.targetAmount} ${g.phase} ${g.status}`,
    ),
  )
  expect(goals.every(g => isNumber(g.currentAmount))).toBe(true)
  expect(
    goals.every(g =>
      g.contributions.every(c => isNumber(c.amount) && !!c.date),
    ),
  ).toBe(true)

  const tmpGoal = await httpGoalRepository.create({
    name: 'ZZ prueba integración',
    targetAmount: 1000,
    phase: 'short_term',
  })
  const withContribution = await httpGoalRepository.addContribution({
    goalId: tmpGoal.id,
    amount: 250,
    note: 'Aporte de prueba',
  })
  console.log('aporte:', withContribution.contributions)
  expect(withContribution.currentAmount).toBe(250)

  const projection = await httpGoalRepository.getSavingsProjection(12)
  console.log('proyección:', {
    monthlyContribution: projection.monthlyContribution,
    targetAmount: projection.targetAmount,
    firstPoints: projection.points.slice(0, 3),
    events: projection.points.flatMap(p => (p.event ? [p.event] : [])),
  })
  expect(projection.points).toHaveLength(12)
  expect(projection.points.every(p => isNumber(p.amount))).toBe(true)
  expect(projection.points[0]?.month).toBe(month)

  // --- Limpieza --------------------------------------------------------
  await httpGoalRepository.remove(tmpGoal.id)
  await httpTransactionRepository.remove(created.id)
  expect(await httpTransactionRepository.getById(created.id)).toBeNull()
})

/**
 * What the screens get when stepping back to the oldest period — likely a thin
 * one, the state the mocks never produced because their seed always had
 * something to show. An unknown `periodId` is a 404, so there is no way to ask
 * for a guaranteed-empty period any more.
 */
it('returns clean, finite figures for the oldest period', async () => {
  const periods = await httpFinancialPeriodRepository.getAll()
  console.log(
    'períodos:',
    periods.map(p => p.label),
  )
  expect(periods.filter(p => p.endDate === null)).toHaveLength(1)

  const oldest = periods[periods.length - 1]
  if (!oldest) {
    throw new Error('The backend returned no financial periods')
  }

  const [transactions, budgets, report] = await Promise.all([
    httpTransactionRepository.list({ periodId: oldest.id }),
    httpBudgetRepository.list({ periodId: oldest.id }),
    httpReportRepository.getMonthlyReport(oldest.id),
  ])
  console.log('reporte del período más antiguo:', report)

  expect(transactions.every(t => isNumber(t.amount))).toBe(true)
  expect(budgets.every(b => isNumber(b.monthlyLimit))).toBe(true)

  // Not broken: the screens branch on these, and a NaN would reach the charts
  // and the percentages.
  expect(report.expenseDistribution.every(s => isNumber(s.amount))).toBe(true)
  expect(
    [
      report.totalIncome,
      report.totalExpense,
      report.totalSaving,
      report.plannedSaving,
      report.actualSaving,
    ].every(isNumber),
  ).toBe(true)
})
