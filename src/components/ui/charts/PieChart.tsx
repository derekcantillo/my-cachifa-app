import React, { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import {
  PieChart as GiftedPieChart,
  type pieDataItem,
} from 'react-native-gifted-charts'
import { useTheme } from '@/theme'

export interface PieChartSlice {
  /** Stable key, e.g. the category id. Also used for the legend rows. */
  key: string
  label: string
  value: number
  color: string
}

interface PieChartProps {
  data: readonly PieChartSlice[]
  /** Outer radius in points. */
  radius?: number
  /** Cuts the hole out of the middle. */
  donut?: boolean
  /** Big text inside the hole, e.g. the period total. */
  centerLabel?: string
  /** Secondary text under the center label. */
  centerCaption?: string
}

const DEFAULT_RADIUS = 90
const INNER_RADIUS_RATIO = 0.62

/**
 * Slices worth drawing. A zero or negative value contributes no arc but still
 * makes gifted-charts divide by a total it cannot use, so it never reaches the
 * chart.
 */
function toDrawableSlices(
  data: readonly PieChartSlice[],
): readonly PieChartSlice[] {
  return data.filter(slice => Number.isFinite(slice.value) && slice.value > 0)
}

/** True when there is enough in `data` for a donut to mean anything. */
export function canRenderPieChart(data: readonly PieChartSlice[]): boolean {
  return toDrawableSlices(data).length > 0
}

/**
 * The app's pie/donut chart: gifted-charts with the theme's surface, type scale
 * and spacing applied. Slice colors come from the caller — reports pass the
 * fixed category colors so the donut matches the icons and chips.
 */
export function PieChart({
  data,
  radius = DEFAULT_RADIUS,
  donut = true,
  centerLabel,
  centerCaption,
}: PieChartProps) {
  const { colors, typography } = useTheme()

  const chartData = useMemo<pieDataItem[]>(
    () =>
      toDrawableSlices(data).map(slice => ({
        value: slice.value,
        color: slice.color,
        text: slice.label,
      })),
    [data],
  )

  const renderCenter = () => (
    <View style={styles.center}>
      {centerLabel ? (
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={{
            color: colors.text,
            fontSize: typography.fontSizes.lg,
            fontWeight: typography.fontWeights.bold,
          }}
        >
          {centerLabel}
        </Text>
      ) : null}
      {centerCaption ? (
        <Text
          numberOfLines={1}
          style={{
            color: colors.textSecondary,
            fontSize: typography.fontSizes.xs,
          }}
        >
          {centerCaption}
        </Text>
      ) : null}
    </View>
  )

  const showCenter =
    donut && (centerLabel !== undefined || centerCaption !== undefined)

  // A period with no expenses reaches here as an empty array — or as slices
  // that all sit at zero, which is the same thing to a donut. Drawing either
  // one leaves an arc computed from a total of 0. The caller owns the message
  // that goes in its place (`canRenderPieChart` asks the same question).
  if (chartData.length === 0) {
    return null
  }

  return (
    <GiftedPieChart
      data={chartData}
      radius={radius}
      donut={donut}
      innerRadius={donut ? radius * INNER_RADIUS_RATIO : 0}
      innerCircleColor={colors.surface}
      strokeWidth={2}
      strokeColor={colors.surface}
      {...(showCenter ? { centerLabelComponent: renderCenter } : {})}
    />
  )
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})
