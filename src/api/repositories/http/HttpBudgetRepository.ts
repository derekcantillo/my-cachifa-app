import { httpClient } from '../../httpClient'
import { toAmount } from '../../mappers/decimalMapper'
import {
  toBackendCategory,
  toCategoryId,
  type BackendCategory,
} from '../../mappers/categoryMapper'
import type {
  Budget,
  CreateBudgetInput,
  UpdateBudgetInput,
} from '../../types/budget'
import type {
  BudgetRepository,
  ListBudgetsParams,
} from '../interfaces/BudgetRepository'

const BASE_PATH = '/budgets'

interface BudgetDto {
  id: string
  periodId: string
  category: BackendCategory
  limitAmount: number | string
  spentAmount: number | string
  percentage: number | string
  createdAt: string
  updatedAt: string
}

interface BudgetItem {
  category: BackendCategory
  limitAmount: number
}

/**
 * A budget is keyed by period + category in the backend (a unique constraint),
 * and the only write endpoint is an upsert of a period's limits — there is no
 * `PATCH /budgets/:id`. So the id the app carries around is that pair rather
 * than the row's cuid: it is the only handle that lets `update` and `remove`
 * address a limit in a single request.
 */
const ID_SEPARATOR = ':'

function toBudgetId(periodId: string, category: BackendCategory): string {
  return `${periodId}${ID_SEPARATOR}${category}`
}

function parseBudgetId(id: string): {
  periodId: string
  category: BackendCategory
} {
  const [periodId = '', category = ''] = id.split(ID_SEPARATOR)
  return { periodId, category: toCategoryId(category) }
}

function toBudget(dto: BudgetDto): Budget {
  const category = toCategoryId(dto.category)

  return {
    id: toBudgetId(dto.periodId, category),
    categoryId: category,
    monthlyLimit: toAmount(dto.limitAmount),
    periodId: dto.periodId,
  }
}

class HttpBudgetRepository implements BudgetRepository {
  /**
   * A limit cleared to zero is how a budget is deleted here (see `remove`), so
   * those rows are dropped: to the app the category simply has no budget.
   */
  async list(params: ListBudgetsParams = {}): Promise<Budget[]> {
    const response = await httpClient.get<BudgetDto[]>(BASE_PATH, {
      params: params.periodId ? { periodId: params.periodId } : {},
    })

    return response.data.map(toBudget).filter(budget => budget.monthlyLimit > 0)
  }

  async getById(id: string): Promise<Budget | null> {
    const { periodId, category } = parseBudgetId(id)
    const budgets = await this.list({ periodId })
    return budgets.find(budget => budget.categoryId === category) ?? null
  }

  async create(input: CreateBudgetInput): Promise<Budget> {
    return this.upsert(
      input.periodId,
      toBackendCategory(input.categoryId),
      input.monthlyLimit,
    )
  }

  async update(id: string, input: UpdateBudgetInput): Promise<Budget> {
    const current = parseBudgetId(id)
    const periodId = input.periodId ?? current.periodId
    const category = input.categoryId
      ? toBackendCategory(input.categoryId)
      : current.category

    if (input.monthlyLimit === undefined) {
      const existing = await this.getById(toBudgetId(periodId, category))
      if (!existing) {
        throw new Error(`Budget ${id} not found`)
      }
      return existing
    }

    return this.upsert(periodId, category, input.monthlyLimit)
  }

  /**
   * The API has no delete: a limit of zero is what "no budget for this
   * category" looks like, and `list` filters those out.
   */
  async remove(id: string): Promise<void> {
    const { periodId, category } = parseBudgetId(id)
    await this.upsert(periodId, category, 0)
  }

  /**
   * `PUT /budgets?periodId` upserts only the categories it is given and
   * leaves the rest of the period untouched, so one item per call is safe.
   */
  private async upsert(
    periodId: string,
    category: BackendCategory,
    limitAmount: number,
  ): Promise<Budget> {
    const items: BudgetItem[] = [{ category, limitAmount }]

    const response = await httpClient.put<BudgetDto[]>(
      BASE_PATH,
      { items },
      { params: { periodId } },
    )

    const saved = response.data
      .map(toBudget)
      .find(budget => budget.categoryId === category)

    // The response is the whole period, so the row just written is in it; this
    // only guards against a shape change on the API side.
    return (
      saved ?? {
        id: toBudgetId(periodId, category),
        categoryId: category,
        monthlyLimit: limitAmount,
        periodId,
      }
    )
  }
}

export const httpBudgetRepository: BudgetRepository = new HttpBudgetRepository()
