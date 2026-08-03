import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/theme'
import { withAlpha } from '@/utils'
import { Button } from './Button'

interface EmptyStateProps {
  /** Glyph for the state, e.g. `<WalletIcon />`. Sized by the caller. */
  icon: React.ReactNode
  /** What is missing, in a few words: "Sin movimientos este mes". */
  title: string
  /** Why it is empty and what to do about it — one short sentence. */
  description: string
  /** Way out of the state. Both halves are needed: a label with no handler
   * would render a dead button, so neither shows without the other. */
  actionLabel?: string
  onAction?: () => void
}

const ICON_SIZE = 56

/**
 * What a screen shows once it has loaded and there is genuinely nothing to
 * show. Distinct from the skeletons, which mean "still loading", and from the
 * error notices, which mean "we could not load it" — a screen picks exactly one
 * of the three.
 */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { colors, spacing, typography } = useTheme()

  return (
    <View
      accessibilityRole="summary"
      style={[
        styles.container,
        { paddingVertical: spacing.lg, gap: spacing.sm },
      ]}
    >
      <View
        style={[
          styles.icon,
          { backgroundColor: withAlpha(colors.textSecondary, 0.1) },
        ]}
      >
        {icon}
      </View>

      <Text
        style={[
          styles.text,
          {
            color: colors.text,
            fontSize: typography.fontSizes.md,
            fontWeight: typography.fontWeights.semibold,
          },
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.text,
          {
            color: colors.textSecondary,
            fontSize: typography.fontSizes.sm,
          },
        ]}
      >
        {description}
      </Text>

      {actionLabel !== undefined && onAction !== undefined && (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant="outline"
          style={{ marginTop: spacing.sm }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
})
