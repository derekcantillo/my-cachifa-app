import {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from 'axios'
import { ApiError } from '../apiError'
import { httpClient, setApiKeyCache } from '../httpClient'
import {
  CATEGORY_CATALOG,
  getCategoryLabel,
  toBackendCategory,
  toCategoryId,
} from '../mappers/categoryMapper'
import { toAmount, toOptionalAmount } from '../mappers/decimalMapper'
import { httpBudgetRepository } from '../repositories/http/HttpBudgetRepository'
import { httpGoalRepository } from '../repositories/http/HttpGoalRepository'
import { httpReportRepository } from '../repositories/http/HttpReportRepository'
import { httpTransactionRepository } from '../repositories/http/HttpTransactionRepository'
import { getCurrentMonthKey } from '@/utils'

interface RecordedRequest {
  method: string
  url: string
  params: Record<string, unknown>
  body: unknown
}

type Reply = { status?: number; data?: unknown }
type Handler = (request: RecordedRequest) => Reply

const requests: RecordedRequest[] = []
let routes: Record<string, Handler> = {}
/** Set to fail every request the way axios does when it never gets a response. */
let transportFailure: { code: string } | null = null

function record(config: InternalAxiosRequestConfig): RecordedRequest {
  return {
    method: (config.method ?? 'get').toUpperCase(),
    url: config.url ?? '',
    params: (config.params as Record<string, unknown>) ?? {},
    body:
      typeof config.data === 'string' ? JSON.parse(config.data) : config.data,
  }
}

/**
 * Requests are served from `routes` instead of the network, but they still go
 * through the client's interceptors — which is the point: the error mapping is
 * part of what these tests cover.
 */
httpClient.defaults.adapter = async config => {
  const request = record(config)
  requests.push(request)

  if (transportFailure) {
    throw new AxiosError(
      'transport',
      transportFailure.code,
      config,
      {},
      undefined,
    )
  }

  const handler = routes[`${request.method} ${request.url}`]
  if (!handler) {
    throw new Error(`No route registered for ${request.method} ${request.url}`)
  }

  const { status = 200, data = null } = handler(request)
  const response = {
    data,
    status,
    statusText: '',
    headers: new AxiosHeaders(),
    config,
  }

  if (status >= 400) {
    throw new AxiosError('failed', String(status), config, {}, response)
  }

  return response
}

function route(key: string, reply: Reply | Handler): void {
  routes[key] = typeof reply === 'function' ? reply : () => reply
}

beforeEach(() => {
  requests.length = 0
  routes = {}
  transportFailure = null
  // These tests exercise the HTTP layer's error mapping, not Keychain, so
  // a fake key skips the "not configured" path the interceptor short-circuits on.
  setApiKeyCache('test-api-key')
})

describe('categoryMapper', () => {
  it('maps every enum value to a Spanish label and back', () => {
    CATEGORY_CATALOG.forEach(category => {
      expect(category.name).not.toBe(category.id)
      expect(getCategoryLabel(category.id)).toBe(category.name)
      expect(toBackendCategory(category.id)).toBe(category.id)
    })
  })

  it('folds "Ocio" and "Entretenimiento" into a single concept', () => {
    expect(toBackendCategory('cat-ocio')).toBe('ENTERTAINMENT')
    expect(toBackendCategory('cat-entretenimiento')).toBe('ENTERTAINMENT')
    expect(
      CATEGORY_CATALOG.filter(category => /ocio|entreten/i.test(category.name)),
    ).toHaveLength(1)
  })

  it('folds "Mercado" into "Alimentación"', () => {
    expect(toBackendCategory('cat-mercado')).toBe('FOOD')
    expect(toBackendCategory('cat-alimentacion')).toBe('FOOD')
  })

  it('sends anything it does not know to OTHER instead of failing', () => {
    expect(toBackendCategory('quién-sabe')).toBe('OTHER')
    expect(toCategoryId('NOT_AN_ENUM_VALUE')).toBe('OTHER')
  })
})

describe('decimalMapper', () => {
  it('reads a Prisma Decimal whether it arrives as a string or a number', () => {
    expect(toAmount('1234.56')).toBe(1234.56)
    expect(toAmount(1234.56)).toBe(1234.56)
    expect(toAmount('0')).toBe(0)
  })

  it('never yields NaN', () => {
    expect(toAmount(null)).toBe(0)
    expect(toAmount(undefined)).toBe(0)
    expect(toAmount('')).toBe(0)
    expect(toAmount('no-es-un-monto')).toBe(0)
    expect(toAmount(Number.NaN)).toBe(0)
  })

  it('keeps an absent optional amount absent', () => {
    expect(toOptionalAmount(null)).toBeUndefined()
    expect(toOptionalAmount('12.5')).toBe(12.5)
  })
})

describe('network error handling', () => {
  it('turns an unreachable backend into a readable offline error', async () => {
    transportFailure = { code: 'ERR_NETWORK' }

    const error = await httpTransactionRepository.list().catch(caught => caught)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).kind).toBe('offline')
    expect((error as ApiError).message).toMatch(/conexión/i)
  })

  it('tells a timeout apart from being offline', async () => {
    transportFailure = { code: 'ECONNABORTED' }

    const error = await httpTransactionRepository.list().catch(caught => caught)

    expect((error as ApiError).kind).toBe('timeout')
    expect((error as ApiError).message).toMatch(/tardó demasiado/i)
  })

  it('surfaces what the API says is wrong with a rejected payload', async () => {
    route('POST /transactions', {
      status: 400,
      data: { message: ['amount must be a positive number'] },
    })

    const error = await httpTransactionRepository
      .create({
        kind: 'expense',
        amount: -1,
        categoryId: 'FOOD',
        accountId: 'acc-1',
        date: '2026-07-01T00:00:00.000Z',
        description: 'Prueba',
      })
      .catch(caught => caught)

    expect((error as ApiError).kind).toBe('validation')
    expect((error as ApiError).message).toBe('amount must be a positive number')
    expect((error as ApiError).status).toBe(400)
  })

  it('hides a server stack trace behind a message the user can act on', async () => {
    route('GET /goals', { status: 500, data: { message: 'Prisma exploded' } })

    const error = await httpGoalRepository.list().catch(caught => caught)

    expect((error as ApiError).kind).toBe('server')
    expect((error as ApiError).message).not.toMatch(/Prisma/)
  })

  it('resolves a missing resource to null rather than throwing', async () => {
    route('GET /transactions/gone', { status: 404, data: {} })
    route('GET /goals/gone', { status: 404, data: {} })

    expect(await httpTransactionRepository.getById('gone')).toBeNull()
    expect(await httpGoalRepository.getById('gone')).toBeNull()
  })
})

