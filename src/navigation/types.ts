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
 * Settings and the five modals sit outside the tab bar: the design reaches
 * Settings from the avatar in the app header, and every modal can be opened
 * from more than one tab, so they all live at the root.
 */
export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>
  Settings: undefined
  /** Doubles as the edit form when `transactionId` is given. */
  RegisterTransaction: { transactionId?: string } | undefined
  TransactionDetail: { transactionId: string }
  /** Doubles as the edit form when `goalId` is given. */
  CreateGoal: { goalId?: string } | undefined
  GoalDetail: { goalId: string }
  /** Period to plan, formatted 'YYYY-MM'. */
  BudgetManagement: { month: string }
}

// Lets useNavigation()/useRoute() infer types app-wide without repeating generics.
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
