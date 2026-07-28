import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Svg, { Circle, G } from 'react-native-svg'
import { useTheme } from '@/theme'

interface ProgressRingProps {
  /** Progress from 0 to 100. Values above 100 fill the ring completely. */
  percent: number
  /** Main text inside the ring. */
  label?: string
  /** Secondary text under the label. */
  caption?: string
  /** Outer diameter in points. */
  size?: number
  thickness?: number
  /** Defaults to the theme primary color. */
  color?: string
  trackColor?: string
}

export function ProgressRing({
  percent,
  label,
  caption,
  size = 180,
  thickness = 18,
  color,
  trackColor,
}: ProgressRingProps) {
  const { colors, spacing, typography } = useTheme()

  const strokeColor = color ?? colors.primary
  const track = trackColor ?? colors.border

  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(Math.max(percent, 0), 100)
  const dashOffset = circumference * (1 - clamped / 100)

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Rotate so progress starts at 12 o'clock instead of 3 o'clock. */}
        <G transform={`rotate(-90, ${size / 2}, ${size / 2})`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={track}
            strokeWidth={thickness}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            fill="none"
          />
        </G>
      </Svg>

      {(label || caption) && (
        <View style={[styles.center, { paddingHorizontal: spacing.md }]}>
          {label ? (
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={{
                color: colors.text,
                fontSize: typography.fontSizes.xxl,
                fontWeight: typography.fontWeights.bold,
              }}
            >
              {label}
            </Text>
          ) : null}
          {caption ? (
            <Text
              numberOfLines={2}
              style={[
                styles.caption,
                {
                  color: colors.textSecondary,
                  fontSize: typography.fontSizes.xs,
                },
              ]}
            >
              {caption}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: {
    textAlign: 'center',
  },
})
