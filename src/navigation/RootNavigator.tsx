import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import {
  BudgetManagementScreen,
  CreateGoalScreen,
  GoalDetailScreen,
  RegisterTransactionScreen,
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
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerShown: true, title: 'Ajustes' }}
      />

      {/* The modals draw their own ModalHeader, so the native one stays off. */}
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
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
      </Stack.Group>
    </Stack.Navigator>
  )
}
