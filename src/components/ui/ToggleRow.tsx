import React from 'react'
import { StyleSheet, Switch, Text, View } from 'react-native'
import { useTheme } from '@/theme'
import { withAlpha } from '@/utils'

interface ToggleRowProps {
  label: string
  value: boolean
  onValueChange: (value: boolean) => void
  /** Quiet line under the label explaining what the switch does. */
  description?: string
}

export function ToggleRow({
  label,
  value,
  onValueChange,
  description,
}: ToggleRowProps) {
  const { colors, spacing, typography } = useTheme()

  return (
    <View style={[styles.row, { gap: spacing.md }]}>
      <View style={styles.body}>
        <Text
          style={{
            color: colors.text,
            fontSize: typography.fontSizes.md,
            fontWeight: typography.fontWeights.medium,
          }}
        >
          {label}
        </Text>
        {description ? (
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: typography.fontSizes.xs,
            }}
          >
            {description}
          </Text>
        ) : null}
      </View>

      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onValueChange}
        thumbColor={colors.surface}
        trackColor={{
          false: colors.border,
          true: withAlpha(colors.primary, 0.6),
        }}
        ios_backgroundColor={colors.border}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  body: {
    flex: 1,
  },
})
