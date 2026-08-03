import React from 'react'
import { View } from 'react-native'
import type { Category, Transaction } from '@/api/types'
import {
  Card,
  EmptyState,
  SectionHeader,
  Separator,
  TransactionListItem,
  WalletIcon,
} from '@/components'
import { useTheme } from '@/theme'

interface RecentTransactionsCardProps {
  transactions: Transaction[]
  categoriesById: Record<string, Category>
  onSeeAllPress?: () => void
  onTransactionPress?: (transaction: Transaction) => void
  /** Opens the register form from the empty state. */
  onCreatePress: () => void
}

export function RecentTransactionsCard({
  transactions,
  categoriesById,
  onSeeAllPress,
  onTransactionPress,
  onCreatePress,
}: RecentTransactionsCardProps) {
  const { colors, spacing } = useTheme()

  return (
    <View style={{ gap: spacing.sm }}>
      <SectionHeader
        title="Transacciones Recientes"
        actionLabel={transactions.length > 0 ? 'Ver historial' : undefined}
        onActionPress={onSeeAllPress}
      />

      <Card>
        {transactions.length === 0 ? (
          <EmptyState
            icon={<WalletIcon size={26} color={colors.textSecondary} />}
            title="Sin movimientos este mes"
            description="Registra tu primer gasto o ingreso y aparecerá aquí."
            actionLabel="Registrar movimiento"
            onAction={onCreatePress}
          />
        ) : (
          transactions.map((transaction, index) => (
            <View key={transaction.id}>
              {index > 0 && <Separator />}
              <TransactionListItem
                transaction={transaction}
                category={categoriesById[transaction.categoryId]}
                subtitle="time"
                onPress={onTransactionPress}
              />
            </View>
          ))
        )}
      </Card>
    </View>
  )
}
