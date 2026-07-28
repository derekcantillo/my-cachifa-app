import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { DashboardScreen } from '@/screens'
import type { DashboardStackParamList } from '../types'

const Stack = createNativeStackNavigator<DashboardStackParamList>()

export function DashboardStackNavigator() {
  // Screens draw their own AppHeader, so the native header stays off.
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Inicio' }}
      />
    </Stack.Navigator>
  )
}