describe('HttpTransactionRepository', () => {
  const dto = {
    id: 'txn-1',
    // The amount arrives as a string when a Decimal is serialised untouched.
    amount: '45.50',
    type: 'EXPENSE',
    category: 'FOOD',
    description: null,
    tags: ['recurrente'],
    accountId: 'acc-1',
    transactionDate: '2026-07-20T10:00:00.000Z',
    monthYear: '2026-07',
    createdAt: '2026-07-20T10:00:00.000Z',
    updatedAt: '2026-07-20T10:00:00.000Z',
  }

  it('maps the API shape onto the domain one, amounts included', async () => {
    route('GET /transactions', { data: [dto] })

    const [transaction] = await httpTransactionRepository.list({
      month: '2026-07',
    })

    expect(transaction).toEqual({
      id: 'txn-1',
      kind: 'expense',
      amount: 45.5,
      categoryId: 'FOOD',
      accountId: 'acc-1',
      date: '2026-07-20T10:00:00.000Z',
      description: '',
      tags: ['recurrente'],
      createdAt: '2026-07-20T10:00:00.000Z',
      updatedAt: '2026-07-20T10:00:00.000Z',
    })
    expect(requests[0]?.params).toEqual({ month: '2026-07' })
  })

  it('reads a debt payment as money out', async () => {
    route('GET /transactions', {
      data: [{ ...dto, type: 'DEBT_PAYMENT', category: 'DEBT' }],
    })

    const [transaction] = await httpTransactionRepository.list()
    expect(transaction?.kind).toBe('expense')
  })

  it('applies the filters the API does not support itself', async () => {
    route('GET /transactions', {
      data: [
        dto,
        { ...dto, id: 'txn-2', type: 'INCOME', category: 'OTHER' },
        { ...dto, id: 'txn-3', category: 'TRANSPORT' },
      ],
    })

    const expenses = await httpTransactionRepository.list({
      month: '2026-07',
      kind: 'expense',
      categoryId: 'FOOD',
    })

    expect(expenses.map(transaction => transaction.id)).toEqual(['txn-1'])
  })

  it('writes the enum values the API expects', async () => {
    route('POST /transactions', { data: dto })

    await httpTransactionRepository.create({
      kind: 'saving',
      amount: 200,
      categoryId: 'SAVING',
      accountId: 'acc-2',
      date: '2026-07-25T00:00:00.000Z',
      description: 'Aporte',
      tags: [],
    })

    expect(requests[0]?.body).toEqual({
      amount: 200,
      type: 'SAVING',
      category: 'SAVING',
      description: 'Aporte',
      accountId: 'acc-2',
      tags: [],
      transactionDate: '2026-07-25T00:00:00.000Z',
    })
  })

  it('sends only the fields an edit actually touched', async () => {
    route('PATCH /transactions/txn-1', { data: dto })

    await httpTransactionRepository.update('txn-1', { amount: 60 })

    expect(requests[0]?.body).toEqual({ amount: 60 })
  })
})

