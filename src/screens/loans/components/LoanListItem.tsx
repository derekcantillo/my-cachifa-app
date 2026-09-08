import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { Loan, LoanStatus } from '@/api/types'
import { Badge, CategoryIcon, ProgressBar, type BadgeTone } from '@/components'
import { useTheme } from '@/theme'
import { formatCurrency } from '@/utils'

interface LoanListItemProps {
  loan: Loan
  onPress?: (loan: Loan) => void
}

const STATUS_LABELS: Record<LoanStatus, string> = {
  active: 'Activo',
  partially_paid: 'Parcial',
  paid: 'Pagado',
}

const STATUS_TONES: Record<LoanStatus, BadgeTone> = {
  active: 'neutral',
  partially_paid: 'warning',
  paid: 'positive',
}

/** One loan: borrower, how much is left of how much, recovery progress and its status badge. */
export function LoanListItem({ loan, onPress }: LoanListItemProps) {
  const { colors, spacing, typography } = useTheme()
  const recoveredPercent =
    loan.amount > 0 ? (loan.amountRepaid / loan.amount) * 100 : 0

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver préstamo a ${loan.borrowerName}`}
      onPress={onPress ? () => onPress(loan) : undefined}
      style={({ pressed }) => [
        styles.row,
        { gap: spacing.sm, paddingVertical: spacing.xs },
        pressed && styles.pressed,
      ]}
    >
      <CategoryIcon icon="loan" categoryId="LOAN" size={36} />

      <View style={styles.body}>
        <View style={[styles.heading, { gap: spacing.xs }]}>
          <Text
            numberOfLines={1}
            style={{
              color: colors.text,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.semibold,
            }}
          >
            {loan.borrowerName}
          </Text>
          <Badge label={STATUS_LABELS[loan.status]} tone={STATUS_TONES[loan.status]} />
        </View>

        <Text
          style={{
            color: colors.textSecondary,
            fontSize: typography.fontSizes.xs,
            marginBottom: spacing.xs,
          }}
        >
          {`${formatCurrency(loan.remainingAmount)} de ${formatCurrency(loan.amount)} pendiente`}
        </Text>

        <ProgressBar
          percent={recoveredPercent}
          color={loan.status === 'paid' ? colors.positive : colors.primary}
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
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  pressed: {
    opacity: 0.6,
  },
})
