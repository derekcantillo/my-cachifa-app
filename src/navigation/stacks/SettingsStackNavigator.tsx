import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SettingsScreen } from '@/screens'
import type { SettingsStackParamList } from '../types'

const Stack = createNativeStackNavigator<SettingsStackParamList>()

export function SettingsStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Ajustes' }}
      />
    </Stack.Navigator>
  )
}
