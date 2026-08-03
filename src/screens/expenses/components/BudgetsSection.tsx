import React from 'react'
import { Text, View } from 'react-native'
import {
  BudgetCategoryRow,
  Card,
  EmptyState,
  SectionHeader,
  Skeleton,
  SlidersIcon,
} from '@/components'
import { useTheme } from '@/theme'
import type { BudgetRow } from '../useExpensesData'

interface BudgetsSectionProps {
  rows: BudgetRow[]
  isLoading: boolean
  /** Set when the budgets could not be loaded at all. */
  isError?: boolean
  /** Opens the budget management modal for the period on screen. */
  onManagePress: () => void
}

/**
 * The month's limits. Loading, empty and loaded are three separate states —
 * a month with no budget is not the same as a month still loading, and neither
 * is a month whose request failed.
 */
export function BudgetsSection({
  rows,
  isLoading,
  isError = false,
  onManagePress,
}: BudgetsSectionProps) {
  const { colors, spacing, typography } = useTheme()

  return (
    <View style={{ gap: spacing.sm }}>
      <SectionHeader
        title="Presupuestos Activos"
        actionLabel={rows.length > 0 ? 'Gestionar' : undefined}
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
      ) : isError ? (
        <Card>
          <Text
            style={{
              color: colors.negative,
              fontSize: typography.fontSizes.sm,
            }}
          >
            No pudimos cargar tus presupuestos. Desliza hacia abajo para
            reintentar.
          </Text>
        </Card>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={<SlidersIcon size={26} color={colors.textSecondary} />}
            title="Sin presupuestos este mes"
            description="Asigna un límite por categoría para seguir cuánto te queda."
            actionLabel="Definir presupuesto"
            onAction={onManagePress}
          />
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
