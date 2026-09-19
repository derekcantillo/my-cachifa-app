import type {
  Budget,
  CreateBudgetInput,
  UpdateBudgetInput,
} from '../../types/budget'

export interface ListBudgetsParams {
  /** `FinancialPeriod.id`; the backend defaults to the open period. */
  periodId?: string
}

export interface BudgetRepository {
  list(params?: ListBudgetsParams): Promise<Budget[]>
  getById(id: string): Promise<Budget | null>
  create(input: CreateBudgetInput): Promise<Budget>
  update(id: string, input: UpdateBudgetInput): Promise<Budget>
  remove(id: string): Promise<void>
}
