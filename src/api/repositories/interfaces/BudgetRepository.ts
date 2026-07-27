import type {
  Budget,
  CreateBudgetInput,
  UpdateBudgetInput,
} from '../../types/budget'

export interface ListBudgetsParams {
  /** Filter by period, formatted 'YYYY-MM'. */
  month?: string
}

export interface BudgetRepository {
  list(params?: ListBudgetsParams): Promise<Budget[]>
  getById(id: string): Promise<Budget | null>
  create(input: CreateBudgetInput): Promise<Budget>
  update(id: string, input: UpdateBudgetInput): Promise<Budget>
  remove(id: string): Promise<void>
}
