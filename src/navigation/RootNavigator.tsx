import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import {
  AlertsScreen,
  BudgetManagementScreen,
  CreateAccountScreen,
  CreateGoalScreen,
  CreateLoanScreen,
  GoalDetailScreen,
  LoanDetailScreen,
  LoansScreen,
  NetWorthScreen,
  RecurringExpenseFormScreen,
  RegisterTransactionScreen,
  SetInitialBalanceScreen,
  SettingsScreen,
  TransactionDetailScreen,
} from '@/screens'
import { MainTabNavigator } from './MainTabNavigator'
import type { RootStackParamList } from './types'

const Stack = createNativeStackNavigator<RootStackParamList>()

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabNavigator} />

      {/* The modals draw their own ModalHeader, so the native one stays off. */}
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Ajustes' }}
        />
        <Stack.Screen
          name="RegisterTransaction"
          component={RegisterTransactionScreen}
          options={{ title: 'Registrar' }}
        />
        <Stack.Screen
          name="TransactionDetail"
          component={TransactionDetailScreen}
          options={{ title: 'Detalle del movimiento' }}
        />
        <Stack.Screen
          name="CreateGoal"
          component={CreateGoalScreen}
          options={{ title: 'Crear nueva meta' }}
        />
        <Stack.Screen
          name="GoalDetail"
          component={GoalDetailScreen}
          options={{ title: 'Detalle de la meta' }}
        />
        <Stack.Screen
          name="BudgetManagement"
          component={BudgetManagementScreen}
          options={{ title: 'Gestionar presupuesto' }}
        />
        <Stack.Screen
          name="RecurringExpenseForm"
          component={RecurringExpenseFormScreen}
          options={{ title: 'Gasto fijo' }}
        />
        <Stack.Screen
          name="Alerts"
          component={AlertsScreen}
          options={{ title: 'Notificaciones' }}
        />
        <Stack.Screen
          name="Loans"
          component={LoansScreen}
          options={{ title: 'Préstamos' }}
        />
        <Stack.Screen
          name="LoanDetail"
          component={LoanDetailScreen}
          options={{ title: 'Detalle del préstamo' }}
        />
        <Stack.Screen
          name="CreateLoan"
          component={CreateLoanScreen}
          options={{ title: 'Prestar dinero' }}
        />
        <Stack.Screen
          name="NetWorth"
          component={NetWorthScreen}
          options={{ title: 'Patrimonio Neto' }}
        />
        <Stack.Screen
          name="CreateAccount"
          component={CreateAccountScreen}
          options={{ title: 'Agregar cuenta' }}
        />
        <Stack.Screen
          name="SetInitialBalance"
          component={SetInitialBalanceScreen}
          options={{ title: 'Saldo inicial' }}
        />
      </Stack.Group>
    </Stack.Navigator>
  )
}
