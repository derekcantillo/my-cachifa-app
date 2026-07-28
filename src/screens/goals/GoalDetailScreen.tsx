import React, { useCallback, useState } from 'react'
import { Alert, StyleSheet, Text, View } from 'react-native'
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { Goal } from '@/api/types'
import {
  Badge,
  Button,
  CalendarIcon,
  Card,
  CurrencyField,
  ErrorNotice,
  InfoCallout,
  LightbulbIcon,
  ModalHeaderAction,
  ModalScreen,
  PauseIcon,
  PencilIcon,
  PlayIcon,
  PlusIcon,
  ProgressRing,
  Separator,
  Skeleton,
  TrashIcon,
  UserIcon,
  formatMonthsRemaining,
  getGoalProgress,
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
  formatRelativeTime,
  formatShortDate,
  monthlySavingNeeded,
  withAlpha,
} from '@/utils'

type GoalDetailRoute = RouteProp<RootStackParamList, 'GoalDetail'>
type GoalDetailNavigation = NativeStackNavigationProp<
  RootStackParamList,
  'GoalDetail'
>

const RING_SIZE = 200
const CONTRIBUTION_ICON = '🐷'

export function GoalDetailScreen() {
  const { colors, spacing, typography } = useTheme()
  const navigation = useNavigation<GoalDetailNavigation>()
  const route = useRoute<GoalDetailRoute>()

  const { goalId } = route.params
  const goalQuery = useGoal(goalId)
  const goal = goalQuery.data

  return (
    <ModalScreen
      title="Cachifa"
      onClose={navigation.goBack}
      brandTitle
      headerActions={
        <ModalHeaderAction
          accessibilityLabel="Abrir ajustes"
          onPress={() => navigation.navigate('Settings')}
        >
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: colors.surfaceMuted,
                borderColor: colors.border,
              },
            ]}
          >
            <UserIcon size={18} color={colors.textSecondary} />
          </View>
        </ModalHeaderAction>
      }
    >
      {goalQuery.isPending ? (
        <Card>
          <View style={[styles.centered, { gap: spacing.md }]}>
            <Skeleton
              height={RING_SIZE}
              width={RING_SIZE}
              radius={RING_SIZE / 2}
            />
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
    </ModalScreen>
  )
}

interface GoalDetailProps {
  goal: Goal
}

