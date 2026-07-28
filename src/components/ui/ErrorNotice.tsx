import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/theme'
import { withAlpha } from '@/utils'

interface ErrorNoticeProps {
  /** Whatever the mutation rejected with; anything else falls back to a default. */
  error: unknown
  /** Shown when the error carries no message of its own. */
  fallback?: string
}

const DEFAULT_MESSAGE = 'Algo salió mal. Vuelve a intentarlo.'

function toMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message
  }
  if (typeof error === 'string' && error) {
    return error
  }
  return fallback
}

/** Inline banner for a failed mutation, shown next to the action that failed. */
export function ErrorNotice({
  error,
  fallback = DEFAULT_MESSAGE,
}: ErrorNoticeProps) {
  const { colors, spacing, typography } = useTheme()

  if (!error) {
    return null
  }

  return (
    <View
      accessibilityRole="alert"
      style={[
        styles.notice,
        {
          backgroundColor: withAlpha(colors.negative, 0.12),
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
        },
      ]}
    >
      <Text
        style={{
          color: colors.negative,
          fontSize: typography.fontSizes.sm,
        }}
      >
        {toMessage(error, fallback)}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  notice: {
    borderRadius: 12,
  },
})
