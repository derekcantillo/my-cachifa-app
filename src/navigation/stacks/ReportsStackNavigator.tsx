import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ReportsScreen } from '@/screens'
import type { ReportsStackParamList } from '../types'

const Stack = createNativeStackNavigator<ReportsStackParamList>()

export function ReportsStackNavigator() {
  // Screens draw their own AppHeader, so the native header stays off.
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Reports"
        component={ReportsScreen}
        options={{ title: 'Reportes' }}
      />
    </Stack.Navigator>
  )
}
