import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/theme'
import { BellIcon, UserIcon } from '../ui/icons'

interface AppHeaderProps {
  onProfilePress?: () => void
  onNotificationsPress?: () => void
}

const WORDMARK = 'Cachifa'
const AVATAR_SIZE = 36

/** Avatar, wordmark and notifications bell shared by every main screen. */
export function AppHeader({
  onProfilePress,
  onNotificationsPress,
}: AppHeaderProps) {
  const { colors, spacing, typography } = useTheme()

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Abrir ajustes"
        onPress={onProfilePress}
        style={({ pressed }) => [
          styles.avatar,
          {
            backgroundColor: colors.surfaceMuted,
            borderColor: colors.border,
          },
          pressed && styles.pressed,
        ]}
      >
        <UserIcon size={20} color={colors.textSecondary} />
      </Pressable>

      <Text
        style={{
          color: colors.brand,
          fontSize: typography.fontSizes.md,
          fontWeight: typography.fontWeights.bold,
        }}
      >
        {WORDMARK}
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ver notificaciones"
        onPress={onNotificationsPress}
        hitSlop={spacing.sm}
        style={({ pressed }) => [styles.action, pressed && styles.pressed]}
      >
        <BellIcon size={22} color={colors.brand} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  action: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
})
