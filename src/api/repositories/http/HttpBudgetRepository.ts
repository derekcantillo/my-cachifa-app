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
  monthYear: string
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
 * A budget is keyed by month + category in the backend (a unique constraint),
 * and the only write endpoint is an upsert of a month's limits — there is no
 * `PATCH /budgets/:id`. So the id the app carries around is that pair rather
 * than the row's cuid: it is the only handle that lets `update` and `remove`
 * address a limit in a single request.
 */
const ID_SEPARATOR = ':'

function toBudgetId(month: string, category: BackendCategory): string {
  return `${month}${ID_SEPARATOR}${category}`
}

function parseBudgetId(id: string): {
  month: string
  category: BackendCategory
} {
  const [month = '', category = ''] = id.split(ID_SEPARATOR)
  return { month, category: toCategoryId(category) }
}

function toBudget(dto: BudgetDto): Budget {
  const category = toCategoryId(dto.category)

  return {
    id: toBudgetId(dto.monthYear, category),
    categoryId: category,
    monthlyLimit: toAmount(dto.limitAmount),
    month: dto.monthYear,
  }
}

class HttpBudgetRepository implements BudgetRepository {
  /**
   * A limit cleared to zero is how a budget is deleted here (see `remove`), so
   * those rows are dropped: to the app the category simply has no budget.
   */
  async list(params: ListBudgetsParams = {}): Promise<Budget[]> {
    const response = await httpClient.get<BudgetDto[]>(BASE_PATH, {
      params: params.month ? { month: params.month } : {},
    })

    return response.data.map(toBudget).filter(budget => budget.monthlyLimit > 0)
  }

  async getById(id: string): Promise<Budget | null> {
    const { month, category } = parseBudgetId(id)
    const budgets = await this.list({ month })
    return budgets.find(budget => budget.categoryId === category) ?? null
  }

  async create(input: CreateBudgetInput): Promise<Budget> {
    return this.upsert(
      input.month,
      toBackendCategory(input.categoryId),
      input.monthlyLimit,
    )
  }

  async update(id: string, input: UpdateBudgetInput): Promise<Budget> {
    const current = parseBudgetId(id)
    const month = input.month ?? current.month
    const category = input.categoryId
      ? toBackendCategory(input.categoryId)
      : current.category

    if (input.monthlyLimit === undefined) {
      const existing = await this.getById(toBudgetId(month, category))
      if (!existing) {
        throw new Error(`Budget ${id} not found`)
      }
      return existing
    }

    return this.upsert(month, category, input.monthlyLimit)
  }

  /**
   * The API has no delete: a limit of zero is what "no budget for this
   * category" looks like, and `list` filters those out.
   */
  async remove(id: string): Promise<void> {
    const { month, category } = parseBudgetId(id)
    await this.upsert(month, category, 0)
  }

  /**
   * `PUT /budgets?month` upserts only the categories it is given and leaves
   * the rest of the month untouched, so one item per call is safe.
   */
  private async upsert(
    month: string,
    category: BackendCategory,
    limitAmount: number,
  ): Promise<Budget> {
    const items: BudgetItem[] = [{ category, limitAmount }]

    const response = await httpClient.put<BudgetDto[]>(
      BASE_PATH,
      { items },
      { params: { month } },
    )

    const saved = response.data
      .map(toBudget)
      .find(budget => budget.categoryId === category)

    // The response is the whole month, so the row just written is in it; this
    // only guards against a shape change on the API side.
    return (
      saved ?? {
        id: toBudgetId(month, category),
        categoryId: category,
        monthlyLimit: limitAmount,
        month,
      }
    )
  }
}

export const httpBudgetRepository: BudgetRepository = new HttpBudgetRepository()
