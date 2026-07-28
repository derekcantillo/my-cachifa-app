import React from 'react'
import { Platform, Pressable, StyleSheet } from 'react-native'
import { useTheme } from '@/theme'
import { PlusIcon } from './icons'

interface FABProps {
  onPress: () => void
  accessibilityLabel: string
  disabled?: boolean
}

const SIZE = 56

export function FAB({
  onPress,
  accessibilityLabel,
  disabled = false,
}: FABProps) {
  const { colors, spacing } = useTheme()

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.fab,
        {
          backgroundColor: colors.brand,
          shadowColor: colors.text,
          right: spacing.md,
          bottom: spacing.lg,
        },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <PlusIcon size={26} color={colors.brandText} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 6 },
      default: {},
    }),
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
})
