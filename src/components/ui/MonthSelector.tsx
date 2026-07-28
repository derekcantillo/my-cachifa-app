import React from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/theme'
import { formatMonthYear, shiftMonthKey, type MonthKey } from '@/utils'
import { ChevronLeftIcon, ChevronRightIcon } from './icons'

interface MonthSelectorProps {
  /** Selected period, formatted 'YYYY-MM'. */
  value: MonthKey
  onChange: (month: MonthKey) => void
  /** Latest selectable period; later months are disabled. */
  maxMonth?: MonthKey
}

export function MonthSelector({
  value,
  onChange,
  maxMonth,
}: MonthSelectorProps) {
  const { colors, scheme, spacing, typography } = useTheme()

  const nextMonth = shiftMonthKey(value, 1)
  const nextDisabled = maxMonth !== undefined && nextMonth > maxMonth

  return (
    <View
      style={[
        styles.container,
        scheme === 'dark' ? styles.outlined : styles.raised,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.text,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.sm,
          gap: spacing.md,
        },
      ]}
    >
      <ArrowButton
        accessibilityLabel="Mes anterior"
        onPress={() => onChange(shiftMonthKey(value, -1))}
      />

      <Text
        numberOfLines={1}
        style={{
          color: colors.text,
          fontSize: typography.fontSizes.md,
          fontWeight: typography.fontWeights.semibold,
        }}
      >
        {formatMonthYear(value)}
      </Text>

      <ArrowButton
        accessibilityLabel="Mes siguiente"
        forward
        disabled={nextDisabled}
        onPress={() => onChange(nextMonth)}
      />
    </View>
  )
}

interface ArrowButtonProps {
  accessibilityLabel: string
  onPress: () => void
  forward?: boolean
  disabled?: boolean
}

function ArrowButton({
  accessibilityLabel,
  onPress,
  forward = false,
  disabled = false,
}: ArrowButtonProps) {
  const { colors, spacing } = useTheme()
  const Chevron = forward ? ChevronRightIcon : ChevronLeftIcon

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={spacing.sm}
      style={({ pressed }) => [
        styles.arrow,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Chevron
        size={20}
        color={disabled ? colors.textSecondary : colors.text}
      />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 14,
  },
  raised: {
    ...Platform.select({
      ios: {
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  outlined: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  arrow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  disabled: {
    opacity: 0.4,
  },
})
