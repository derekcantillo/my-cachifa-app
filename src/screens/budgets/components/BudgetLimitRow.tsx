import React, { useCallback, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { CategoryIcon, CurrencyField, PencilIcon } from '@/components'
import { useTheme } from '@/theme'
import { formatCurrency } from '@/utils'
import type { BudgetPlanRow } from '../useBudgetPlanner'

interface BudgetLimitRowProps {
  row: BudgetPlanRow
  onChange: (categoryId: string, limit: number) => void
  /** Opens straight into editing, used by a row the user just added. */
  autoEdit?: boolean
}

/**
 * One category with its monthly limit. The amount reads as plain text until the
 * row is tapped, which turns it into a currency field.
 */
export function BudgetLimitRow({
  row,
  onChange,
  autoEdit = false,
}: BudgetLimitRowProps) {
  const { colors, spacing, typography } = useTheme()
  const [editing, setEditing] = useState(autoEdit)

  const handleChange = useCallback(
    (limit: number) => {
      onChange(row.category.id, limit)
    },
    [onChange, row.category.id],
  )

  return (
    <View
      style={[styles.row, { gap: spacing.md, paddingVertical: spacing.sm }]}
    >
      <CategoryIcon
        icon={row.category.icon}
        categoryId={row.category.id}
        size={44}
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
          {row.category.name}
        </Text>
        {row.category.description ? (
          <Text
            numberOfLines={2}
            style={{
              color: colors.textSecondary,
              fontSize: typography.fontSizes.xs,
            }}
          >
            {row.category.description}
          </Text>
        ) : null}
      </View>

      {editing ? (
        <View style={styles.field}>
          <CurrencyField
            label={`Límite de ${row.category.name}`}
            value={row.limit}
            onChange={handleChange}
            autoFocus
          />
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Editar límite de ${row.category.name}`}
          onPress={() => setEditing(true)}
          style={({ pressed }) => [
            styles.amount,
            { gap: spacing.sm },
            pressed && styles.pressed,
          ]}
        >
          <Text
            style={{
              color: row.limit > 0 ? colors.text : colors.textSecondary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
            }}
          >
            {row.limit > 0 ? formatCurrency(row.limit) : 'Sin límite'}
          </Text>
          <PencilIcon size={18} color={colors.textSecondary} />
        </Pressable>
      )}
    </View>
  )
}

const FIELD_WIDTH = 150

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  body: {
    flex: 1,
  },
  amount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  field: {
    width: FIELD_WIDTH,
  },
  pressed: {
    opacity: 0.6,
  },
})
