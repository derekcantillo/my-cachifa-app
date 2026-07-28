import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { GoalsScreen } from '@/screens'
import type { GoalsStackParamList } from '../types'

const Stack = createNativeStackNavigator<GoalsStackParamList>()

export function GoalsStackNavigator() {
  // Screens draw their own AppHeader, so the native header stays off. Goal
  // detail and creation are modals at the root, not routes in this stack.
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Goals"
        component={GoalsScreen}
        options={{ title: 'Metas' }}
      />
    </Stack.Navigator>
  )
}
