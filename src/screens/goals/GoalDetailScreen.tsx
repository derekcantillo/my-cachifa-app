import React, { useCallback, useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native'
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { Goal } from '@/api/types'
import {
  Badge,
  Button,
  Card,
  CurrencyField,
  ErrorNotice,
  getGoalProgress,
  ModalHeader,
  PauseIcon,
  PencilIcon,
  PlayIcon,
  ProgressRing,
  SectionHeader,
  Separator,
  Skeleton,
  TrashIcon,
  formatMonthsRemaining,
} from '@/components'
import {
  useAddGoalContribution,
  useDeleteGoal,
  useGoal,
  useUpdateGoal,
} from '@/hooks'
import type { RootStackParamList } from '@/navigation/types'
import { useTheme } from '@/theme'
import {
  formatCurrency,
  formatFullDate,
  formatRelativeTime,
  monthlySavingNeeded,
} from '@/utils'

type GoalDetailRoute = RouteProp<RootStackParamList, 'GoalDetail'>
type GoalDetailNavigation = NativeStackNavigationProp<
  RootStackParamList,
  'GoalDetail'
>

export function GoalDetailScreen() {
  const { colors, spacing, typography } = useTheme()
  const navigation = useNavigation<GoalDetailNavigation>()
  const route = useRoute<GoalDetailRoute>()

  const { goalId } = route.params
  const goalQuery = useGoal(goalId)
  const goal = goalQuery.data

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ModalHeader title="Detalle de la meta" onClose={navigation.goBack} />

      <ScrollView
        contentContainerStyle={{
          padding: spacing.md,
          paddingBottom: spacing.xxl,
          gap: spacing.md,
        }}
      >
        {goalQuery.isPending ? (
          <Card>
            <View style={[styles.ring, { gap: spacing.md }]}>
              <Skeleton height={180} width={180} radius={90} />
              <Skeleton height={16} width="60%" />
            </View>
          </Card>
        ) : !goal ? (
          <Card>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typography.fontSizes.sm,
              }}
            >
              Esta meta ya no existe.
            </Text>
          </Card>
        ) : (
          <GoalDetail goal={goal} />
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

interface GoalDetailProps {
  goal: Goal
}

function GoalDetail({ goal }: GoalDetailProps) {
  const { colors, spacing, typography } = useTheme()
  const navigation = useNavigation<GoalDetailNavigation>()

  const [contribution, setContribution] = useState(0)

  const addContribution = useAddGoalContribution()
  const updateGoal = useUpdateGoal()
  const deleteGoal = useDeleteGoal()

  const progress = getGoalProgress(goal)
  const monthsLabel = formatMonthsRemaining(progress.monthsRemaining)
  const perMonth = monthlySavingNeeded(
    progress.remainingAmount,
    goal.targetDate,
  )
  const paused = goal.status === 'paused'

  const handleContribute = useCallback(() => {
    if (contribution <= 0) {
      return
    }

    addContribution.mutate(
      { goalId: goal.id, amount: contribution },
      { onSuccess: () => setContribution(0) },
    )
  }, [addContribution, contribution, goal.id])

  const handleTogglePause = useCallback(() => {
    updateGoal.mutate({
      id: goal.id,
      input: { status: paused ? 'active' : 'paused' },
    })
  }, [goal.id, paused, updateGoal])

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Eliminar meta',
      `¿Seguro que quieres eliminar "${goal.name}"? Se perderá su historial de aportes.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteGoal.mutate(goal.id, { onSuccess: navigation.goBack })
          },
        },
      ],
    )
  }, [deleteGoal, goal.id, goal.name, navigation])

  const busy = updateGoal.isPending || deleteGoal.isPending
  const actionError = updateGoal.error ?? deleteGoal.error

  return (
    <>
      <Card>
        <View style={styles.ring}>
          <ProgressRing
            percent={progress.percent}
            label={`${progress.displayPercent}%`}
            caption={`${formatCurrency(goal.currentAmount)} de ${formatCurrency(
              goal.targetAmount,
            )}`}
            color={progress.completed ? colors.positive : colors.primary}
          />

          <Text
            style={[
              styles.goalName,
              {
                color: colors.text,
                fontSize: typography.fontSizes.lg,
                fontWeight: typography.fontWeights.bold,
                marginTop: spacing.md,
              },
            ]}
          >
            {goal.name}
          </Text>

          <View
            style={[styles.badges, { gap: spacing.xs, marginTop: spacing.sm }]}
          >
            <Badge label={progress.phaseLabel} tone="neutral" />
            <Badge label={progress.statusLabel} tone={progress.statusTone} />
          </View>
        </View>
      </Card>

      <Card title="Tu ritmo de ahorro">
        <Text
          style={{
            color: colors.text,
            fontSize: typography.fontSizes.md,
          }}
        >
          {perMonth === null
            ? `Te faltan ${formatCurrency(
                progress.remainingAmount,
              )}. Ponle una fecha objetivo para calcular cuánto ahorrar al mes.`
            : perMonth === 0
            ? '¡Meta cumplida! Ya alcanzaste el monto objetivo.'
            : `Ahorra ${formatCurrency(
                perMonth,
              )} al mes para lograrla a tiempo.`}
        </Text>

        {goal.targetDate ? (
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: typography.fontSizes.sm,
              marginTop: spacing.xs,
            }}
          >
            {`Fecha objetivo: ${formatFullDate(new Date(goal.targetDate))}${
              monthsLabel ? ` · ${monthsLabel}` : ''
            }`}
          </Text>
        ) : null}
      </Card>

      <Card title="Actualizar monto">
        <CurrencyField
          label="Nuevo aporte"
          value={contribution}
          onChange={setContribution}
          hint="Se suma a lo que llevas ahorrado."
        />

        <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
          <ErrorNotice error={addContribution.error} />
          <Button
            label="Registrar aporte"
            onPress={handleContribute}
            loading={addContribution.isPending}
            disabled={contribution <= 0}
          />
        </View>
      </Card>

      <View style={{ gap: spacing.sm }}>
        <SectionHeader title="Historial de aportes" />

        <Card>
          {goal.contributions.length === 0 ? (
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typography.fontSizes.sm,
              }}
            >
              Todavía no registras aportes para esta meta.
            </Text>
          ) : (
            goal.contributions.map((entry, index) => (
              <View key={entry.id}>
                {index > 0 && <Separator />}
                <View style={[styles.row, { paddingVertical: spacing.sm }]}>
                  <View style={styles.rowBody}>
                    <Text
                      style={{
                        color: colors.text,
                        fontSize: typography.fontSizes.sm,
                        fontWeight: typography.fontWeights.medium,
                      }}
                    >
                      {entry.note ?? 'Aporte'}
                    </Text>
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontSize: typography.fontSizes.xs,
                      }}
                    >
                      {formatRelativeTime(entry.date)}
                    </Text>
                  </View>

                  <Text
                    style={{
                      color: colors.positive,
                      fontSize: typography.fontSizes.sm,
                      fontWeight: typography.fontWeights.semibold,
                    }}
                  >
                    {formatCurrency(entry.amount, { signed: true })}
                  </Text>
                </View>
              </View>
            ))
          )}
        </Card>
      </View>

      <ErrorNotice error={actionError} />

      <View style={{ gap: spacing.sm }}>
        <Button
          label="Editar meta"
          onPress={() => navigation.replace('CreateGoal', { goalId: goal.id })}
          icon={<PencilIcon size={18} color={colors.brandText} />}
          disabled={busy}
        />
        <Button
          label={paused ? 'Reanudar meta' : 'Pausar meta'}
          variant="secondary"
          onPress={handleTogglePause}
          loading={updateGoal.isPending}
          icon={
            paused ? (
              <PlayIcon size={18} color={colors.text} />
            ) : (
              <PauseIcon size={18} color={colors.text} />
            )
          }
        />
        <Button
          label="Eliminar meta"
          variant="danger"
          onPress={handleDelete}
          loading={deleteGoal.isPending}
          icon={<TrashIcon size={18} color={colors.negative} />}
        />
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  ring: {
    alignItems: 'center',
  },
  goalName: {
    textAlign: 'center',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowBody: {
    flex: 1,
  },
})
