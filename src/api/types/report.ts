export interface CategoryExpenseShare {
  categoryId: string
  amount: number
  /** Share of total expenses for the period, 0-100. */
  percentage: number
}

export interface MonthlyReport {
  /** Period the report covers, formatted 'YYYY-MM'. */
  month: string
  totalIncome: number
  totalExpense: number
  totalSaving: number
  topExpenseCategoryId: string | null
  mostFrequentCategoryId: string | null
  plannedSaving: number
  actualSaving: number
  expenseDistribution: CategoryExpenseShare[]
}
