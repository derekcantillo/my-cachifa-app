import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { Account } from '@/api/types'
import { Badge, CategoryIcon } from '@/components/ui'
import { useTheme } from '@/theme'
import { formatCurrency } from '@/utils'
import { ACCOUNT_TYPES } from './accountTypes'

interface AccountListItemProps {
  account: Account
  onPress?: (account: Account) => void
}

/** One account: name, type badge and its current balance. */
export function AccountListItem({ account, onPress }: AccountListItemProps) {
  const { colors, spacing, typography } = useTheme()
  const type = ACCOUNT_TYPES[account.type]

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Saldo inicial de ${account.name}`}
      disabled={!onPress}
      onPress={onPress ? () => onPress(account) : undefined}
      style={({ pressed }) => [
        styles.row,
        { gap: spacing.sm, paddingVertical: spacing.xs },
        pressed && styles.pressed,
      ]}
    >
      <CategoryIcon icon={type.icon} color={type.color} size={36} />

      <View style={[styles.body, { gap: spacing.xs / 2 }]}>
        <Text
          numberOfLines={1}
          style={{
            color: colors.text,
            fontSize: typography.fontSizes.md,
            fontWeight: typography.fontWeights.semibold,
          }}
        >
          {account.name}
        </Text>
        <Badge label={type.label} color={type.color} />
      </View>

      <Text
        style={{
          color: account.currentBalance < 0 ? colors.negative : colors.text,
          fontSize: typography.fontSizes.md,
          fontWeight: typography.fontWeights.semibold,
        }}
      >
        {formatCurrency(account.currentBalance)}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  body: {
    flex: 1,
  },
  pressed: {
    opacity: 0.6,
  },
})
