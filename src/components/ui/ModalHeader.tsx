import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/theme'
import { ArrowLeftIcon, CloseIcon } from './icons'

/** 'back' for full-screen modals, 'close' for the bottom sheets. */
export type ModalHeaderLeading = 'back' | 'close'

interface ModalHeaderProps {
  title: string
  onClose: () => void
  leading?: ModalHeaderLeading
  /** Rendered at the trailing edge, e.g. the edit and delete icons. */
  actions?: React.ReactNode
  /** Colors the title with the brand ink, as the detail screens do. */
  brandTitle?: boolean
}

const SLOT_WIDTH = 64

/** Title bar for the modal routes, which run with the native header off. */
export function ModalHeader({
  title,
  onClose,
  leading = 'back',
  actions,
  brandTitle = false,
}: ModalHeaderProps) {
  const { colors, spacing, typography } = useTheme()

  const Glyph = leading === 'close' ? CloseIcon : ArrowLeftIcon

  return (
    <View
      style={[
        styles.header,
        {
          borderBottomColor: colors.border,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
        },
      ]}
    >
      <View style={styles.slot}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={leading === 'close' ? 'Cerrar' : 'Volver'}
          onPress={onClose}
          hitSlop={spacing.sm}
          style={({ pressed }) => [styles.leading, pressed && styles.pressed]}
        >
          <Glyph size={24} color={colors.text} />
        </Pressable>
      </View>

      <Text
        numberOfLines={1}
        style={[
          styles.title,
          {
            color: brandTitle ? colors.brand : colors.text,
            fontSize: typography.fontSizes.lg,
            fontWeight: typography.fontWeights.bold,
          },
        ]}
      >
        {title}
      </Text>

      <View style={[styles.slot, styles.actions, { gap: spacing.md }]}>
        {actions}
      </View>
    </View>
  )
}

interface ModalHeaderActionProps {
  accessibilityLabel: string
  onPress: () => void
  children: React.ReactNode
  disabled?: boolean
}

/** Icon button for the trailing slot of `ModalHeader`. */
export function ModalHeaderAction({
  accessibilityLabel,
  onPress,
  children,
  disabled = false,
}: ModalHeaderActionProps) {
  const { spacing } = useTheme()

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={spacing.sm}
      style={({ pressed }) => [
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {children}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  slot: {
    width: SLOT_WIDTH,
  },
  leading: {
    alignSelf: 'flex-start',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  disabled: {
    opacity: 0.4,
  },
})
