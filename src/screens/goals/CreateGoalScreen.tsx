import React, { useCallback, useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native'
import type { Goal } from '@/api/types'
import {
  Button,
  Card,
  CheckCircleIcon,
  CurrencyField,
  DateField,
  ErrorNotice,
  GoalCard,
  ModalScreen,
  Skeleton,
  TextField,
  ToggleRow,
} from '@/components'
import { useCreateGoal, useGoal, useUpdateGoal } from '@/hooks'
import type { RootStackParamList } from '@/navigation/types'
import { useTheme } from '@/theme'
import { PhaseSelector } from './components'
import {
  defaultTargetDate,
  toPreviewGoal,
  toUpdateInput,
  useGoalForm,
} from './useGoalForm'

type CreateGoalRoute = RouteProp<RootStackParamList, 'CreateGoal'>

/** Creates a goal, or edits one when the route carries a `goalId`. */
export function CreateGoalScreen() {
  const { colors, spacing } = useTheme()
  const navigation = useNavigation()
  const route = useRoute<CreateGoalRoute>()

  const goalId = route.params?.goalId
  const isEditing = goalId !== undefined

  const goalQuery = useGoal(goalId ?? '', { enabled: isEditing })
  const title = isEditing ? 'Editar meta' : 'Crear nueva meta'

  if (isEditing && goalQuery.isPending) {
    return (
      <ModalScreen title={title} onClose={navigation.goBack}>
        <Skeleton height={44} radius={14} />
        <Skeleton height={72} radius={14} />
        <Skeleton height={44} radius={14} />
      </ModalScreen>
    )
  }

  if (isEditing && !goalQuery.data) {
    return (
      <ModalScreen title={title} onClose={navigation.goBack}>
        <Text style={{ color: colors.textSecondary, marginBottom: spacing.md }}>
          Esta meta ya no existe.
        </Text>
        <Button
          label="Volver"
          variant="secondary"
          onPress={navigation.goBack}
        />
      </ModalScreen>
    )
  }

  return <GoalForm title={title} goal={goalQuery.data ?? null} />
}

interface GoalFormProps {
  title: string
  /** Goal being edited, or `null` when creating a new one. */
  goal: Goal | null
}

function GoalForm({ title, goal }: GoalFormProps) {
  const { colors, spacing, typography } = useTheme()
  const navigation = useNavigation()

  const createGoal = useCreateGoal()
  const updateGoal = useUpdateGoal()

  const form = useGoalForm(goal)

  const preview = useMemo(() => toPreviewGoal(form.values), [form.values])

  const isSaving = createGoal.isPending || updateGoal.isPending
  const error = createGoal.error ?? updateGoal.error

  const handleSubmit = useCallback(() => {
    const input = form.validate()
    if (!input) {
      return
    }

    const close = () => navigation.goBack()

    if (goal) {
      updateGoal.mutate(
        { id: goal.id, input: toUpdateInput(input) },
        { onSuccess: close },
      )
      return
    }

    createGoal.mutate(input, { onSuccess: close })
  }, [createGoal, form, goal, navigation, updateGoal])

  return (
    <ModalScreen
      title={title}
      onClose={navigation.goBack}
      footer={
        <Button
          label={goal ? 'Guardar cambios' : 'Crear meta'}
          onPress={handleSubmit}
          loading={isSaving}
          icon={<CheckCircleIcon size={20} color={colors.brandText} />}
        />
      }
    >
      <Card>
        <View style={{ gap: spacing.md }}>
          <TextField
            label="Nombre de la meta"
            value={form.values.name}
            onChangeText={form.setName}
            placeholder="Ej: Viaje a Cartagena"
            error={form.errors.name}
            autoFocus={!goal}
          />

          <CurrencyField
            label="Monto objetivo (COP)"
            value={form.values.targetAmount}
            onChange={form.setTargetAmount}
            error={form.errors.targetAmount}
          />

          <CurrencyField
            label="Ahorro actual (COP)"
            value={form.values.currentAmount}
            onChange={form.setCurrentAmount}
            error={form.errors.currentAmount}
            editable={!goal}
            {...(goal
              ? { hint: 'Se actualiza con cada aporte, desde el detalle.' }
              : {})}
          />

          <DateField
            label="Fecha objetivo (Mes/Año)"
            value={form.values.targetDate ?? defaultTargetDate()}
            onChange={form.setTargetDate}
            minimumDate={new Date()}
            format="month"
          />

          <View style={{ gap: spacing.xs }}>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typography.fontSizes.sm,
                fontWeight: typography.fontWeights.medium,
              }}
            >
              Estado
            </Text>
            <ToggleRow
              label={form.values.active ? 'Activa' : 'Pausada'}
              value={form.values.active}
              onValueChange={form.setActive}
            />
          </View>

          <PhaseSelector value={form.values.phase} onChange={form.setPhase} />
        </View>
      </Card>

      <View style={{ gap: spacing.sm }}>
        <Text
          style={[
            styles.previewLabel,
            {
              color: colors.textSecondary,
              fontSize: typography.fontSizes.xs,
              fontWeight: typography.fontWeights.semibold,
            },
          ]}
        >
          Vista previa
        </Text>
        <GoalCard goal={preview} variant="full" />
      </View>

      <ErrorNotice error={error} />
    </ModalScreen>
  )
}

const styles = StyleSheet.create({
  previewLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
})