describe('HttpBudgetRepository', () => {
  const budgetDto = {
    id: 'bud-1',
    monthYear: '2026-07',
    category: 'FOOD',
    limitAmount: '450.00',
    spentAmount: '120.00',
    percentage: '26.7',
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-01T00:00:00.000Z',
  }

  it('keys a budget by month and category, the pair the API is unique on', async () => {
    route('GET /budgets', { data: [budgetDto] })

    const [budget] = await httpBudgetRepository.list({ month: '2026-07' })

    expect(budget).toEqual({
      id: '2026-07:FOOD',
      categoryId: 'FOOD',
      monthlyLimit: 450,
      month: '2026-07',
    })
  })

  it('hides a limit of zero, which is what a deleted budget looks like', async () => {
    route('GET /budgets', {
      data: [budgetDto, { ...budgetDto, category: 'DEBT', limitAmount: 0 }],
    })

    const budgets = await httpBudgetRepository.list({ month: '2026-07' })
    expect(budgets.map(budget => budget.categoryId)).toEqual(['FOOD'])
  })

  it('saves one category at a time through the month upsert', async () => {
    route('PUT /budgets', { data: [{ ...budgetDto, limitAmount: '500.00' }] })

    const saved = await httpBudgetRepository.create({
      categoryId: 'FOOD',
      monthlyLimit: 500,
      month: '2026-07',
    })

    expect(requests[0]?.params).toEqual({ month: '2026-07' })
    expect(requests[0]?.body).toEqual({
      items: [{ category: 'FOOD', limitAmount: 500 }],
    })
    expect(saved.monthlyLimit).toBe(500)
  })

  it('clears a limit to zero instead of deleting, which the API cannot do', async () => {
    route('PUT /budgets', { data: [{ ...budgetDto, limitAmount: 0 }] })

    await httpBudgetRepository.remove('2026-07:FOOD')

    expect(requests[0]?.method).toBe('PUT')
    expect(requests[0]?.body).toEqual({
      items: [{ category: 'FOOD', limitAmount: 0 }],
    })
  })
})

