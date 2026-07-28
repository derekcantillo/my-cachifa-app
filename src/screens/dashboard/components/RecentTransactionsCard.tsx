import React from 'react'
import { Text, View } from 'react-native'
import type { Category, Transaction } from '@/api/types'
import {
  Card,
  SectionHeader,
  Separator,
  TransactionListItem,
} from '@/components'
import { useTheme } from '@/theme'

interface RecentTransactionsCardProps {
  transactions: Transaction[]
  categoriesById: Record<string, Category>
  onSeeAllPress?: () => void
}

export function RecentTransactionsCard({
  transactions,
  categoriesById,
  onSeeAllPress,
}: RecentTransactionsCardProps) {
  const { colors, spacing, typography } = useTheme()

  return (
    <View style={{ gap: spacing.sm }}>
      <SectionHeader
        title="Transacciones Recientes"
        actionLabel={transactions.length > 0 ? 'Ver historial' : undefined}
        onActionPress={onSeeAllPress}
      />

      <Card>
        {transactions.length === 0 ? (
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: typography.fontSizes.sm,
            }}
          >
            No hay movimientos registrados este mes.
          </Text>
        ) : (
          transactions.map((transaction, index) => (
            <View key={transaction.id}>
              {index > 0 && <Separator />}
              <TransactionListItem
                transaction={transaction}
                category={categoriesById[transaction.categoryId]}
                subtitle="time"
              />
            </View>
          ))
        )}
      </Card>
    </View>
  )
}
