/**
 * @format
 */

import React, { useEffect, useState, useSyncExternalStore } from 'react'
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { NavigationContainer } from '@react-navigation/native'
import { QueryClientProvider } from '@tanstack/react-query'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import {
  getHasApiKey,
  setHasApiKey,
  subscribeApiKeyGate,
} from '@/api/apiKeyGate'
import { hasApiKey } from '@/api/secureStorage'
import { queryClient } from '@/api/queryClient'
import { ApiKeySetupScreen } from '@/screens/setup/ApiKeySetupScreen'
import { ThemeProvider, useTheme } from '@/theme'
import { RootNavigator, buildNavigationTheme } from '@/navigation'

function AppContent() {
  const { scheme, colors } = useTheme()
  const [checked, setChecked] = useState(false)
  const hasKey = useSyncExternalStore(subscribeApiKeyGate, getHasApiKey)

  useEffect(() => {
    hasApiKey().then(found => {
      setHasApiKey(found)
      setChecked(true)
    })
  }, [])

  const statusBar = (
    <StatusBar
      barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
    />
  )

  if (!checked) {
    return (
      <>
        {statusBar}
        <View
          style={[styles.flex, styles.centered, { backgroundColor: colors.background }]}
        >
          <ActivityIndicator color={colors.primary} />
        </View>
      </>
    )
  }

  if (!hasKey) {
    return (
      <>
        {statusBar}
        <ApiKeySetupScreen onSaved={() => setHasApiKey(true)} />
      </>
    )
  }

  return (
    <>
      {statusBar}
      <NavigationContainer theme={buildNavigationTheme(scheme, colors)}>
        <RootNavigator />
      </NavigationContainer>
    </>
  )
}

function App() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default App
