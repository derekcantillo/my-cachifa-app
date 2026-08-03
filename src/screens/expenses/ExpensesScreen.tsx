import React, { useCallback, useState } from 'react'
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { Transaction } from '@/api/types'
import {
  AppHeader,
  Card,
  EmptyState,
  FAB,
  FilterIcon,
  MonthSelector,
  SectionHeader,
  SegmentedControl,
  Separator,
  Skeleton,
  TransactionListItem,
  WalletIcon,
  type SegmentedControlOption,
} from '@/components'
import { useTheme } from '@/theme'
import { getCurrentMonthKey, type MonthKey } from '@/utils'
import { BudgetsSection, CategoryFilterChips } from './components'
import { useExpensesData, type KindFilter } from './useExpensesData'

const KIND_OPTIONS: ReadonlyArray<SegmentedControlOption<KindFilter>> = [
  { value: 'all', label: 'Todos' },
  { value: 'expense', label: 'Gastos' },
  { value: 'income', label: 'Ingresos' },
  { value: 'saving', label: 'Ahorro' },
]

export function ExpensesScreen() {
  const { colors, spacing, typography } = useTheme()
  const navigation = useNavigation()

  const [month, setMonth] = useState<MonthKey>(getCurrentMonthKey)
  const [kind, setKind] = useState<KindFilter>('all')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const {
    budgetRows,
    transactions,
    categoriesById,
    filterableCategories,
    hasMonthMovements,
    isBudgetsLoading,
    isTransactionsLoading,
    isBudgetsError,
    isTransactionsError,
    refetch,
  } = useExpensesData({ month, kind, categoryId })

  // A category only belongs to one kind, so narrowing the kind clears it.
  const handleKindChange = useCallback((next: KindFilter) => {
    setKind(next)
    setCategoryId(null)
  }, [])

  const clearFilters = useCallback(() => {
    setKind('all')
    setCategoryId(null)
  }, [])

  const toggleFilters = useCallback(() => {
    setFiltersOpen(open => !open)
  }, [])

  const handleCreatePress = useCallback(() => {
    navigation.navigate('RegisterTransaction')
  }, [navigation])

  const openTransaction = useCallback(
    (transaction: Transaction) => {
      navigation.navigate('TransactionDetail', {
        transactionId: transaction.id,
      })
    },
    [navigation],
  )

  const openBudgetManagement = useCallback(() => {
    navigation.navigate('BudgetManagement', { month })
  }, [month, navigation])

  const openSettings = useCallback(() => {
    navigation.navigate('Settings')
  }, [navigation])

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <AppHeader onProfilePress={openSettings} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingTop: spacing.sm,
          paddingBottom: spacing.xxl * 2,
          gap: spacing.md,
        }}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refetch} />
        }
      >
        <Text
          style={{
            color: colors.brand,
            fontSize: typography.fontSizes.xl,
            fontWeight: typography.fontWeights.bold,
          }}
        >
          Gastos
        </Text>

        <MonthSelector
          value={month}
          onChange={setMonth}
          maxMonth={getCurrentMonthKey()}
        />

        <BudgetsSection
          rows={budgetRows}
          isLoading={isBudgetsLoading}
          isError={isBudgetsError}
          onManagePress={openBudgetManagement}
        />

        <View style={{ gap: spacing.sm }}>
          <SectionHeader
            title="Movimientos"
            actionLabel="Filtrar"
            onActionPress={toggleFilters}
            actionIcon={<FilterIcon size={16} color={colors.primary} />}
          />

          {filtersOpen && (
            <View style={{ gap: spacing.sm }}>
              <SegmentedControl
                options={KIND_OPTIONS}
                value={kind}
                onChange={handleKindChange}
              />
              <CategoryFilterChips
                categories={filterableCategories}
                value={categoryId}
                onChange={setCategoryId}
              />
            </View>
          )}

          <Card>
            {isTransactionsLoading ? (
              <View style={{ gap: spacing.md }}>
                {[0, 1, 2, 3].map(row => (
                  <View key={row} style={styles.skeletonRow}>
                    <Skeleton width={40} height={40} radius={20} />
                    <View
                      style={[
                        styles.skeletonBody,
                        { marginLeft: spacing.md, gap: spacing.xs },
                      ]}
                    >
                      <Skeleton height={14} width="70%" />
                      <Skeleton height={12} width="45%" />
                    </View>
                  </View>
                ))}
              </View>
            ) : isTransactionsError ? (
              <Text
                style={[
                  styles.emptyText,
                  {
                    color: colors.negative,
                    fontSize: typography.fontSizes.sm,
                    paddingVertical: spacing.sm,
                  },
                ]}
              >
                No pudimos cargar tus movimientos. Desliza hacia abajo para
                reintentar.
              </Text>
            ) : transactions.length === 0 ? (
              // An empty month and a filter that excludes everything both land
              // here with nothing to list, but only one of them is the user's
              // doing — and each calls for a different way out.
              hasMonthMovements ? (
                <EmptyState
                  icon={<FilterIcon size={26} color={colors.textSecondary} />}
                  title="Ningún movimiento coincide"
                  description="Este mes sí tiene movimientos, pero ninguno pasa el filtro actual."
                  actionLabel="Quitar filtros"
                  onAction={clearFilters}
                />
              ) : (
                <EmptyState
                  icon={<WalletIcon size={26} color={colors.textSecondary} />}
                  title="Sin movimientos este mes"
                  description="Registra un gasto, un ingreso o un ahorro y aparecerá en esta lista."
                  actionLabel="Registrar movimiento"
                  onAction={handleCreatePress}
                />
              )
            ) : (
              transactions.map((transaction, index) => (
                <View key={transaction.id}>
                  {index > 0 && <Separator />}
                  <TransactionListItem
                    transaction={transaction}
                    category={categoriesById[transaction.categoryId]}
                    onPress={openTransaction}
                  />
                </View>
              ))
            )}
          </Card>
        </View>
      </ScrollView>

      <FAB
        accessibilityLabel="Agregar movimiento"
        onPress={handleCreatePress}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonBody: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
  },
})
