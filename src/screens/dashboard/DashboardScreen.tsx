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
import { AppHeader, FAB } from '@/components'
import { useTheme } from '@/theme'
import { daysLeftInMonth } from '@/utils'
import {
  CurrentPlanCard,
  DashboardSkeleton,
  GoalsCarousel,
  GreetingHeader,
  MonthlyBudgetCard,
  RecentTransactionsCard,
  WeeklySummaryCard,
} from './components'
import { useDashboardData } from './useDashboardData'

export function DashboardScreen() {
  const { colors, spacing } = useTheme()
  const navigation = useNavigation()
  const {
    month,
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

  // The create-movement modal arrives in a later sub-block.
  const handleCreatePress = useCallback(() => {}, [])

  const openSettings = useCallback(() => {
    navigation.navigate('Settings')
  }, [navigation])

  const openGoals = useCallback(() => {
    navigation.navigate('Main', {
      screen: 'GoalsTab',
      params: { screen: 'Goals' },
    })
  }, [navigation])

  const openExpenses = useCallback(() => {
    navigation.navigate('Main', {
      screen: 'ExpensesTab',
      params: { screen: 'Expenses' },
    })
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

            <MonthlyBudgetCard
              month={month}
              limit={monthlyBudget.limit}
              spent={monthlyBudget.spent}
              remaining={monthlyBudget.remaining}
              percent={monthlyBudget.percent}
            />

            <WeeklySummaryCard
              expense={weekly.expense}
              saving={weekly.saving}
              available={monthlyBudget.remaining}
              percentUsed={monthlyBudget.percent}
              daysLeft={daysLeftInMonth(month)}
            />

            <CurrentPlanCard phase={currentPhase} />

            {/* Negative margins let the carousel bleed to the screen edges. */}
            <View style={{ marginHorizontal: -spacing.md }}>
              <GoalsCarousel
                goals={activeGoals}
                edgeInset={spacing.md}
                onSeeAllPress={openGoals}
              />
            </View>

            <RecentTransactionsCard
              transactions={recentTransactions}
              categoriesById={categoriesById}
              onSeeAllPress={openExpenses}
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
