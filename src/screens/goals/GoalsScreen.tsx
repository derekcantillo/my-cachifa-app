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
import type { Goal } from '@/api/types'
import {
  AppHeader,
  Card,
  EmptyState,
  GoalCard,
  SectionHeader,
  Skeleton,
  TargetIcon,
} from '@/components'
import { useTheme } from '@/theme'
import { formatCurrency } from '@/utils'
import { CreateGoalButton, SavingsProjectionCard } from './components'
import { useGoalsData } from './useGoalsData'

export function GoalsScreen() {
  const { colors, spacing, typography } = useTheme()
  const navigation = useNavigation()

  const {
    goals,
    totalSaved,
    totalTarget,
    projection,
    hasContributions,
    isLoading,
    isProjectionLoading,
    isError,
    refetch,
  } = useGoalsData()

  const isEmpty = !isLoading && !isError && goals.length === 0

  const openSettings = useCallback(() => {
    navigation.navigate('Settings')
  }, [navigation])

  const openGoal = useCallback(
    (goal: Goal) => {
      navigation.navigate('GoalDetail', { goalId: goal.id })
    },
    [navigation],
  )

  const openCreateGoal = useCallback(() => {
    navigation.navigate('CreateGoal')
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
          paddingBottom: spacing.xxl,
          gap: spacing.md,
        }}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refetch} />
        }
      >
        <View>
          <Text
            style={{
              color: colors.brand,
              fontSize: typography.fontSizes.xl,
              fontWeight: typography.fontWeights.bold,
            }}
          >
            Metas
          </Text>
          {!isLoading && goals.length > 0 && (
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typography.fontSizes.sm,
              }}
            >
              {`${formatCurrency(totalSaved)} ahorrados de ${formatCurrency(
                totalTarget,
              )}`}
            </Text>
          )}
        </View>

        <View style={{ gap: spacing.sm }}>
          <SectionHeader title="Mis Metas" />

          {isLoading ? (
            [0, 1, 2].map(row => (
              <Card key={row}>
                <View style={{ gap: spacing.sm }}>
                  <Skeleton height={16} width="60%" />
                  <Skeleton height={12} width="40%" />
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
                No pudimos cargar tus metas. Desliza hacia abajo para
                reintentar.
              </Text>
            </Card>
          ) : isEmpty ? (
            <Card>
              <EmptyState
                icon={<TargetIcon size={26} color={colors.textSecondary} />}
                title="Todavía no tienes metas"
                description="Una meta le pone nombre y fecha a tu ahorro. Crea la primera para empezar tu plan."
                actionLabel="Crear nueva meta"
                onAction={openCreateGoal}
              />
            </Card>
          ) : (
            goals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                variant="full"
                onPress={openGoal}
              />
            ))
          )}
        </View>

        {/* The empty state already carries the call to action. */}
        {!isEmpty && <CreateGoalButton onPress={openCreateGoal} />}

        <SavingsProjectionCard
          projection={projection}
          isLoading={isProjectionLoading}
          goalCount={goals.length}
          hasContributions={hasContributions}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
