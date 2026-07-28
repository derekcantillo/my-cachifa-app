import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Card, PieChart, type PieChartSlice } from '@/components'
import { useTheme } from '@/theme'
import { formatCurrency, formatCurrencyCompact } from '@/utils'

interface ExpenseDistributionCardProps {
  slices: PieChartSlice[]
  /** Sum of the slices, shown in the middle of the donut. */
  total: number
}

const DONUT_RADIUS = 88

export function ExpenseDistributionCard({
  slices,
  total,
}: ExpenseDistributionCardProps) {
  const { colors, spacing, typography } = useTheme()

  if (slices.length === 0) {
    return (
      <Card title="Distribución de gastos">
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: typography.fontSizes.sm,
          }}
        >
          No registraste gastos en este mes.
        </Text>
      </Card>
    )
  }

  return (
    <Card title="Distribución de gastos">
      <View style={styles.chart}>
        <PieChart
          data={slices}
          radius={DONUT_RADIUS}
          centerLabel={formatCurrencyCompact(total)}
          centerCaption="Gastado"
        />
      </View>

      <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
        {slices.map(slice => {
          const share = total > 0 ? (slice.value / total) * 100 : 0

          return (
            <View
              key={slice.key}
              style={[styles.legendRow, { gap: spacing.sm }]}
            >
              <View style={[styles.dot, { backgroundColor: slice.color }]} />

              <Text
                numberOfLines={1}
                style={[
                  styles.legendLabel,
                  { color: colors.text, fontSize: typography.fontSizes.sm },
                ]}
              >
                {slice.label}
              </Text>

              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: typography.fontSizes.sm,
                }}
              >
                {formatCurrency(slice.value)}
              </Text>

              <Text
                style={[
                  styles.share,
                  {
                    color: colors.text,
                    fontSize: typography.fontSizes.sm,
                    fontWeight: typography.fontWeights.semibold,
                  },
                ]}
              >
                {`${Math.round(share)}%`}
              </Text>
            </View>
          )
        })}
      </View>
    </Card>
  )
}

const DOT_SIZE = 10
const SHARE_WIDTH = 44

const styles = StyleSheet.create({
  chart: {
    alignItems: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  legendLabel: {
    flex: 1,
  },
  share: {
    width: SHARE_WIDTH,
    textAlign: 'right',
  },
})
