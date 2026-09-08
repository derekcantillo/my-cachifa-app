import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Card, CategoryIcon } from '@/components'
import { useLoans } from '@/hooks'
import { useTheme } from '@/theme'
import { formatCurrency } from '@/utils'

interface ActiveLoansCardProps {
  onPress: () => void
}

/**
 * Total still owed across every loan that isn't fully paid. Absent entirely
 * once nothing is outstanding — like "Pendientes este mes" in Gastos, there
 * is nothing worth telling the user about an all-caught-up state.
 */
export function ActiveLoansCard({ onPress }: ActiveLoansCardProps) {
  const { colors, spacing, typography } = useTheme()
  const loansQuery = useLoans()

  const activeLoans = (loansQuery.data ?? []).filter(
    loan => loan.status !== 'paid',
  )

  if (!loansQuery.isSuccess || activeLoans.length === 0) {
    return null
  }

  const totalRemaining = activeLoans.reduce(
    (sum, loan) => sum + loan.remainingAmount,
    0,
  )

  return (
    <Card onPress={onPress}>
      <View style={[styles.row, { gap: spacing.sm }]}>
        <CategoryIcon icon="loan" categoryId="LOAN" size={40} />

        <View style={styles.body}>
          <Text
            style={{
              color: colors.text,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.semibold,
            }}
          >
            Préstamos activos
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: typography.fontSizes.xs,
            }}
          >
            {activeLoans.length === 1
              ? '1 préstamo por cobrar'
              : `${activeLoans.length} préstamos por cobrar`}
          </Text>
        </View>

        <Text
          style={{
            color: colors.text,
            fontSize: typography.fontSizes.lg,
            fontWeight: typography.fontWeights.bold,
          }}
        >
          {formatCurrency(totalRemaining)}
        </Text>
      </View>
    </Card>
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
})
