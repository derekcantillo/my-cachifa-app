import React, { useCallback, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { setApiKeyCache } from '@/api/httpClient'
import { setApiKey } from '@/api/secureStorage'
import { Button, TextField } from '@/components'
import { useTheme } from '@/theme'

interface ApiKeySetupScreenProps {
  /** Called once the key is written to Keychain, so the caller can move on. */
  onSaved: () => void
}

/**
 * Gate shown before `RootNavigator` when Keychain has no API key yet — the
 * app has nothing to call the backend with until one is pasted in here.
 */
export function ApiKeySetupScreen({ onSaved }: ApiKeySetupScreenProps) {
  const { colors, spacing, typography } = useTheme()
  const [key, setKey] = useState('')
  const [error, setError] = useState<string | undefined>(undefined)
  const [saving, setSaving] = useState(false)

  const handleSave = useCallback(async () => {
    const trimmed = key.trim()
    if (!trimmed) {
      setError('Pega la API key para continuar.')
      return
    }

    setSaving(true)
    setError(undefined)
    try {
      await setApiKey(trimmed)
      setApiKeyCache(trimmed)
      onSaved()
    } catch {
      setError('No pudimos guardar la key en el dispositivo. Intenta de nuevo.')
      setSaving(false)
    }
  }, [key, onSaved])

  return (
    <SafeAreaView
      style={[styles.flex, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.content, { padding: spacing.lg, gap: spacing.lg }]}>
          <View style={{ gap: spacing.xs }}>
            <Text
              style={{
                color: colors.text,
                fontSize: typography.fontSizes.xl,
                fontWeight: typography.fontWeights.semibold,
              }}
            >
              Configura tu API key
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typography.fontSizes.md,
              }}
            >
              La necesitamos para conectar con el servidor. Se guarda de
              forma segura en este dispositivo y no se vuelve a pedir.
            </Text>
          </View>

          <TextField
            label="API key"
            value={key}
            onChangeText={setKey}
            placeholder="Pega tu API key aquí"
            secureTextEntry
            autoCapitalize="none"
            autoFocus
            error={error}
          />

          <Button label="Guardar" onPress={handleSave} loading={saving} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
})
