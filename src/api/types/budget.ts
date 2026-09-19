export interface Budget {
  id: string
  categoryId: string
  monthlyLimit: number
  /** `FinancialPeriod.id` this limit applies to. */
  periodId: string
}

export interface CreateBudgetInput {
  categoryId: string
  monthlyLimit: number
  periodId: string
}

export type UpdateBudgetInput = Partial<CreateBudgetInput>
