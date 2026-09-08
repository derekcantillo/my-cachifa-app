import React, { useCallback } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { Category, RecurringExpense } from '@/api/types'
import { Card, CategoryIcon, SectionHeader, Separator } from '@/components'
import { usePendingRecurringExpenses } from '@/hooks'
import { useTheme } from '@/theme'
import { formatCurrency, type MonthKey } from '@/utils'

interface PendingRecurringExpensesSectionProps {
  month: MonthKey
  categoriesById: Record<string, Category>
}

/**
 * Active recurring expenses with no movement registered for `month` yet.
 * Absent entirely once nothing is pending — no space, no empty state — since
 * an all-caught-up month has nothing here worth telling the user about.
 */
export function PendingRecurringExpensesSection({
  month,
  categoriesById,
}: PendingRecurringExpensesSectionProps) {
  const { spacing } = useTheme()
  const navigation = useNavigation()
  const pendingQuery = usePendingRecurringExpenses(month)

  const openRegister = useCallback(
    (expense: RecurringExpense) => {
      navigation.navigate('RegisterTransaction', {
        category: expense.categoryId,
        amount: expense.estimatedAmount,
        recurringExpenseId: expense.id,
      })
    },
    [navigation],
  )

  const pending = pendingQuery.data ?? []
  if (!pendingQuery.isSuccess || pending.length === 0) {
    return null
  }

  return (
    <View style={{ gap: spacing.sm }}>
      <SectionHeader title="Pendientes este mes" />

      <Card>
        {pending.map((expense, index) => (
          <View key={expense.id}>
            {index > 0 && <Separator />}
            <PendingRow
              expense={expense}
              category={categoriesById[expense.categoryId]}
              onRegister={openRegister}
            />
          </View>
        ))}
      </Card>
    </View>
  )
}

interface PendingRowProps {
  expense: RecurringExpense
  category?: Category
  onRegister: (expense: RecurringExpense) => void
}

function PendingRow({ expense, category, onRegister }: PendingRowProps) {
  const { colors, spacing, typography } = useTheme()

  return (
    <View style={[styles.row, { gap: spacing.sm, paddingVertical: spacing.xs }]}>
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
          {formatCurrency(expense.estimatedAmount)}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Registrar ${expense.name}`}
        onPress={() => onRegister(expense)}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: colors.primary,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
          },
          pressed && styles.pressed,
        ]}
      >
        <Text
          style={{
            color: colors.brandText,
            fontSize: typography.fontSizes.sm,
            fontWeight: typography.fontWeights.semibold,
          }}
        >
          Registrar
        </Text>
      </Pressable>
    </View>
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
  button: {
    borderRadius: 999,
  },
  pressed: {
    opacity: 0.6,
  },
})
