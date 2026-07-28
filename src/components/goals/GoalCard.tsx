import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { Goal } from '@/api/types'
import { useTheme } from '@/theme'
import {
  formatCurrency,
  formatCurrencyCompact,
  formatMonthYear,
  toMonthKey,
} from '@/utils'
import {
  Badge,
  CalendarIcon,
  Card,
  ClockIcon,
  ProgressBar,
} from '@/components/ui'
import { formatMonthsRemaining, getGoalProgress } from './goalProgress'

/** 'compact' is the carousel tile; 'full' is the row on the goals screen. */
export type GoalCardVariant = 'compact' | 'full'

interface GoalCardProps {
  goal: Goal
  variant?: GoalCardVariant
  /** Fixed width, used when the card sits in a horizontal carousel. */
  width?: number
  onPress?: (goal: Goal) => void
}

const GLYPH_SIZE: Record<GoalCardVariant, number> = { compact: 32, full: 40 }
const GLYPH_FONT_SIZE: Record<GoalCardVariant, number> = {
  compact: 16,
  full: 20,
}

/**
 * A goal as a card. Both variants read the same derived figures from
 * `getGoalProgress`; only the layout around them differs — the compact one
 * trims to name, amounts and progress, the full one adds the phase and status
 * badges and the time left.
 */
export function GoalCard({
  goal,
  variant = 'compact',
  width,
  onPress,
}: GoalCardProps) {
  const { colors, spacing, typography } = useTheme()
  const progress = getGoalProgress(goal)

  const full = variant === 'full'
  const accent = progress.completed ? colors.positive : colors.primary
  const monthsLabel = formatMonthsRemaining(progress.monthsRemaining)
  // The full card has the room for exact figures; the carousel tile does not.
  const formatAmount = full ? formatCurrency : formatCurrencyCompact
  const glyphSize = GLYPH_SIZE[variant]

  return (
    <Card
      style={width ? { width } : undefined}
      onPress={onPress ? () => onPress(goal) : undefined}
    >
      <View style={[styles.header, { gap: spacing.sm }]}>
        <View
          style={[
            styles.glyph,
            {
              width: glyphSize,
              height: glyphSize,
              borderRadius: glyphSize / 2,
              backgroundColor: colors.surfaceMuted,
            },
          ]}
        >
          <Text style={{ fontSize: GLYPH_FONT_SIZE[variant] }}>
            {progress.glyph}
          </Text>
        </View>

        <View style={styles.headerBody}>
          <Text
            numberOfLines={full ? 2 : 1}
            style={{
              color: colors.text,
              fontSize: full
                ? typography.fontSizes.lg
                : typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
            }}
          >
            {goal.name}
          </Text>

          {full && goal.targetDate ? (
            <View style={[styles.subtitle, { gap: spacing.xs }]}>
              <CalendarIcon size={14} color={colors.textSecondary} />
              <Text
                numberOfLines={1}
                style={{
                  color: colors.textSecondary,
                  fontSize: typography.fontSizes.xs,
                }}
              >
                {formatMonthYear(toMonthKey(new Date(goal.targetDate)))}
              </Text>
            </View>
          ) : null}
        </View>

        {full && (
          <View style={[styles.badges, { gap: spacing.xs }]}>
            <Badge label={progress.shortPhaseLabel} tone="positive" />
            {goal.status !== 'active' && (
              <Badge label={progress.statusLabel} tone={progress.statusTone} />
            )}
          </View>
        )}
      </View>

      <View style={[styles.amounts, { marginTop: spacing.md }]}>
        <Text
          numberOfLines={1}
          style={{
            color: accent,
            fontSize: full ? typography.fontSizes.lg : typography.fontSizes.md,
            fontWeight: typography.fontWeights.semibold,
          }}
        >
          {formatAmount(goal.currentAmount)}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            color: colors.textSecondary,
            fontSize: typography.fontSizes.sm,
          }}
        >
          {`de ${formatAmount(goal.targetAmount)}`}
        </Text>
      </View>

      <View style={{ marginTop: spacing.sm }}>
        <ProgressBar percent={progress.percent} color={accent} height={10} />
      </View>

      {full ? (
        <View style={[styles.footer, { marginTop: spacing.sm }]}>
          <Text
            style={{
              color: colors.text,
              fontSize: typography.fontSizes.xs,
              fontWeight: typography.fontWeights.medium,
            }}
          >
            {`${progress.displayPercent}% completado`}
          </Text>

          <View style={[styles.subtitle, { gap: spacing.xs }]}>
            {monthsLabel ? (
              <ClockIcon size={14} color={colors.textSecondary} />
            ) : null}
            <Text
              numberOfLines={1}
              style={{
                color: colors.textSecondary,
                fontSize: typography.fontSizes.xs,
              }}
            >
              {/* Goals without a target date show what is still missing. */}
              {monthsLabel ??
                `Faltan ${formatCurrency(progress.remainingAmount)}`}
            </Text>
          </View>
        </View>
      ) : (
        <Text
          style={[
            styles.compactPercent,
            {
              color: colors.textSecondary,
              fontSize: typography.fontSizes.xs,
              marginTop: spacing.xs,
            },
          ]}
        >
          {`${progress.displayPercent}%`}
        </Text>
      )}
    </Card>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  glyph: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBody: {
    flex: 1,
  },
  subtitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  amounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactPercent: {
    textAlign: 'right',
  },
})
