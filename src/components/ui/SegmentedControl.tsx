import React from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { useTheme } from '@/theme'

const TRANSPARENT = 'transparent'

export interface SegmentedControlOption<TValue extends string> {
  value: TValue
  label: string
}

interface SegmentedControlProps<TValue extends string> {
  options: ReadonlyArray<SegmentedControlOption<TValue>>
  value: TValue
  onChange: (value: TValue) => void
  style?: StyleProp<ViewStyle>
}

export function SegmentedControl<TValue extends string>({
  options,
  value,
  onChange,
  style,
}: SegmentedControlProps<TValue>) {
  const { colors, spacing, typography } = useTheme()

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.container,
        { backgroundColor: colors.border, padding: spacing.xs / 2 },
        style,
      ]}
    >
      {options.map(option => {
        const selected = option.value === value
        const segmentBackground = selected ? colors.surface : TRANSPARENT

        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[
              styles.segment,
              {
                paddingVertical: spacing.sm,
                backgroundColor: segmentBackground,
              },
            ]}
          >
            <Text
              numberOfLines={1}
              style={{
                color: selected ? colors.text : colors.textSecondary,
                fontSize: typography.fontSizes.sm,
                fontWeight: selected
                  ? typography.fontWeights.semibold
                  : typography.fontWeights.regular,
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
})
