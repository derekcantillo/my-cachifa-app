import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/theme'

interface ScreenPlaceholderProps {
  title: string
}

export function ScreenPlaceholder({ title }: ScreenPlaceholderProps) {
  const { colors, typography } = useTheme()

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text
        style={[
          styles.title,
          {
            color: colors.text,
            fontSize: typography.fontSizes.lg,
            fontWeight: typography.fontWeights.semibold,
          },
        ]}
      >
        {title}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
  },
})
