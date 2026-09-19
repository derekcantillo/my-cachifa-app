import type { NavigatorScreenParams } from '@react-navigation/native'

export type DashboardStackParamList = {
  Dashboard: undefined
}

export type ExpensesStackParamList = {
  Expenses: undefined
}

export type GoalsStackParamList = {
  Goals: undefined
}

export type ReportsStackParamList = {
  Reports: undefined
}

export type MainTabParamList = {
  DashboardTab: NavigatorScreenParams<DashboardStackParamList>
  ExpensesTab: NavigatorScreenParams<ExpensesStackParamList>
  GoalsTab: NavigatorScreenParams<GoalsStackParamList>
  ReportsTab: NavigatorScreenParams<ReportsStackParamList>
}

/**
 * Settings and the modals sit outside the tab bar: the design reaches
 * Settings from the avatar in the app header, and every modal can be opened
 * from more than one tab, so they all live at the root.
 */
export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>
  Settings: undefined
  /**
   * Doubles as the edit form when `transactionId` is given. `category`,
   * `amount` and `recurringExpenseId` prefill a new movement — how a
   * pending recurring expense hands off to this form — and are ignored once
   * `transactionId` is set.
   */
  RegisterTransaction:
    | {
        transactionId?: string
        category?: string
        amount?: number
        recurringExpenseId?: string
      }
    | undefined
  TransactionDetail: { transactionId: string }
  /** Doubles as the edit form when `goalId` is given. */
  CreateGoal: { goalId?: string } | undefined
  GoalDetail: { goalId: string }
  /** `FinancialPeriod.id` to plan. */
  BudgetManagement: { periodId: string }
  /** Doubles as the edit form when `recurringExpenseId` is given. */
  RecurringExpenseForm: { recurringExpenseId?: string } | undefined
  Alerts: undefined
  Loans: undefined
  LoanDetail: { loanId: string }
  /**
   * Doubles as the edit form when `loanId` is given — editing only ever
   * touches `borrowerName`/`dueDate`/`note`, the rest is fixed by the
   * movement the loan already created.
   */
  CreateLoan: { loanId?: string } | undefined
  /** Today's snapshot, not tied to any financial period. */
  NetWorth: undefined
  CreateAccount: undefined
  SetInitialBalance: { accountId: string }
}

// Lets useNavigation()/useRoute() infer types app-wide without repeating generics.
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
