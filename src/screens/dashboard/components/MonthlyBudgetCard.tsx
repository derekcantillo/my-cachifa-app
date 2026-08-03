import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import {
  Card,
  CheckCircleIcon,
  EmptyState,
  MoreIcon,
  ProgressRing,
  Separator,
  SlidersIcon,
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
  /** Opens budget management for the period, from the header and the empty state. */
  onManagePress: () => void
}

export function MonthlyBudgetCard({
  month,
  limit,
  spent,
  remaining,
  percent,
  onManagePress,
}: MonthlyBudgetCardProps) {
  const { colors, spacing, typography } = useTheme()

  const statusColor = getBudgetStatusColor(percent, colors)
  const daysLeft = daysLeftInMonth(month)
  const exceeded = remaining < 0

  // With no limits set there is nothing to be 0% of: a ring at zero reads as
  // "you have spent nothing", when the truth is "you have not planned yet".
  const isPlanned = limit > 0

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
          onPress={onManagePress}
          hitSlop={spacing.sm}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <MoreIcon size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      {!isPlanned ? (
        <EmptyState
          icon={<SlidersIcon size={26} color={colors.textSecondary} />}
          title="Sin presupuesto este mes"
          description="Define cuánto quieres gastar por categoría y sigue tu avance aquí."
          actionLabel="Definir presupuesto"
          onAction={onManagePress}
        />
      ) : (
        <>
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
        </>
      )}
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