describe('HttpGoalRepository', () => {
  const goalDto = {
    id: 'goal-1',
    name: 'Fondo de emergencia',
    targetAmount: '3000.00',
    currentAmount: '1450.00',
    percentage: '48.3',
    targetDate: '2026-12-31T00:00:00.000Z',
    phase: 'PHASE_1_DEBT_CONTROL',
    status: 'ACTIVE',
    contributions: [
      {
        id: 'contrib-1',
        amount: '250.00',
        note: 'Aporte mensual',
        contributedAt: '2026-06-20T00:00:00.000Z',
        createdAt: '2026-06-20T00:00:00.000Z',
      },
      {
        id: 'contrib-2',
        amount: '200.00',
        note: null,
        contributedAt: '2026-07-20T00:00:00.000Z',
        createdAt: '2026-07-20T00:00:00.000Z',
      },
    ],
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-07-20T00:00:00.000Z',
  }

  it('maps phases, amounts and the contribution history', async () => {
    route('GET /goals', { data: [goalDto] })

    const [goal] = await httpGoalRepository.list()

    expect(goal?.phase).toBe('urgent')
    expect(goal?.status).toBe('active')
    expect(goal?.targetAmount).toBe(3000)
    expect(goal?.currentAmount).toBe(1450)
    expect(goal?.contributions).toEqual([
      {
        id: 'contrib-1',
        amount: 250,
        date: '2026-06-20T00:00:00.000Z',
        note: 'Aporte mensual',
      },
      { id: 'contrib-2', amount: 200, date: '2026-07-20T00:00:00.000Z' },
    ])
  })

  it('posts a contribution as the API wants it', async () => {
    route('POST /goals/goal-1/contributions', { data: goalDto })

    const updated = await httpGoalRepository.addContribution({
      goalId: 'goal-1',
      amount: 200,
      note: 'Aporte mensual',
    })

    expect(requests[0]?.body).toEqual({ amount: 200, note: 'Aporte mensual' })
    expect(updated.currentAmount).toBe(1450)
  })

  it('gives a goal created without a date the one the API requires', async () => {
    route('POST /goals', { data: goalDto })

    await httpGoalRepository.create({
      name: 'Viaje',
      targetAmount: 1200,
      phase: 'short_term',
    })

    const body = requests[0]?.body as { targetDate?: string; phase?: string }
    expect(body.phase).toBe('PHASE_2_OPTIMIZATION')
    expect(Date.parse(body.targetDate ?? '')).toBeGreaterThan(Date.now())
  })

  it('projects month by month from the savings history and the goals ahead', async () => {
    route('GET /reports/savings-projection', {
      data: {
        points: [
          { date: '2026-05-20T00:00:00.000Z', cumulativeAmount: '250.00' },
          { date: '2026-07-20T00:00:00.000Z', cumulativeAmount: '450.00' },
        ],
        markers: [{ date: '2026-12-31T00:00:00.000Z', label: 'Fondo' }],
      },
    })
    route('GET /goals', { data: [goalDto] })

    const projection = await httpGoalRepository.getSavingsProjection(12)

    expect(projection.points).toHaveLength(12)
    expect(projection.points[0]?.month).toBe(getCurrentMonthKey())
    expect(projection.points[0]?.amount).toBe(1450)
    expect(projection.targetAmount).toBe(3000)
    // 450 saved across the three months the history spans.
    expect(projection.monthlyContribution).toBe(150)
    expect(
      projection.points.every(point => Number.isFinite(point.amount)),
    ).toBe(true)
  })
})

describe('HttpReportRepository', () => {
  it('composes the month from the summary, the distribution and the income', async () => {
    route('GET /reports/summary', {
      data: {
        biggestExpense: { category: 'HOUSING', amount: '120.00' },
        savingsProgress: {
          actual: '200.00',
          planned: '300.00',
          percentage: '66.7',
        },
        mostFrequentCategory: { category: 'FOOD', count: 3 },
      },
    })
    route('GET /reports/distribution', {
      data: [
        { category: 'HOUSING', amount: '120.00', percentage: '60.0' },
        { category: 'FOOD', amount: '80.00', percentage: '40.0' },
      ],
    })
    route('GET /transactions', {
      data: [
        {
          id: 'txn-income',
          amount: '1800.00',
          type: 'INCOME',
          category: 'OTHER',
          description: 'Salario',
          tags: [],
          accountId: 'acc-1',
          transactionDate: '2026-07-05T00:00:00.000Z',
          monthYear: '2026-07',
          createdAt: '2026-07-05T00:00:00.000Z',
          updatedAt: '2026-07-05T00:00:00.000Z',
        },
      ],
    })

    const report = await httpReportRepository.getMonthlyReport('2026-07')

    expect(report).toEqual({
      month: '2026-07',
      totalIncome: 1800,
      totalExpense: 200,
      totalSaving: 200,
      topExpenseCategoryId: 'HOUSING',
      mostFrequentCategoryId: 'FOOD',
      plannedSaving: 300,
      actualSaving: 200,
      expenseDistribution: [
        { categoryId: 'HOUSING', amount: 120, percentage: 60 },
        { categoryId: 'FOOD', amount: 80, percentage: 40 },
      ],
    })
  })

  it('stays at zero for a month with nothing in it', async () => {
    route('GET /reports/summary', {
      data: {
        biggestExpense: null,
        savingsProgress: { actual: 0, planned: 0, percentage: 0 },
        mostFrequentCategory: null,
      },
    })
    route('GET /reports/distribution', { data: [] })
    route('GET /transactions', { data: [] })

    const report = await httpReportRepository.getMonthlyReport('1999-01')

    expect(report.totalExpense).toBe(0)
    expect(report.totalIncome).toBe(0)
    expect(report.topExpenseCategoryId).toBeNull()
    expect(Number.isNaN(report.plannedSaving)).toBe(false)
  })
})
