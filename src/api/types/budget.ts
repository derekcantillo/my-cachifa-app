export interface Budget {
  id: string
  categoryId: string
  monthlyLimit: number
  /** Period this limit applies to, formatted 'YYYY-MM'. */
  month: string
}

export interface CreateBudgetInput {
  categoryId: string
  monthlyLimit: number
  month: string
}

export type UpdateBudgetInput = Partial<CreateBudgetInput>
