import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { Category, RecurringExpense } from '@/api/types'
import { Badge, CategoryIcon } from '@/components/ui'
import { useTheme } from '@/theme'
import { formatCurrency } from '@/utils'

interface RecurringExpenseListItemProps {
  expense: RecurringExpense
  category?: Category
  onPress?: (expense: RecurringExpense) => void
}

const UNKNOWN_CATEGORY_LABEL = 'Sin categoría'

/** One recurring expense: name, category, estimated amount and its fixed/variable badge. */
export function RecurringExpenseListItem({
  expense,
  category,
  onPress,
}: RecurringExpenseListItemProps) {
  const { colors, spacing, typography } = useTheme()

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Editar ${expense.name}`}
      onPress={onPress ? () => onPress(expense) : undefined}
      style={({ pressed }) => [
        styles.row,
        { gap: spacing.sm, paddingVertical: spacing.xs },
        pressed && styles.pressed,
      ]}
    >
      <CategoryIcon
        icon={category?.icon ?? 'wallet'}
        categoryId={category?.id}
        size={36}
      />

      <View style={styles.body}>
        <Text
          numberOfLines={1}
          style={{
            color: colors.text,
            fontSize: typography.fontSizes.md,
            fontWeight: typography.fontWeights.semibold,
          }}
        >
          {expense.name}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            color: colors.textSecondary,
            fontSize: typography.fontSizes.xs,
          }}
        >
          {`${category?.name ?? UNKNOWN_CATEGORY_LABEL} · Día ${expense.dayOfMonth}`}
        </Text>
      </View>

      <View style={[styles.trailing, { gap: spacing.xs / 2 }]}>
        <Text
          style={{
            color: colors.text,
            fontSize: typography.fontSizes.md,
            fontWeight: typography.fontWeights.semibold,
          }}
        >
          {formatCurrency(expense.estimatedAmount)}
        </Text>
        <Badge
          label={expense.isAmountFixed ? 'Fijo' : 'Variable'}
          tone={expense.isAmountFixed ? 'primary' : 'neutral'}
        />
      </View>
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
  trailing: {
    alignItems: 'flex-end',
  },
  pressed: {
    opacity: 0.6,
  },
})
