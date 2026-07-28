import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Card } from '@/components'
import { getBudgetStatus, useTheme } from '@/theme'
import { formatCurrency } from '@/utils'

interface WeeklySummaryCardProps {
  /** Spent and saved over the last seven days. */
  expense: number
  saving: number
  /** Budget left for the rest of the month. */
  available: number
  /** Share of the monthly budget already used, 0-100+. */
  percentUsed: number
  daysLeft: number
}

const HEADLINES = {
  healthy: 'Vas bien esta semana',
  warning: 'Cuidado con el ritmo',
  exceeded: 'Te pasaste del presupuesto',
} as const

export function WeeklySummaryCard({
  expense,
  saving,
  available,
  percentUsed,
  daysLeft,
}: WeeklySummaryCardProps) {
  const { colors, spacing, typography } = useTheme()

  const rows = [
    { label: 'Gastado', value: expense, color: colors.text },
    { label: 'Ahorrado', value: saving, color: colors.positive },
    { label: 'Disponible', value: available, color: colors.primary },
  ]

  const headline = HEADLINES[getBudgetStatus(percentUsed)]

  return (
    <Card title="Resumen semanal 📊">
      <View style={{ gap: spacing.sm }}>
        {rows.map(row => (
          <View key={row.label} style={styles.row}>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typography.fontSizes.sm,
              }}
            >
              {`${row.label}:`}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                color: row.color,
                fontSize: typography.fontSizes.md,
                fontWeight: typography.fontWeights.semibold,
              }}
            >
              {formatCurrency(row.value)}
            </Text>
          </View>
        ))}
      </View>

      <View
        style={[
          styles.note,
          {
            backgroundColor: colors.surfaceMuted,
            marginTop: spacing.md,
            padding: spacing.sm,
          },
        ]}
      >
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: typography.fontSizes.sm,
          }}
        >
          {`${headline}, llevas el ${Math.round(
            percentUsed,
          )}% del presupuesto con ${daysLeft} días restantes.`}
        </Text>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  note: {
    borderRadius: 12,
  },
})
