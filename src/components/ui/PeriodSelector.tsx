import React, { useMemo } from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import type { FinancialPeriod } from '@/api/types'
import { useTheme } from '@/theme'
import { ChevronLeftIcon, ChevronRightIcon } from './icons'

interface PeriodSelectorProps {
  periods: readonly FinancialPeriod[]
  selectedPeriodId: string
  onPeriodChange: (id: string) => void
}

/**
 * Steps through the financial periods one at a time: ← to the one before,
 * → to the one after. There is nothing after the open period (`endDate`
 * null), so → stops there.
 */
export function PeriodSelector({
  periods,
  selectedPeriodId,
  onPeriodChange,
}: PeriodSelectorProps) {
  const { colors, scheme, spacing, typography } = useTheme()

  // Oldest first, so "previous" is one index down whatever order they came in.
  const ordered = useMemo(
    () => [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [periods],
  )

  const index = ordered.findIndex(period => period.id === selectedPeriodId)
  const selected = ordered[index]
  const previous = index > 0 ? ordered[index - 1] : undefined
  const next =
    index >= 0 && selected?.endDate !== null ? ordered[index + 1] : undefined

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
        accessibilityLabel="Período anterior"
        disabled={previous === undefined}
        onPress={() => previous && onPeriodChange(previous.id)}
      />

      <Text
        numberOfLines={1}
        style={[
          styles.label,
          {
            color: colors.text,
            fontSize: typography.fontSizes.md,
            fontWeight: typography.fontWeights.semibold,
          },
        ]}
      >
        {selected?.label ?? ''}
      </Text>

      <ArrowButton
        accessibilityLabel="Período siguiente"
        forward
        disabled={next === undefined}
        onPress={() => next && onPeriodChange(next.id)}
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
  label: {
    flexShrink: 1,
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
