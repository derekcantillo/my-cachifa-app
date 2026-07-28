import React, { useCallback } from 'react'
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import {
  useNavigation,
  type CompositeNavigationProp,
} from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { Goal } from '@/api/types'
import {
  AppHeader,
  Card,
  GoalCard,
  SectionHeader,
  Skeleton,
} from '@/components'
import type {
  GoalsStackParamList,
  RootStackParamList,
} from '@/navigation/types'
import { useTheme } from '@/theme'
import { formatCurrency } from '@/utils'
import { CreateGoalButton, SavingsProjectionCard } from './components'
import { useGoalsData } from './useGoalsData'

// The screen pushes onto its own stack (goal detail, create goal) and reaches
// Settings at the root, so it needs both navigators' types.
type GoalsNavigation = CompositeNavigationProp<
  NativeStackNavigationProp<GoalsStackParamList, 'Goals'>,
  NativeStackNavigationProp<RootStackParamList>
>

export function GoalsScreen() {
  const { colors, spacing, typography } = useTheme()
  const navigation = useNavigation<GoalsNavigation>()

  const {
    goals,
    totalSaved,
    totalTarget,
    projection,
    isLoading,
    isProjectionLoading,
    isError,
    refetch,
  } = useGoalsData()

  const openSettings = useCallback(() => {
    navigation.navigate('Settings')
  }, [navigation])

  // Goal detail and creation are modals in sub-block 4c; both routes are
  // placeholder screens for now.
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
          ) : goals.length === 0 ? (
            <Card>
              <Text
                style={{
                  color: isError ? colors.negative : colors.textSecondary,
                  fontSize: typography.fontSizes.sm,
                }}
              >
                {isError
                  ? 'No pudimos cargar tus metas. Desliza hacia abajo para reintentar.'
                  : 'Todavía no tienes metas. Crea la primera para empezar tu plan.'}
              </Text>
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

        <CreateGoalButton onPress={openCreateGoal} />

        <SavingsProjectionCard
          projection={projection}
          isLoading={isProjectionLoading}
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
