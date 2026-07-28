import React, { useCallback, useMemo } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { Goal, GoalPhase } from '@/api/types'
import {
  Button,
  CurrencyField,
  DateField,
  ErrorNotice,
  GoalCard,
  ModalHeader,
  OptionChips,
  PHASE_GLYPHS,
  PHASE_LABELS,
  PHASE_ORDER,
  SectionHeader,
  Skeleton,
  TextField,
  ToggleRow,
  type ChipOption,
} from '@/components'
import { useCreateGoal, useGoal, useUpdateGoal } from '@/hooks'
import type { RootStackParamList } from '@/navigation/types'
import { useTheme } from '@/theme'
import {
  defaultTargetDate,
  toPreviewGoal,
  toUpdateInput,
  useGoalForm,
} from './useGoalForm'

type CreateGoalRoute = RouteProp<RootStackParamList, 'CreateGoal'>

const PHASE_OPTIONS: ReadonlyArray<ChipOption<GoalPhase>> = PHASE_ORDER.map(
  phase => ({
    value: phase,
    label: `${PHASE_GLYPHS[phase]}  ${PHASE_LABELS[phase]}`,
  }),
)

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
      <FormShell title={title}>
        <Skeleton height={44} radius={14} />
        <Skeleton height={72} radius={14} />
        <Skeleton height={44} radius={14} />
      </FormShell>
    )
  }

  if (isEditing && !goalQuery.data) {
    return (
      <FormShell title={title}>
        <Text style={{ color: colors.textSecondary, marginBottom: spacing.md }}>
          Esta meta ya no existe.
        </Text>
        <Button
          label="Volver"
          variant="secondary"
          onPress={() => navigation.goBack()}
        />
      </FormShell>
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
  const { spacing } = useTheme()
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
    <FormShell title={title}>
      <TextField
        label="Nombre de la meta"
        value={form.values.name}
        onChangeText={form.setName}
        placeholder="Ej. Cuota inicial del carro"
        error={form.errors.name}
        autoFocus={!goal}
      />

      <CurrencyField
        label="Monto objetivo"
        value={form.values.targetAmount}
        onChange={form.setTargetAmount}
        error={form.errors.targetAmount}
      />

      <CurrencyField
        label="Ahorro actual"
        value={form.values.currentAmount}
        onChange={form.setCurrentAmount}
        error={form.errors.currentAmount}
        hint={
          goal
            ? 'Se actualiza desde el detalle de la meta, con cada aporte.'
            : 'Cuánto llevas ahorrado para esta meta hoy.'
        }
        // Contributions own this number once the goal exists.
        {...(goal ? { editable: false } : {})}
      />

      <DateField
        label="Fecha objetivo"
        value={form.values.targetDate ?? defaultTargetDate()}
        onChange={form.setTargetDate}
        minimumDate={new Date()}
      />

      <OptionChips
        label="Fase"
        options={PHASE_OPTIONS}
        value={form.values.phase}
        onChange={form.setPhase}
        wrap
      />

      <ToggleRow
        label="Meta activa"
        description="Las metas pausadas no cuentan en tu plan del mes."
        value={form.values.active}
        onValueChange={form.setActive}
      />

      <View style={{ gap: spacing.sm }}>
        <SectionHeader title="Vista previa" />
        <GoalCard goal={preview} variant="full" />
      </View>

      <ErrorNotice error={error} />

      <View style={{ gap: spacing.sm }}>
        <Button
          label={goal ? 'Guardar cambios' : 'Crear meta'}
          onPress={handleSubmit}
          loading={isSaving}
        />
        <Button
          label="Cancelar"
          variant="secondary"
          onPress={() => navigation.goBack()}
          disabled={isSaving}
        />
      </View>
    </FormShell>
  )
}

interface FormShellProps {
  title: string
  children: React.ReactNode
}

function FormShell({ title, children }: FormShellProps) {
  const { colors, spacing } = useTheme()
  const navigation = useNavigation()

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ModalHeader title={title} onClose={() => navigation.goBack()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            padding: spacing.md,
            paddingBottom: spacing.xxl,
            gap: spacing.md,
          }}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
