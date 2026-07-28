import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { Goal } from '@/api/types'
import { toPercent, useTheme } from '@/theme'
import { formatCurrencyCompact } from '@/utils'
import { Card, ProgressBar } from '@/components/ui'
import { PHASE_GLYPHS } from './phases'

interface GoalCardProps {
  goal: Goal
  /** Fixed width, used when the card sits in a horizontal carousel. */
  width?: number
  onPress?: (goal: Goal) => void
}

/** Compact summary of a goal: saved amount, progress bar and completion. */
export function GoalCard({ goal, width, onPress }: GoalCardProps) {
  const { colors, spacing, typography } = useTheme()

  const percent = toPercent(goal.currentAmount, goal.targetAmount)
  const accent = goal.status === 'completed' ? colors.positive : colors.primary

  return (
    <Card
      style={width ? { width } : undefined}
      onPress={onPress ? () => onPress(goal) : undefined}
    >
      <View style={[styles.header, { gap: spacing.sm }]}>
        <View style={[styles.glyph, { backgroundColor: colors.surfaceMuted }]}>
          <Text style={styles.glyphText}>{PHASE_GLYPHS[goal.phase]}</Text>
        </View>

        <Text
          numberOfLines={1}
          style={[
            styles.name,
            {
              color: colors.text,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.semibold,
            },
          ]}
        >
          {goal.name}
        </Text>
      </View>

      <View style={[styles.amounts, { marginTop: spacing.md }]}>
        <Text
          numberOfLines={1}
          style={{
            color: accent,
            fontSize: typography.fontSizes.md,
            fontWeight: typography.fontWeights.semibold,
          }}
        >
          {formatCurrencyCompact(goal.currentAmount)}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            color: colors.textSecondary,
            fontSize: typography.fontSizes.sm,
          }}
        >
          {`de ${formatCurrencyCompact(goal.targetAmount)}`}
        </Text>
      </View>

      <View style={{ marginTop: spacing.sm }}>
        <ProgressBar percent={percent} color={accent} height={10} />
      </View>

      <Text
        style={[
          styles.percent,
          {
            color: colors.textSecondary,
            fontSize: typography.fontSizes.xs,
            marginTop: spacing.xs,
          },
        ]}
      >
        {`${Math.round(percent)}%`}
      </Text>
    </Card>
  )
}

const GLYPH_SIZE = 32

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  glyph: {
    width: GLYPH_SIZE,
    height: GLYPH_SIZE,
    borderRadius: GLYPH_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyphText: {
    fontSize: 16,
  },
  name: {
    flex: 1,
  },
  amounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  percent: {
    textAlign: 'right',
  },
})
