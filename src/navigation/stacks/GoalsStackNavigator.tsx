import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { GoalsScreen } from '@/screens'
import type { GoalsStackParamList } from '../types'

const Stack = createNativeStackNavigator<GoalsStackParamList>()

export function GoalsStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Goals"
        component={GoalsScreen}
        options={{ title: 'Metas' }}
      />
    </Stack.Navigator>
  )
}
