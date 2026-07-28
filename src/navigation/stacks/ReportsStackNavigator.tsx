import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ReportsScreen } from '@/screens'
import type { ReportsStackParamList } from '../types'

const Stack = createNativeStackNavigator<ReportsStackParamList>()

export function ReportsStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Reports"
        component={ReportsScreen}
        options={{ title: 'Reportes' }}
      />
    </Stack.Navigator>
  )
}
