import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/theme'
import { withAlpha } from '@/utils'

export type BadgeTone =
  | 'neutral'
  | 'primary'
  | 'positive'
  | 'negative'
  | 'warning'

interface BadgeProps {
  label: string
  tone?: BadgeTone
  /** Overrides the tone, e.g. to match a category color. */
  color?: string
  /** Fills the badge with the solid color instead of a soft tint. */
  solid?: boolean
}

export function Badge({
  label,
  tone = 'neutral',
  color,
  solid = false,
}: BadgeProps) {
  const { colors, spacing, typography } = useTheme()

  const toneColors: Record<BadgeTone, string> = {
    neutral: colors.textSecondary,
    primary: colors.primary,
    positive: colors.positive,
    negative: colors.negative,
    warning: colors.warning,
  }

  const accent = color ?? toneColors[tone]

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: solid ? accent : withAlpha(accent, 0.14),
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs / 2,
        },
      ]}
    >
      <Text
        numberOfLines={1}
        style={{
          color: solid ? colors.textInverse : accent,
          fontSize: typography.fontSizes.xs,
          fontWeight: typography.fontWeights.medium,
        }}
      >
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
})
