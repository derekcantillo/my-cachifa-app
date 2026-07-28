import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import {
  Card,
  CheckCircleIcon,
  MoreIcon,
  ProgressRing,
  Separator,
} from '@/components'
import { getBudgetStatusColor, useTheme } from '@/theme'
import { daysLeftInMonth, formatCurrency, formatMonthName } from '@/utils'
import type { MonthKey } from '@/utils'

interface MonthlyBudgetCardProps {
  month: MonthKey
  limit: number
  spent: number
  remaining: number
  percent: number
  onOptionsPress?: () => void
}

export function MonthlyBudgetCard({
  month,
  limit,
  spent,
  remaining,
  percent,
  onOptionsPress,
}: MonthlyBudgetCardProps) {
  const { colors, spacing, typography } = useTheme()

  const statusColor = getBudgetStatusColor(percent, colors)
  const daysLeft = daysLeftInMonth(month)
  const exceeded = remaining < 0

  return (
    <Card>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text
            numberOfLines={1}
            style={{
              color: colors.text,
              fontSize: typography.fontSizes.lg,
              fontWeight: typography.fontWeights.bold,
            }}
          >
            {`Presupuesto ${formatMonthName(month)}`}
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: typography.fontSizes.sm,
            }}
          >
            {daysLeft === 1 ? 'Queda 1 día' : `Quedan ${daysLeft} días`}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Opciones del presupuesto"
          onPress={onOptionsPress}
          hitSlop={spacing.sm}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <MoreIcon size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={[styles.ring, { marginVertical: spacing.lg }]}>
        <ProgressRing
          percent={percent}
          color={statusColor}
          label={`${Math.round(percent)}%`}
        />
      </View>

      <Amount label="Gastados" value={formatCurrency(spent)} />

      <View style={{ marginVertical: spacing.md }}>
        <Separator />
      </View>

      <Amount label="Presupuesto Total" value={formatCurrency(limit)} />

      <View
        style={[
          styles.callout,
          {
            backgroundColor: exceeded
              ? colors.surfaceMuted
              : colors.positiveSurface,
            marginTop: spacing.md,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.sm,
            gap: spacing.xs,
          },
        ]}
      >
        <CheckCircleIcon
          size={16}
          color={exceeded ? colors.negative : colors.positive}
        />
        <Text
          numberOfLines={1}
          style={{
            color: exceeded ? colors.negative : colors.positive,
            fontSize: typography.fontSizes.sm,
            fontWeight: typography.fontWeights.medium,
          }}
        >
          {exceeded
            ? `${formatCurrency(Math.abs(remaining))} por encima`
            : `${formatCurrency(remaining)} disponibles`}
        </Text>
      </View>
    </Card>
  )
}

interface AmountProps {
  label: string
  value: string
}

function Amount({ label, value }: AmountProps) {
  const { colors, typography } = useTheme()

  return (
    <View>
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: typography.fontSizes.sm,
        }}
      >
        {label}
      </Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={{
          color: colors.text,
          fontSize: typography.fontSizes.xl,
          fontWeight: typography.fontWeights.bold,
        }}
      >
        {value}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
  },
  ring: {
    alignItems: 'center',
  },
  callout: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 999,
  },
  pressed: {
    opacity: 0.6,
  },
})
