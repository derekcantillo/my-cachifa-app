import type { NavigatorScreenParams } from '@react-navigation/native'

export type DashboardStackParamList = {
  Dashboard: undefined
}

export type TransactionsStackParamList = {
  Transactions: undefined
}

export type GoalsStackParamList = {
  Goals: undefined
}

export type SettingsStackParamList = {
  Settings: undefined
}

export type MainTabParamList = {
  DashboardTab: NavigatorScreenParams<DashboardStackParamList>
  TransactionsTab: NavigatorScreenParams<TransactionsStackParamList>
  GoalsTab: NavigatorScreenParams<GoalsStackParamList>
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>
}

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>
}

// Lets useNavigation()/useRoute() infer types app-wide without repeating generics.
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
