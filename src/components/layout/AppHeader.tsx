import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/theme'
import { BellIcon, SettingsIcon, UserIcon } from '../ui/icons'

interface AppHeaderProps {
  onProfilePress?: () => void
  onNotificationsPress?: () => void
  /** Renders a gear icon next to the bell — only Dashboard passes this. */
  onSettingsPress?: () => void
  /** Badge on the bell; hidden at 0 or when left out. */
  unreadAlertsCount?: number
}

const WORDMARK = 'Cachifa'
const AVATAR_SIZE = 36
const MAX_BADGE_COUNT = 9
const BADGE_SIZE = 16

/** Avatar, wordmark and notifications bell shared by every main screen. */
export function AppHeader({
  onProfilePress,
  onNotificationsPress,
  onSettingsPress,
  unreadAlertsCount = 0,
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

      <View style={[styles.trailing, { gap: spacing.sm }]}>
        {onSettingsPress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ajustes"
            onPress={onSettingsPress}
            hitSlop={spacing.sm}
            style={({ pressed }) => [
              styles.action,
              pressed && styles.pressed,
            ]}
          >
            <SettingsIcon size={22} color={colors.brand} />
          </Pressable>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            unreadAlertsCount > 0
              ? `Ver notificaciones (${unreadAlertsCount} sin leer)`
              : 'Ver notificaciones'
          }
          onPress={onNotificationsPress}
          hitSlop={spacing.sm}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        >
          <BellIcon size={22} color={colors.brand} />
          {unreadAlertsCount > 0 ? (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: colors.negative,
                  borderColor: colors.background,
                },
              ]}
            >
              <Text style={[styles.badgeText, { color: colors.textInverse }]}>
                {unreadAlertsCount > MAX_BADGE_COUNT
                  ? `${MAX_BADGE_COUNT}+`
                  : unreadAlertsCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>
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
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  action: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 0,
    minWidth: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.6,
  },
})
