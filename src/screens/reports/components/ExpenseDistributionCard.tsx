import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import {
  canRenderPieChart,
  Card,
  EmptyState,
  PieChart,
  WalletIcon,
  type PieChartSlice,
} from '@/components'
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

  // A month can hold movements and still have nothing to split here — income
  // or savings only. Asked of the same data the chart would use, so the card
  // and the donut can never disagree about whether there is a chart to draw.
  if (!canRenderPieChart(slices)) {
    return (
      <Card title="Distribución de gastos">
        <EmptyState
          icon={<WalletIcon size={26} color={colors.textSecondary} />}
          title="Sin gastos este mes"
          description="Registraste movimientos, pero ninguno es un gasto que repartir por categoría."
        />
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
