import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { TransactionsScreen } from '@/screens'
import type { TransactionsStackParamList } from '../types'

const Stack = createNativeStackNavigator<TransactionsStackParamList>()

export function TransactionsStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{ title: 'Transacciones' }}
      />
    </Stack.Navigator>
  )
}
