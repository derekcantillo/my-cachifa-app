import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { Budget, Category } from '@/api/types'
import {
  getBudgetStatus,
  getBudgetStatusColor,
  toPercent,
  useTheme,
} from '@/theme'
import { formatCurrency } from '@/utils'
import { Card, CategoryIcon, ProgressBar } from '@/components/ui'

interface BudgetCategoryRowProps {
  budget: Budget
  /** Amount already spent in this budget's category and period. */
  spent: number
  category?: Category
  onPress?: (budget: Budget) => void
}

const UNKNOWN_CATEGORY_LABEL = 'Sin categoría'

/** One budget as its own card: category, share used, amounts and progress. */
export function BudgetCategoryRow({
  budget,
  spent,
  category,
  onPress,
}: BudgetCategoryRowProps) {
  const { colors, spacing, typography } = useTheme()

  const percent = toPercent(spent, budget.monthlyLimit)
  const statusColor = getBudgetStatusColor(percent, colors)
  const exceeded = getBudgetStatus(percent) === 'exceeded'

  return (
    <Card onPress={onPress ? () => onPress(budget) : undefined}>
      <View style={[styles.header, { gap: spacing.sm }]}>
        <CategoryIcon
          icon={category?.icon ?? 'wallet'}
          size={20}
          variant="plain"
        />

        <Text
          numberOfLines={1}
          style={[
            styles.name,
            {
              color: colors.text,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.semibold,
            },
          ]}
        >
          {category?.name ?? UNKNOWN_CATEGORY_LABEL}
        </Text>

        <Text
          style={{
            color: statusColor,
            fontSize: typography.fontSizes.sm,
            fontWeight: typography.fontWeights.semibold,
          }}
        >
          {`${Math.round(percent)}%`}
        </Text>
      </View>

      <View style={[styles.amounts, { marginTop: spacing.sm }]}>
        <Text
          numberOfLines={1}
          style={{
            color: exceeded ? statusColor : colors.text,
            fontSize: typography.fontSizes.xl,
            fontWeight: typography.fontWeights.bold,
          }}
        >
          {formatCurrency(spent)}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            color: colors.textSecondary,
            fontSize: typography.fontSizes.sm,
          }}
        >
          {` / ${formatCurrency(budget.monthlyLimit)}`}
        </Text>
      </View>

      <View style={{ marginTop: spacing.sm }}>
        <ProgressBar percent={percent} color={statusColor} height={10} />
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    flex: 1,
  },
  amounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
})
