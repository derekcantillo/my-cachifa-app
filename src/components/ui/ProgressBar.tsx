import React from 'react'
import { StyleSheet, View } from 'react-native'
import { useTheme } from '@/theme'

interface ProgressBarProps {
  /** Progress from 0 to 100. Values above 100 fill the bar completely. */
  percent: number
  /** Defaults to the theme primary color. */
  color?: string
  trackColor?: string
  height?: number
}

export function ProgressBar({
  percent,
  color,
  trackColor,
  height = 8,
}: ProgressBarProps) {
  const { colors } = useTheme()

  const clamped = Math.min(Math.max(percent, 0), 100)

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped) }}
      style={[
        styles.track,
        {
          backgroundColor: trackColor ?? colors.border,
          height,
          borderRadius: height / 2,
        },
      ]}
    >
      <View
        style={{
          width: `${clamped}%`,
          height,
          borderRadius: height / 2,
          backgroundColor: color ?? colors.primary,
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
})
