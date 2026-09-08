import React, { useCallback, useMemo } from 'react'
import { Alert } from 'react-native'
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native'
import type { Category, RecurringExpense } from '@/api/types'
import {
  Button,
  Card,
  CategoryIcon,
  CheckCircleIcon,
  CurrencyField,
  ErrorNotice,
  ModalScreen,
  OptionChips,
  Skeleton,
  TextField,
  ToggleRow,
  TrashIcon,
  type ChipOption,
} from '@/components'
import {
  useCategories,
  useCategoriesForKind,
  useCreateRecurringExpense,
  useDeleteRecurringExpense,
  useRecurringExpenses,
  useUpdateRecurringExpense,
} from '@/hooks'
import type { RootStackParamList } from '@/navigation/types'
import { getCategoryColor, useTheme } from '@/theme'
import { useRecurringExpenseForm } from './useRecurringExpenseForm'

type FormRoute = RouteProp<RootStackParamList, 'RecurringExpenseForm'>

/** Creates a recurring expense, or edits one when the route carries an id. */
export function RecurringExpenseFormScreen() {
  const navigation = useNavigation()
  const route = useRoute<FormRoute>()

  const recurringExpenseId = route.params?.recurringExpenseId
  const isEditing = recurringExpenseId !== undefined

  // No `getById` endpoint — the list is a handful of rows, so the lookup
  // happens against whatever `useRecurringExpenses` already has cached.
  const expensesQuery = useRecurringExpenses()
  const categoriesQuery = useCategories()

  const expense = isEditing
    ? (expensesQuery.data ?? []).find(item => item.id === recurringExpenseId)
    : null

  const title = isEditing ? 'Editar gasto fijo' : 'Agregar gasto fijo'
  const isLoading = categoriesQuery.isPending || expensesQuery.isPending

  if (isLoading) {
    return (
      <ModalScreen title={title} onClose={navigation.goBack}>
        <Skeleton height={44} radius={14} />
        <Skeleton height={72} radius={14} />
        <Skeleton height={44} radius={14} />
      </ModalScreen>
    )
  }

  if (isEditing && !expense) {
    return (
      <ModalScreen title={title} onClose={navigation.goBack}>
        <Button
          label="Volver"
          variant="secondary"
          onPress={navigation.goBack}
        />
      </ModalScreen>
    )
  }

  return (
    <RecurringExpenseForm
      title={title}
      expense={expense ?? null}
      categories={categoriesQuery.data ?? []}
    />
  )
}

interface RecurringExpenseFormProps {
  title: string
  expense: RecurringExpense | null
  categories: Category[]
}

function RecurringExpenseForm({
  title,
  expense,
  categories,
}: RecurringExpenseFormProps) {
  const { colors } = useTheme()
  const navigation = useNavigation()

  const createExpense = useCreateRecurringExpense()
  const updateExpense = useUpdateRecurringExpense()
  const deleteExpense = useDeleteRecurringExpense()

  const form = useRecurringExpenseForm(expense)

  const expenseCategories = useCategoriesForKind(categories, 'expense')
  const categoryOptions = useMemo<ChipOption[]>(
    () =>
      expenseCategories.map(category => ({
        value: category.id,
        label: category.name,
        color: getCategoryColor(category),
        icon: (
          <CategoryIcon
            icon={category.icon}
            categoryId={category.id}
            size={18}
            variant="plain"
          />
        ),
      })),
    [expenseCategories],
  )

  const isSaving = createExpense.isPending || updateExpense.isPending
  const error = createExpense.error ?? updateExpense.error ?? deleteExpense.error

  const handleSubmit = useCallback(() => {
    const input = form.validate()
    if (!input) {
      return
    }

    const close = () => navigation.goBack()

    if (expense) {
      updateExpense.mutate({ id: expense.id, input }, { onSuccess: close })
      return
    }

    createExpense.mutate(input, { onSuccess: close })
  }, [createExpense, expense, form, navigation, updateExpense])

  const handleDelete = useCallback(() => {
    if (!expense) return

    Alert.alert(
      'Eliminar gasto fijo',
      `Se eliminará "${expense.name}". Los presupuestos del mes se recalcularán sin él.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteExpense.mutate(expense.id, {
              onSuccess: () => navigation.goBack(),
            })
          },
        },
      ],
    )
  }, [deleteExpense, expense, navigation])

  return (
    <ModalScreen
      title={title}
      onClose={navigation.goBack}
      footer={
        <Button
          label={expense ? 'Guardar cambios' : 'Agregar gasto fijo'}
          onPress={handleSubmit}
          loading={isSaving}
          icon={<CheckCircleIcon size={20} color={colors.brandText} />}
        />
      }
    >
      <Card>
        <TextField
          label="Nombre"
          value={form.values.name}
          onChangeText={form.setName}
          placeholder="Ej: Arriendo"
          error={form.errors.name}
          autoFocus={!expense}
        />

        <OptionChips
          label="Categoría"
          options={categoryOptions}
          value={form.values.categoryId}
          onChange={form.setCategoryId}
          error={form.errors.categoryId}
        />

        <CurrencyField
          label="Monto estimado (COP)"
          value={form.values.estimatedAmount}
          onChange={form.setEstimatedAmount}
          error={form.errors.estimatedAmount}
        />

        <ToggleRow
          label="Monto fijo"
          description={
            form.values.isAmountFixed
              ? 'El cobro es siempre el mismo, como un arriendo.'
              : 'El cobro varía cada mes; esto es solo un estimado.'
          }
          value={form.values.isAmountFixed}
          onValueChange={form.setIsAmountFixed}
        />

        <TextField
          label="Día del mes en que vence"
          value={form.values.dayOfMonth}
          onChangeText={form.setDayOfMonth}
          placeholder="Ej: 5"
          keyboardType="number-pad"
          error={form.errors.dayOfMonth}
        />
      </Card>

      <ErrorNotice error={error} />

      {expense ? (
        <Button
          label="Eliminar gasto fijo"
          variant="danger"
          onPress={handleDelete}
          loading={deleteExpense.isPending}
          disabled={isSaving}
          icon={<TrashIcon size={18} color={colors.negative} />}
        />
      ) : null}
    </ModalScreen>
  )
}
