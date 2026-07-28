import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { CreateGoalScreen, GoalDetailScreen, GoalsScreen } from '@/screens'
import type { GoalsStackParamList } from '../types'

const Stack = createNativeStackNavigator<GoalsStackParamList>()

export function GoalsStackNavigator() {
  // The list draws its own AppHeader; the pushed routes keep the native one so
  // they get a back button for free.
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Goals"
        component={GoalsScreen}
        options={{ title: 'Metas' }}
      />
      <Stack.Screen
        name="GoalDetail"
        component={GoalDetailScreen}
        options={{ headerShown: true, title: 'Meta' }}
      />
      <Stack.Screen
        name="CreateGoal"
        component={CreateGoalScreen}
        options={{ headerShown: true, title: 'Nueva meta' }}
      />
    </Stack.Navigator>
  )
}
