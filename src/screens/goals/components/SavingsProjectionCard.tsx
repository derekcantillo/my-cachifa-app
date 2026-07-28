import React, { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { SavingsProjection } from '@/api/types'
import { Card, LineChart, Skeleton, type LineChartPoint } from '@/components'
import { useTheme } from '@/theme'
import { formatCurrency, formatMonthShort, withAlpha } from '@/utils'

interface SavingsProjectionCardProps {
  projection: SavingsProjection | undefined
  isLoading: boolean
}

/** Labelling every month crowds the axis, so only every third one is drawn. */
const LABEL_EVERY = 3
const CHART_HEIGHT = 200

export function SavingsProjectionCard({
  projection,
  isLoading,
}: SavingsProjectionCardProps) {
  const { colors, spacing, typography } = useTheme()

  const points = useMemo<LineChartPoint[]>(
    () =>
      (projection?.points ?? []).map((point, index) => ({
        value: point.amount,
        ...(index % LABEL_EVERY === 0
          ? { label: formatMonthShort(point.month) }
          : {}),
        ...(point.event
          ? {
              marker: point.event.label,
              markerColor:
                point.event.kind === 'outflow'
                  ? colors.negative
                  : colors.positive,
            }
          : {}),
      })),
    [colors.negative, colors.positive, projection],
  )

  const events = projection?.points.flatMap(point =>
    point.event ? [point.event] : [],
  )

  const peak = projection?.points.reduce(
    (highest, point) => Math.max(highest, point.amount),
    0,
  )

  return (
    <Card title="Proyección de Ahorro Total">
      {isLoading || !projection ? (
        <View style={{ gap: spacing.sm }}>
          <Skeleton height={14} width="60%" />
          <Skeleton height={CHART_HEIGHT} radius={16} />
        </View>
      ) : (
        <>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: typography.fontSizes.sm,
              marginBottom: spacing.md,
            }}
          >
            {`Aportando ${formatCurrency(
              projection.monthlyContribution,
            )} al mes llegarías a ${formatCurrency(peak ?? 0)}.`}
          </Text>

          <LineChart data={points} height={CHART_HEIGHT} />

          {events && events.length > 0 && (
            <View
              style={[
                styles.legend,
                { marginTop: spacing.md, gap: spacing.xs },
              ]}
            >
              {events.map(event => {
                const tone =
                  event.kind === 'outflow' ? colors.negative : colors.positive

                return (
                  <View
                    key={event.id}
                    style={[
                      styles.legendRow,
                      {
                        gap: spacing.sm,
                        backgroundColor: withAlpha(tone, 0.1),
                        paddingHorizontal: spacing.sm,
                        paddingVertical: spacing.xs,
                      },
                    ]}
                  >
                    <View
                      style={[styles.legendDot, { backgroundColor: tone }]}
                    />
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.legendLabel,
                        {
                          color: colors.text,
                          fontSize: typography.fontSizes.xs,
                        },
                      ]}
                    >
                      {event.label}
                    </Text>
                    <Text
                      style={{
                        color: tone,
                        fontSize: typography.fontSizes.xs,
                        fontWeight: typography.fontWeights.semibold,
                      }}
                    >
                      {formatCurrency(event.amount, { signed: true })}
                    </Text>
                  </View>
                )
              })}
            </View>
          )}
        </>
      )}
    </Card>
  )
}

const DOT_SIZE = 8

const styles = StyleSheet.create({
  legend: {
    width: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
  },
  legendDot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  legendLabel: {
    flex: 1,
  },
})
