import type {
  CreateRecurringExpenseInput,
  RecurringExpense,
  UpdateRecurringExpenseInput,
} from '../../types/recurringExpense'

export interface RecurringExpenseRepository {
  getAll(): Promise<RecurringExpense[]>
  /** Active expenses with no `Transaction` of `month` linked to them yet. */
  getPending(month: string): Promise<RecurringExpense[]>
  create(input: CreateRecurringExpenseInput): Promise<RecurringExpense>
  update(
    id: string,
    input: UpdateRecurringExpenseInput,
  ): Promise<RecurringExpense>
  delete(id: string): Promise<void>
}
