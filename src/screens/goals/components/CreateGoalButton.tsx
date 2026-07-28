import React from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'
import { PlusIcon } from '@/components'
import { useTheme } from '@/theme'

interface CreateGoalButtonProps {
  onPress: () => void
}

const LABEL = 'Crear nueva meta'

export function CreateGoalButton({ onPress }: CreateGoalButtonProps) {
  const { colors, spacing, typography } = useTheme()

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={LABEL}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.brand,
          gap: spacing.sm,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
        },
        pressed && styles.pressed,
      ]}
    >
      <PlusIcon size={18} color={colors.brandText} />
      <Text
        style={{
          color: colors.brandText,
          fontSize: typography.fontSizes.md,
          fontWeight: typography.fontWeights.semibold,
        }}
      >
        {LABEL}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  pressed: {
    opacity: 0.85,
  },
})
