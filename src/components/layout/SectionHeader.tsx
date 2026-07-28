import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/theme'

interface SectionHeaderProps {
  title: string
  /** Optional right-hand link, e.g. "Ver todas". */
  actionLabel?: string
  onActionPress?: () => void
  /** Rendered before the action label, e.g. a filter glyph. */
  actionIcon?: React.ReactNode
}

export function SectionHeader({
  title,
  actionLabel,
  onActionPress,
  actionIcon,
}: SectionHeaderProps) {
  const { colors, spacing, typography } = useTheme()

  return (
    <View style={styles.container}>
      <Text
        numberOfLines={1}
        style={[
          styles.title,
          {
            color: colors.text,
            fontSize: typography.fontSizes.lg,
            fontWeight: typography.fontWeights.bold,
          },
        ]}
      >
        {title}
      </Text>

      {actionLabel ? (
        <Pressable
          accessibilityRole="button"
          onPress={onActionPress}
          hitSlop={spacing.sm}
          style={({ pressed }) => [
            styles.action,
            { gap: spacing.xs },
            pressed && styles.pressed,
          ]}
        >
          <Text
            style={{
              color: colors.primary,
              fontSize: typography.fontSizes.sm,
              fontWeight: typography.fontWeights.medium,
            }}
          >
            {actionLabel}
          </Text>
          {actionIcon}
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flexShrink: 1,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
})
