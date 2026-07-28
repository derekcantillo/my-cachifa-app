import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { Category, Transaction } from '@/api/types'
import { useTheme } from '@/theme'
import { formatCurrency, formatDayMonth, formatRelativeTime } from '@/utils'
import { CategoryIcon } from '@/components/ui'

/** 'time' shows "hace 2 h"; 'category' shows "Alimentación • 15 jul". */
type SubtitleMode = 'time' | 'category'

interface TransactionListItemProps {
  transaction: Transaction
  /** Resolved category for the transaction; falls back to a neutral row. */
  category?: Category
  subtitle?: SubtitleMode
  onPress?: (transaction: Transaction) => void
}

const UNKNOWN_CATEGORY_LABEL = 'Sin categoría'

export function TransactionListItem({
  transaction,
  category,
  subtitle = 'category',
  onPress,
}: TransactionListItemProps) {
  const { colors, spacing, typography } = useTheme()

  // Expenses stay in the default ink; only money coming in or set aside is
  // colored, which keeps long lists calm.
  const amountColor =
    transaction.kind === 'income'
      ? colors.positive
      : transaction.kind === 'saving'
      ? colors.primary
      : colors.text

  const signedAmount =
    transaction.kind === 'expense' ? -transaction.amount : transaction.amount

  const caption =
    subtitle === 'time'
      ? formatRelativeTime(transaction.date)
      : `${category?.name ?? UNKNOWN_CATEGORY_LABEL} • ${formatDayMonth(
          transaction.date,
        )}`

  const row = (
    <View style={[styles.row, { paddingVertical: spacing.sm }]}>
      <CategoryIcon
        icon={category?.icon ?? 'wallet'}
        categoryId={category?.id}
        variant="muted"
      />

      <View style={[styles.body, { marginHorizontal: spacing.md }]}>
        <Text
          numberOfLines={1}
          style={{
            color: colors.text,
            fontSize: typography.fontSizes.md,
            fontWeight: typography.fontWeights.semibold,
          }}
        >
          {transaction.description}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            color: colors.textSecondary,
            fontSize: typography.fontSizes.xs,
          }}
        >
          {caption}
        </Text>
      </View>

      <Text
        style={{
          color: amountColor,
          fontSize: typography.fontSizes.md,
          fontWeight: typography.fontWeights.semibold,
        }}
      >
        {formatCurrency(signedAmount, { signed: true })}
      </Text>
    </View>
  )

  if (!onPress) {
    return row
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(transaction)}
      style={({ pressed }) => pressed && styles.pressed}
    >
      {row}
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
