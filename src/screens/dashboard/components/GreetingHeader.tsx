import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/theme'
import { formatFullDate } from '@/utils'

interface GreetingHeaderProps {
  /** Omitted until a profile/auth block provides the account holder's name. */
  userName?: string
  now?: Date
}

export function GreetingHeader({
  userName,
  now = new Date(),
}: GreetingHeaderProps) {
  const { colors, typography } = useTheme()

  return (
    <View style={styles.container}>
      <Text
        style={{
          color: colors.text,
          fontSize: typography.fontSizes.xxl,
          fontWeight: typography.fontWeights.bold,
        }}
      >
        {userName ? `Hola ${userName} 👋` : 'Hola 👋'}
      </Text>
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: typography.fontSizes.sm,
        }}
      >
        {formatFullDate(now)}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 2,
  },
})
