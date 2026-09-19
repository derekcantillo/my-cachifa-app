import type {
  CreateRecurringExpenseInput,
  RecurringExpense,
  UpdateRecurringExpenseInput,
} from '../../types/recurringExpense'

export interface RecurringExpenseRepository {
  getAll(): Promise<RecurringExpense[]>
  /** Active expenses with no `Transaction` of the period linked to them yet. */
  getPending(periodId: string): Promise<RecurringExpense[]>
  create(input: CreateRecurringExpenseInput): Promise<RecurringExpense>
  update(
    id: string,
    input: UpdateRecurringExpenseInput,
  ): Promise<RecurringExpense>
  delete(id: string): Promise<void>
}
