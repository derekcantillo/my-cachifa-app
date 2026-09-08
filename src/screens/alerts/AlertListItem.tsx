import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { Alert, AlertType } from '@/api/types'
import {
  BellIcon,
  ChartIcon,
  ClockIcon,
  TargetIcon,
  WalletIcon,
  type IconProps,
} from '@/components'
import { useTheme } from '@/theme'
import { formatRelativeTime, withAlpha } from '@/utils'

const ALERT_ICONS: Record<AlertType, (props: IconProps) => React.JSX.Element> = {
  BUDGET_70: WalletIcon,
  BUDGET_90: WalletIcon,
  BUDGET_100: WalletIcon,
  LARGE_EXPENSE: WalletIcon,
  SAVING_REMINDER: TargetIcon,
  WEEKLY_SUMMARY: ChartIcon,
  MONTHLY_REPORT: ChartIcon,
  GOAL_PROGRESS: TargetIcon,
  RECURRING_EXPENSE_DUE: ClockIcon,
  SAVINGS_TARGET_AT_RISK: TargetIcon,
}

interface AlertListItemProps {
  alert: Alert
  onPress?: (alert: Alert) => void
}

/** One alert: icon by type, message, relative time and an unread dot. */
export function AlertListItem({ alert, onPress }: AlertListItemProps) {
  const { colors, spacing, typography } = useTheme()
  const Icon = ALERT_ICONS[alert.type] ?? BellIcon
  const accent = alert.isRead ? colors.textSecondary : colors.primary

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={alert.message}
      onPress={onPress ? () => onPress(alert) : undefined}
      style={({ pressed }) => [
        styles.row,
        { gap: spacing.sm, paddingVertical: spacing.xs },
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[styles.iconCircle, { backgroundColor: withAlpha(accent, 0.16) }]}
      >
        <Icon size={20} color={accent} />
      </View>

      <View style={styles.body}>
        <Text
          style={{
            color: colors.text,
            fontSize: typography.fontSizes.sm,
            fontWeight: alert.isRead
              ? typography.fontWeights.regular
              : typography.fontWeights.semibold,
          }}
        >
          {alert.message}
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: typography.fontSizes.xs,
            marginTop: spacing.xs / 2,
          }}
        >
          {formatRelativeTime(alert.createdAt)}
        </Text>
      </View>

      {!alert.isRead && (
        <View style={[styles.dot, { backgroundColor: colors.primary }]} />
      )}
    </Pressable>
  )
}

const ICON_CIRCLE_SIZE = 36
const DOT_SIZE = 8

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: ICON_CIRCLE_SIZE,
    height: ICON_CIRCLE_SIZE,
    borderRadius: ICON_CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    marginTop: DOT_SIZE / 2,
  },
  pressed: {
    opacity: 0.6,
  },
})
