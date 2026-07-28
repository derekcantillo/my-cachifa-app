import type { NavigatorScreenParams } from '@react-navigation/native'

export type DashboardStackParamList = {
  Dashboard: undefined
}

export type ExpensesStackParamList = {
  Expenses: undefined
}

export type GoalsStackParamList = {
  Goals: undefined
  // Placeholder routes until sub-block 4c turns them into modals.
  GoalDetail: { goalId: string }
  CreateGoal: undefined
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

// Settings sits outside the tab bar: the design reaches it from the avatar in
// the app header, so it lives at the root instead.
export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>
  Settings: undefined
}

// Lets useNavigation()/useRoute() infer types app-wide without repeating generics.
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
