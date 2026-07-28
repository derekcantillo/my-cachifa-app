import React from 'react'
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { useTheme } from '@/theme'

interface CardProps {
  children: React.ReactNode
  title?: string
  /** Rendered opposite the title — a link, a badge, a value. */
  action?: React.ReactNode
  /** Raises the card above the screen background (dark scheme relies on this). */
  elevated?: boolean
  onPress?: () => void
  style?: StyleProp<ViewStyle>
}

export function Card({
  children,
  title,
  action,
  elevated = false,
  onPress,
  style,
}: CardProps) {
  const { colors, scheme, spacing, typography } = useTheme()

  const content = (
    <>
      {(title || action) && (
        <View style={[styles.header, { marginBottom: spacing.md }]}>
          {title ? (
            <Text
              style={[
                styles.title,
                {
                  color: colors.text,
                  fontSize: typography.fontSizes.lg,
                  fontWeight: typography.fontWeights.bold,
                },
              ]}
            >
              {title}
            </Text>
          ) : (
            <View />
          )}
          {action}
        </View>
      )}
      {children}
    </>
  )

  // Cards read as raised sheets on the light canvas; the dark scheme has no
  // shadow to catch, so it falls back to a hairline outline.
  const cardStyle: StyleProp<ViewStyle> = [
    styles.card,
    scheme === 'dark' ? styles.outlined : styles.raised,
    {
      backgroundColor: elevated ? colors.surfaceElevated : colors.surface,
      borderColor: colors.border,
      shadowColor: colors.text,
      padding: spacing.md,
    },
    style,
  ]

  if (!onPress) {
    return <View style={cardStyle}>{content}</View>
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [cardStyle, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
  },
  raised: {
    ...Platform.select({
      ios: {
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  outlined: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flexShrink: 1,
  },
  pressed: {
    opacity: 0.7,
  },
})
