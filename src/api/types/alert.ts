/** Mirrors the backend's `AlertType` enum — see `my-cachifa-backend/prisma/schema.prisma`. */
export type AlertType =
  | 'BUDGET_70'
  | 'BUDGET_90'
  | 'BUDGET_100'
  | 'LARGE_EXPENSE'
  | 'SAVING_REMINDER'
  | 'WEEKLY_SUMMARY'
  | 'MONTHLY_REPORT'
  | 'GOAL_PROGRESS'
  | 'RECURRING_EXPENSE_DUE'
  | 'SAVINGS_TARGET_AT_RISK'

export interface Alert {
  id: string
  type: AlertType
  message: string
  isRead: boolean
  createdAt: string
}
