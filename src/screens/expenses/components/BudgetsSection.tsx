import React from 'react'
import { Text, View } from 'react-native'
import {
  BudgetCategoryRow,
  Card,
  SectionHeader,
  Skeleton,
  SlidersIcon,
} from '@/components'
import { useTheme } from '@/theme'
import type { BudgetRow } from '../useExpensesData'

interface BudgetsSectionProps {
  rows: BudgetRow[]
  isLoading: boolean
  /** Opens the budget management modal for the period on screen. */
  onManagePress?: () => void
}

export function BudgetsSection({
  rows,
  isLoading,
  onManagePress,
}: BudgetsSectionProps) {
  const { colors, spacing, typography } = useTheme()

  return (
    <View style={{ gap: spacing.sm }}>
      <SectionHeader
        title="Presupuestos Activos"
        actionLabel={onManagePress ? 'Gestionar' : undefined}
        onActionPress={onManagePress}
        actionIcon={<SlidersIcon size={16} color={colors.primary} />}
      />

      {isLoading ? (
        [0, 1, 2].map(row => (
          <Card key={row}>
            <View style={{ gap: spacing.sm }}>
              <Skeleton height={16} width="55%" />
              <Skeleton height={24} width="70%" />
              <Skeleton height={10} radius={5} />
            </View>
          </Card>
        ))
      ) : rows.length === 0 ? (
        <Card>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: typography.fontSizes.sm,
            }}
          >
            No hay presupuestos definidos para este mes.
          </Text>
        </Card>
      ) : (
        rows.map(row => (
          <BudgetCategoryRow
            key={row.budget.id}
            budget={row.budget}
            spent={row.spent}
            category={row.category}
          />
        ))
      )}
    </View>
  )
}