function GoalDetail({ goal }: GoalDetailProps) {
  const { colors, spacing, typography } = useTheme()
  const navigation = useNavigation<GoalDetailNavigation>()

  const [contribution, setContribution] = useState(0)
  const [composerOpen, setComposerOpen] = useState(false)

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
      {
        onSuccess: () => {
          setContribution(0)
          setComposerOpen(false)
        },
      },
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

  return (
    <>
      <View style={[styles.heading, { gap: spacing.sm }]}>
        <Text
          style={{
            color: colors.text,
            fontSize: typography.fontSizes.xl,
            fontWeight: typography.fontWeights.bold,
          }}
        >
          {goal.name}
        </Text>
        <Badge label={progress.statusLabel} tone={progress.statusTone} />
      </View>

      <Text
        style={{
          color: colors.textSecondary,
          fontSize: typography.fontSizes.sm,
          marginTop: -spacing.sm,
        }}
      >
        {progress.phaseLabel}
      </Text>

      <Card>
        <View style={styles.centered}>
          <ProgressRing
            percent={progress.percent}
            size={RING_SIZE}
            label={`${progress.displayPercent}%`}
            caption="Completado"
            color={progress.completed ? colors.positive : colors.primary}
          />
        </View>

        <View style={[styles.amounts, { marginTop: spacing.lg }]}>
          <View>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typography.fontSizes.sm,
              }}
            >
              Ahorrado
            </Text>
            <Text
              style={{
                color: colors.text,
                fontSize: typography.fontSizes.lg,
                fontWeight: typography.fontWeights.bold,
              }}
            >
              {formatCurrency(goal.currentAmount)}
            </Text>
          </View>

          <View style={styles.amountRight}>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typography.fontSizes.sm,
              }}
            >
              Objetivo
            </Text>
            <Text
              style={{
                color: colors.text,
                fontSize: typography.fontSizes.lg,
                fontWeight: typography.fontWeights.bold,
              }}
            >
              {formatCurrency(goal.targetAmount)}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: spacing.md }}>
          <Separator />
        </View>

        <View style={{ marginTop: spacing.md }}>
          <InfoCallout
            title="Consejo"
            icon={<LightbulbIcon size={20} color={colors.primary} />}
          >
            <Text
              style={{
                color: colors.text,
                fontSize: typography.fontSizes.sm,
              }}
            >
              {perMonth === null
                ? `Te faltan ${formatCurrency(
                    progress.remainingAmount,
                  )}. Ponle una fecha objetivo para calcular cuánto ahorrar al mes.`
                : perMonth === 0
                ? '¡Meta cumplida! Ya alcanzaste el monto objetivo.'
                : `Necesitas ahorrar ${formatCurrency(
                    perMonth,
                  )}/mes para lograrlo.`}
            </Text>
          </InfoCallout>
        </View>
      </Card>

      <Card>
        <View style={[styles.cardHeading, { gap: spacing.sm }]}>
          <View
            style={[
              styles.cardIcon,
              { backgroundColor: withAlpha(colors.primary, 0.12) },
            ]}
          >
            <CalendarIcon size={20} color={colors.primary} />
          </View>
          <Text
            style={{
              color: colors.text,
              fontSize: typography.fontSizes.lg,
              fontWeight: typography.fontWeights.semibold,
            }}
          >
            Fecha Límite
          </Text>
        </View>

        <Text
          style={{
            color: colors.text,
            fontSize: typography.fontSizes.xl,
            fontWeight: typography.fontWeights.bold,
            marginTop: spacing.md,
          }}
        >
          {goal.targetDate
            ? formatShortDate(new Date(goal.targetDate))
            : 'Sin fecha objetivo'}
        </Text>

        {monthsLabel ? (
          <Text
            style={{
              color: colors.positive,
              fontSize: typography.fontSizes.sm,
              fontWeight: typography.fontWeights.medium,
            }}
          >
            {monthsLabel}
          </Text>
        ) : null}

        <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
          {composerOpen && (
            <CurrencyField
              label="Nuevo aporte"
              value={contribution}
              onChange={setContribution}
              autoFocus
              hint="Se suma a lo que llevas ahorrado."
            />
          )}

          <ErrorNotice error={addContribution.error} />

          <Button
            label={composerOpen ? 'Guardar aporte' : 'Actualizar monto'}
            onPress={
              composerOpen ? handleContribute : () => setComposerOpen(true)
            }
            loading={addContribution.isPending}
            disabled={composerOpen && contribution <= 0}
            icon={<PlusIcon size={18} color={colors.brandText} />}
          />

          {composerOpen && (
            <Button
              label="Cancelar"
              variant="ghost"
              onPress={() => {
                setComposerOpen(false)
                setContribution(0)
              }}
            />
          )}
        </View>
      </Card>

      <Card title="Historial de Ahorro">
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
              <View
                style={[
                  styles.historyRow,
                  { gap: spacing.sm, paddingVertical: spacing.sm },
                ]}
              >
                <View
                  style={[
                    styles.historyIcon,
                    { backgroundColor: withAlpha(colors.positive, 0.16) },
                  ]}
                >
                  <Text style={styles.historyGlyph}>{CONTRIBUTION_ICON}</Text>
                </View>

                <View style={styles.historyBody}>
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

      <Card title="Acciones">
        <View style={{ gap: spacing.sm }}>
          <ErrorNotice error={updateGoal.error ?? deleteGoal.error} />

          <Button
            label="Editar meta"
            variant="outline"
            onPress={() =>
              navigation.replace('CreateGoal', { goalId: goal.id })
            }
            icon={<PencilIcon size={18} color={colors.primary} />}
            disabled={busy}
          />
          <Button
            label={paused ? 'Reanudar' : 'Pausar'}
            variant="ghost"
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
      </Card>
    </>
  )
}

const AVATAR_SIZE = 32
const CARD_ICON_SIZE = 36
const HISTORY_ICON_SIZE = 36

const styles = StyleSheet.create({
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    alignItems: 'center',
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  amounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountRight: {
    alignItems: 'flex-end',
  },
  cardHeading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    width: CARD_ICON_SIZE,
    height: CARD_ICON_SIZE,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyIcon: {
    width: HISTORY_ICON_SIZE,
    height: HISTORY_ICON_SIZE,
    borderRadius: HISTORY_ICON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyGlyph: {
    fontSize: 18,
  },
  historyBody: {
    flex: 1,
  },
})
