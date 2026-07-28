import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Card } from '@/components'
import { useTheme } from '@/theme'

interface InsightCardProps {
  /** What the figure is, e.g. "Mayor gasto". */
  title: string
  /** The headline figure or name. */
  value: string
  /** Supporting line under the value. */
  caption?: string
  /** Colors the value; defaults to the regular ink. */
  accent?: string
  /** Rendered to the left of the text, e.g. a category icon. */
  icon?: React.ReactNode
}

/** One figure from the monthly report, as a card. */
export function InsightCard({
  title,
  value,
  caption,
  accent,
  icon,
}: InsightCardProps) {
  const { colors, spacing, typography } = useTheme()

  return (
    <Card>
      <View style={[styles.row, { gap: spacing.md }]}>
        {icon}

        <View style={styles.body}>
          <Text
            numberOfLines={1}
            style={{
              color: colors.textSecondary,
              fontSize: typography.fontSizes.xs,
              fontWeight: typography.fontWeights.medium,
            }}
          >
            {title}
          </Text>

          <Text
            numberOfLines={1}
            style={{
              color: accent ?? colors.text,
              fontSize: typography.fontSizes.lg,
              fontWeight: typography.fontWeights.bold,
            }}
          >
            {value}
          </Text>

          {caption ? (
            <Text
              numberOfLines={2}
              style={{
                color: colors.textSecondary,
                fontSize: typography.fontSizes.sm,
              }}
            >
              {caption}
            </Text>
          ) : null}
        </View>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  body: {
    flex: 1,
  },
})
