import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { GoalPhase } from '@/api/types'
import { Card, PHASE_LABELS, PHASE_ORDER, getPhaseNumber } from '@/components'
import { useTheme } from '@/theme'

interface CurrentPlanCardProps {
  /** Phase the active goals are currently working on, if any. */
  phase: GoalPhase | null
}

const DOT_SIZE = 7

/** "Plan actual": which phase of the method the goals are on. */
export function CurrentPlanCard({ phase }: CurrentPlanCardProps) {
  const { colors, spacing, typography } = useTheme()

  return (
    <Card>
      <View style={styles.row}>
        <View style={styles.text}>
          <Text
            style={[
              styles.overline,
              {
                color: colors.textSecondary,
                fontSize: typography.fontSizes.xs,
                fontWeight: typography.fontWeights.medium,
              },
            ]}
          >
            PLAN ACTUAL
          </Text>
          <Text
            numberOfLines={1}
            style={{
              color: colors.text,
              fontSize: typography.fontSizes.lg,
              fontWeight: typography.fontWeights.semibold,
            }}
          >
            {phase
              ? `Fase ${getPhaseNumber(phase)} — ${PHASE_LABELS[phase]}`
              : 'Sin metas activas'}
          </Text>
        </View>

        <View style={[styles.dots, { gap: spacing.xs }]}>
          {PHASE_ORDER.map(step => (
            <View
              key={step}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    step === phase ? colors.primary : colors.border,
                },
              ]}
            />
          ))}
        </View>
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
  text: {
    flex: 1,
  },
  overline: {
    letterSpacing: 1,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
})
