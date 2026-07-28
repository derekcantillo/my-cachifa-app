import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/theme'
import { withAlpha } from '@/utils'

interface InfoCalloutProps {
  /** Small heading above the message, e.g. "Consejo". */
  title?: string
  /** Rendered to the left of the text. */
  icon?: React.ReactNode
  children: React.ReactNode
  /** Tint of the panel; defaults to the theme primary. */
  color?: string
}

/** Soft tinted panel used for advice and for the highlighted bonus toggle. */
export function InfoCallout({
  title,
  icon,
  children,
  color,
}: InfoCalloutProps) {
  const { colors, spacing, typography } = useTheme()
  const accent = color ?? colors.primary

  return (
    <View
      style={[
        styles.callout,
        {
          backgroundColor: withAlpha(accent, 0.1),
          padding: spacing.md,
          gap: spacing.sm,
        },
      ]}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}

      <View style={styles.body}>
        {title ? (
          <Text
            style={{
              color: accent,
              fontSize: typography.fontSizes.sm,
              fontWeight: typography.fontWeights.semibold,
            }}
          >
            {title}
          </Text>
        ) : null}
        {children}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  callout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 14,
  },
  icon: {
    paddingTop: 2,
  },
  body: {
    flex: 1,
  },
})
