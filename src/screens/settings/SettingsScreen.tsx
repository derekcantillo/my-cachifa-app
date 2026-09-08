import React, { useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import { setHasApiKey } from '@/api/apiKeyGate'
import { setApiKeyCache } from '@/api/httpClient'
import { clearApiKey } from '@/api/secureStorage'
import { Button, ScreenPlaceholder } from '@/components'
import { useTheme } from '@/theme'

// Placeholder until Ajustes gets its real layout in el Bloque 5.
export function SettingsScreen() {
  const { spacing } = useTheme()

  const handleChangeApiKey = useCallback(async () => {
    await clearApiKey()
    setApiKeyCache(null)
    setHasApiKey(false)
  }, [])

  return (
    <View style={styles.flex}>
      <ScreenPlaceholder title="Ajustes" />
      <View style={[styles.footer, { padding: spacing.lg }]}>
        <Button
          label="Cambiar API Key"
          variant="outline"
          onPress={handleChangeApiKey}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
})
