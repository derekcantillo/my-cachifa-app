import React from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/theme'
import { withAlpha } from '@/utils'

export interface ChipOption<TValue extends string = string> {
  value: TValue
  label: string
  /** Accent for the selected state, e.g. the category color. */
  color?: string
  /** Rendered before the label, e.g. a CategoryIcon. */
  icon?: React.ReactNode
}

interface OptionChipsProps<TValue extends string> {
  label?: string
  options: ReadonlyArray<ChipOption<TValue>>
  value: TValue | null
  onChange: (value: TValue) => void
  error?: string
  /** Lays the chips out in a wrapping grid instead of one scrolling row. */
  wrap?: boolean
}

/** Single-choice chip row, used for picking a category, an account or a phase. */
export function OptionChips<TValue extends string>({
  label,
  options,
  value,
  onChange,
  error,
  wrap = false,
}: OptionChipsProps<TValue>) {
  const { colors, spacing, typography } = useTheme()

  const chips = options.map(option => {
    const selected = option.value === value
    const accent = option.color ?? colors.primary

    return (
      <Pressable
        key={option.value}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={option.label}
        onPress={() => onChange(option.value)}
        style={({ pressed }) => [
          styles.chip,
          {
            backgroundColor: selected
              ? withAlpha(accent, 0.16)
              : colors.surfaceMuted,
            borderColor: selected ? accent : colors.border,
            gap: spacing.xs,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
          },
          pressed && styles.pressed,
        ]}
      >
        {option.icon}
        <Text
          numberOfLines={1}
          style={{
            color: selected ? accent : colors.text,
            fontSize: typography.fontSizes.sm,
            fontWeight: selected
              ? typography.fontWeights.semibold
              : typography.fontWeights.regular,
          }}
        >
          {option.label}
        </Text>
      </Pressable>
    )
  })

  return (
    <View style={{ gap: spacing.xs }}>
      {label ? (
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: typography.fontSizes.sm,
            fontWeight: typography.fontWeights.medium,
          }}
        >
          {label}
        </Text>
      ) : null}

      {wrap ? (
        <View style={[styles.wrap, { gap: spacing.sm }]}>{chips}</View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.row, { gap: spacing.sm }]}
        >
          {chips}
        </ScrollView>
      )}

      {error ? (
        <Text
          style={{ color: colors.negative, fontSize: typography.fontSizes.xs }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  row: {
    alignItems: 'center',
    paddingVertical: 2,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pressed: {
    opacity: 0.6,
  },
})
