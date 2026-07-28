import React, { useCallback, useMemo, useState } from 'react'
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native'
import {
  LineChart as GiftedLineChart,
  type lineDataItem,
} from 'react-native-gifted-charts'
import { useTheme } from '@/theme'
import { formatCurrencyCompact, withAlpha } from '@/utils'

export interface LineChartPoint {
  value: number
  /** X-axis label, e.g. 'Ago'. Points without one keep the axis readable. */
  label?: string
  /** Callout pinned to this point, e.g. 'Venta del carro'. */
  marker?: string
  /** Overrides the marker color; defaults to the chart accent. */
  markerColor?: string
}

interface LineChartProps {
  data: readonly LineChartPoint[]
  height?: number
  /** Line and area color. Defaults to the theme primary. */
  color?: string
  /** Formats the y-axis labels. Defaults to the compact currency format. */
  formatValue?: (value: number) => string
  /** Fills the area under the line with a soft gradient. */
  area?: boolean
}

const DEFAULT_HEIGHT = 180
const Y_AXIS_LABEL_WIDTH = 56
const INITIAL_SPACING = 12
const END_SPACING = 12
const MARKER_LABEL_WIDTH = 92
const SECTIONS = 4

/**
 * The app's line chart: gifted-charts with the theme's colors, type scale and
 * currency formatting already applied, plus per-point markers for the events
 * that bend a projection. Callers pass data and, at most, an accent color.
 */
export function LineChart({
  data,
  height = DEFAULT_HEIGHT,
  color,
  formatValue = formatCurrencyCompact,
  area = true,
}: LineChartProps) {
  const { colors, typography } = useTheme()
  // gifted-charts needs an explicit pixel width, so the chart waits for the
  // first layout pass instead of guessing the screen size.
  const [width, setWidth] = useState(0)

  const accent = color ?? colors.primary

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width)
  }, [])

  const renderMarker = useCallback(
    (point: LineChartPoint) => (
      <View style={styles.marker}>
        <Text
          numberOfLines={2}
          style={{
            color: colors.textSecondary,
            fontSize: typography.fontSizes.xs,
            fontWeight: typography.fontWeights.medium,
          }}
        >
          {point.marker}
        </Text>
      </View>
    ),
    [colors.textSecondary, typography],
  )

  const chartData = useMemo<lineDataItem[]>(
    () =>
      data.map(point => {
        const item: lineDataItem = {
          value: point.value,
          label: point.label,
          hideDataPoint: point.marker === undefined,
          dataPointColor: accent,
        }

        if (point.marker === undefined) {
          return item
        }

        const markerColor = point.markerColor ?? accent
        return {
          ...item,
          dataPointRadius: 5,
          dataPointColor: markerColor,
          showVerticalLine: true,
          verticalLineColor: withAlpha(markerColor, 0.45),
          verticalLineThickness: 1,
          verticalLineUptoDataPoint: true,
          dataPointLabelComponent: () => renderMarker(point),
          dataPointLabelWidth: MARKER_LABEL_WIDTH,
          dataPointLabelShiftY: -22,
          dataPointLabelShiftX: MARKER_LABEL_WIDTH / 2,
        }
      }),
    [accent, data, renderMarker],
  )

  const axisTextStyle = {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs,
  }

  return (
    <View onLayout={handleLayout}>
      {width > 0 && chartData.length > 0 ? (
        <GiftedLineChart
          data={chartData}
          width={width - Y_AXIS_LABEL_WIDTH}
          height={height}
          adjustToWidth
          disableScroll
          curved
          thickness={3}
          color={accent}
          areaChart={area}
          startFillColor={accent}
          endFillColor={accent}
          startOpacity={0.28}
          endOpacity={0.02}
          initialSpacing={INITIAL_SPACING}
          endSpacing={END_SPACING}
          noOfSections={SECTIONS}
          yAxisLabelWidth={Y_AXIS_LABEL_WIDTH}
          yAxisThickness={0}
          yAxisColor={colors.border}
          xAxisColor={colors.border}
          rulesColor={colors.border}
          rulesType="dashed"
          dashWidth={4}
          dashGap={6}
          yAxisTextStyle={axisTextStyle}
          xAxisLabelTextStyle={axisTextStyle}
          formatYLabel={label => formatValue(Number(label))}
          hideOrigin
        />
      ) : (
        <View style={{ height }} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  marker: {
    width: MARKER_LABEL_WIDTH,
  },
})
