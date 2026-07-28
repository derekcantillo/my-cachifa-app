import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ExpensesScreen } from '@/screens'
import type { ExpensesStackParamList } from '../types'

const Stack = createNativeStackNavigator<ExpensesStackParamList>()

export function ExpensesStackNavigator() {
  // Screens draw their own AppHeader, so the native header stays off.
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Expenses"
        component={ExpensesScreen}
        options={{ title: 'Gastos' }}
      />
    </Stack.Navigator>
  )
}
