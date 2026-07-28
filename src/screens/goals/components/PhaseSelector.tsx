import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { GoalPhase } from '@/api/types'
import { PHASE_LABELS, PHASE_ORDER, getPhaseNumber } from '@/components'
import { useTheme } from '@/theme'

interface PhaseSelectorProps {
  value: GoalPhase
  onChange: (phase: GoalPhase) => void
}

/** The four phases of the method, as a two-by-two grid of choices. */
export function PhaseSelector({ value, onChange }: PhaseSelectorProps) {
  const { colors, spacing, typography } = useTheme()

  return (
    <View style={{ gap: spacing.xs }}>
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: typography.fontSizes.sm,
          fontWeight: typography.fontWeights.medium,
        }}
      >
        Fase (Prioridad)
      </Text>

      <View style={[styles.grid, { gap: spacing.sm }]}>
        {PHASE_ORDER.map(phase => {
          const selected = phase === value

          return (
            <Pressable
              key={phase}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`Fase ${getPhaseNumber(phase)}, ${
                PHASE_LABELS[phase]
              }`}
              onPress={() => onChange(phase)}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: selected ? colors.primary : colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.sm,
                },
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={{
                  color: selected ? colors.primaryText : colors.text,
                  fontSize: typography.fontSizes.sm,
                  fontWeight: typography.fontWeights.bold,
                }}
              >
                {`Fase ${getPhaseNumber(phase)}`}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  color: selected ? colors.primaryText : colors.textSecondary,
                  fontSize: typography.fontSizes.xs,
                }}
              >
                {PHASE_LABELS[phase]}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  option: {
    flexGrow: 1,
    flexBasis: '45%',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.8,
  },
})
