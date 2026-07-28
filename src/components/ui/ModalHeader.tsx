import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/theme'
import { CloseIcon } from './icons'

interface ModalHeaderProps {
  title: string
  onClose: () => void
  /** Rendered opposite the close button, e.g. a "more" menu. */
  action?: React.ReactNode
}

/** Title bar for the modal routes, which run with the native header off. */
export function ModalHeader({ title, onClose, action }: ModalHeaderProps) {
  const { colors, spacing, typography } = useTheme()

  return (
    <View
      style={[
        styles.header,
        {
          borderBottomColor: colors.border,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          gap: spacing.sm,
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cerrar"
        onPress={onClose}
        hitSlop={spacing.sm}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <CloseIcon size={22} color={colors.text} />
      </Pressable>

      <Text
        numberOfLines={1}
        style={[
          styles.title,
          {
            color: colors.text,
            fontSize: typography.fontSizes.md,
            fontWeight: typography.fontWeights.semibold,
          },
        ]}
      >
        {title}
      </Text>

      {action ?? <View style={styles.spacer} />}
    </View>
  )
}

const SPACER_WIDTH = 22

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  spacer: {
    width: SPACER_WIDTH,
  },
  pressed: {
    opacity: 0.6,
  },
})
