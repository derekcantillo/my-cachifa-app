import React from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { useTheme } from '@/theme'
import { withAlpha } from '@/utils'

const TRANSPARENT = 'transparent'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'

interface ButtonProps {
  label: string
  onPress: () => void
  variant?: ButtonVariant
  /** Swaps the label for a spinner and blocks further presses. */
  loading?: boolean
  disabled?: boolean
  /** Rendered before the label, e.g. a plus glyph. */
  icon?: React.ReactNode
  style?: StyleProp<ViewStyle>
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
}: ButtonProps) {
  const { colors, spacing, typography } = useTheme()

  const palette: Record<
    ButtonVariant,
    { background: string; text: string; border?: string }
  > = {
    primary: { background: colors.brand, text: colors.brandText },
    secondary: {
      background: withAlpha(colors.textSecondary, 0.12),
      text: colors.text,
    },
    outline: {
      background: TRANSPARENT,
      text: colors.primary,
      border: colors.primary,
    },
    ghost: { background: TRANSPARENT, text: colors.text },
    danger: { background: TRANSPARENT, text: colors.negative },
  }

  const { background, text, border } = palette[variant]
  const blocked = disabled || loading

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: blocked, busy: loading }}
      disabled={blocked}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: background,
          borderWidth: border ? 1 : 0,
          borderColor: border ?? TRANSPARENT,
          gap: spacing.sm,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
        },
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={text} />
      ) : (
        <>
          {icon ? <View>{icon}</View> : null}
          <Text
            numberOfLines={1}
            style={{
              color: text,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.semibold,
            }}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
})
