import React, { useCallback } from 'react'
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { Goal, Transaction } from '@/api/types'
import { AppHeader, FAB } from '@/components'
import { useUnreadAlertsCount } from '@/hooks'
import { useTheme } from '@/theme'
import { daysLeftInMonth } from '@/utils'
import {
  ActiveLoansCard,
  CurrentPlanCard,
  DashboardSkeleton,
  GoalsCarousel,
  GreetingHeader,
  MonthlyBudgetCard,
  RecentTransactionsCard,
  TotalBalanceCard,
  WeeklySummaryCard,
} from './components'
import { useDashboardData } from './useDashboardData'

export function DashboardScreen() {
  const { colors, spacing } = useTheme()
  const navigation = useNavigation()
  const {
    month,
    periodId,
    isLoading,
    isError,
    monthlyBudget,
    weekly,
    currentPhase,
    activeGoals,
    recentTransactions,
    categoriesById,
    refetch,
  } = useDashboardData()
  const unreadAlertsCountQuery = useUnreadAlertsCount()

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

  const openSettings = useCallback(() => {
    navigation.navigate('Settings')
  }, [navigation])

  const openGoals = useCallback(() => {
    navigation.navigate('Main', {
      screen: 'GoalsTab',
      params: { screen: 'Goals' },
    })
  }, [navigation])

  const openGoal = useCallback(
    (goal: Goal) => {
      navigation.navigate('GoalDetail', { goalId: goal.id })
    },
    [navigation],
  )

  const openExpenses = useCallback(() => {
    navigation.navigate('Main', {
      screen: 'ExpensesTab',
      params: { screen: 'Expenses' },
    })
  }, [navigation])

  const openBudgetManagement = useCallback(() => {
    if (periodId !== undefined) {
      navigation.navigate('BudgetManagement', { periodId })
    }
  }, [navigation, periodId])

  const openAlerts = useCallback(() => {
    navigation.navigate('Alerts')
  }, [navigation])

  const openLoans = useCallback(() => {
    navigation.navigate('Loans')
  }, [navigation])

  const openNetWorth = useCallback(() => {
    navigation.navigate('NetWorth')
  }, [navigation])

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <AppHeader
        onProfilePress={openSettings}
        onSettingsPress={openSettings}
        onNotificationsPress={openAlerts}
        unreadAlertsCount={unreadAlertsCountQuery.data ?? 0}
      />

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
        {isLoading ? (
          <DashboardSkeleton />
        ) : isError ? (
          <Text style={{ color: colors.negative, paddingVertical: spacing.lg }}>
            No pudimos cargar tu información. Desliza hacia abajo para
            reintentar.
          </Text>
        ) : (
          <>
            <GreetingHeader />

            <TotalBalanceCard onNetWorthPress={openNetWorth} />

            <MonthlyBudgetCard
              month={month}
              limit={monthlyBudget.limit}
              spent={monthlyBudget.spent}
              remaining={monthlyBudget.remaining}
              percent={monthlyBudget.percent}
              onManagePress={openBudgetManagement}
            />

            <WeeklySummaryCard
              expense={weekly.expense}
              saving={weekly.saving}
              available={monthlyBudget.remaining}
              percentUsed={monthlyBudget.percent}
              daysLeft={daysLeftInMonth(month)}
              hasBudget={monthlyBudget.limit > 0}
            />

            <ActiveLoansCard onPress={openLoans} />

            <CurrentPlanCard phase={currentPhase} />

            {/* Negative margins let the carousel bleed to the screen edges. */}
            <View style={{ marginHorizontal: -spacing.md }}>
              <GoalsCarousel
                goals={activeGoals}
                edgeInset={spacing.md}
                onSeeAllPress={openGoals}
                onGoalPress={openGoal}
                onCreatePress={openGoals}
              />
            </View>

            <RecentTransactionsCard
              transactions={recentTransactions}
              categoriesById={categoriesById}
              onSeeAllPress={openExpenses}
              onTransactionPress={openTransaction}
              onCreatePress={handleCreatePress}
            />
          </>
        )}
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
})
