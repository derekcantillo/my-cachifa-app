import React, { useCallback, useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native'
import type {
  Account,
  Category,
  Transaction,
  TransactionKind,
} from '@/api/types'
import {
  Button,
  CategoryIcon,
  CheckCircleIcon,
  CurrencyField,
  DateField,
  ErrorNotice,
  InfoCallout,
  ModalScreen,
  OptionChips,
  SegmentedControl,
  Skeleton,
  StarIcon,
  TextField,
  ToggleRow,
  type ChipOption,
  type SegmentedControlOption,
} from '@/components'
import {
  useAccounts,
  useCategories,
  useCreateTransaction,
  useTransaction,
  useUpdateTransaction,
} from '@/hooks'
import type { RootStackParamList } from '@/navigation/types'
import { getCategoryColor, useTheme } from '@/theme'
import { formatCurrency } from '@/utils'
import { useCategoriesForKind, useTransactionForm } from './useTransactionForm'

const KIND_OPTIONS: ReadonlyArray<SegmentedControlOption<TransactionKind>> = [
  { value: 'expense', label: 'Gasto' },
  { value: 'income', label: 'Ingreso' },
  { value: 'saving', label: 'Ahorro' },
]

/** The amount question changes with what is being registered. */
const AMOUNT_LABELS: Record<TransactionKind, string> = {
  expense: 'Valor (COP)',
  income: '¿Cuánto recibiste?',
  saving: '¿Cuánto vas a guardar?',
}

const SUBMIT_LABELS: Record<TransactionKind, string> = {
  expense: 'Registrar gasto',
  income: 'Registrar ingreso',
  saving: 'Registrar ahorro',
}

type RegisterRoute = RouteProp<RootStackParamList, 'RegisterTransaction'>

/**
 * Registers a movement, or edits one when the route carries a `transactionId`.
 * Both paths run the same form; only the mutation behind the submit differs.
 */
export function RegisterTransactionScreen() {
  const { colors, spacing } = useTheme()
  const navigation = useNavigation()
  const route = useRoute<RegisterRoute>()

  const transactionId = route.params?.transactionId
  const isEditing = transactionId !== undefined

  const transactionQuery = useTransaction(transactionId ?? '', {
    enabled: isEditing,
  })
  const categoriesQuery = useCategories()
  const accountsQuery = useAccounts()

  const title = isEditing ? 'Editar movimiento' : 'Registrar'
  const isLoading =
    categoriesQuery.isPending ||
    accountsQuery.isPending ||
    (isEditing && transactionQuery.isPending)

  if (isLoading) {
    return (
      <ModalScreen
        title={title}
        onClose={navigation.goBack}
        leading="close"
        grabber
      >
        <Skeleton height={44} radius={14} />
        <Skeleton height={72} radius={14} />
        <Skeleton height={44} radius={14} />
        <Skeleton height={44} radius={14} />
      </ModalScreen>
    )
  }

  if (isEditing && !transactionQuery.data) {
    return (
      <ModalScreen
        title={title}
        onClose={navigation.goBack}
        leading="close"
        grabber
      >
        <Text style={{ color: colors.textSecondary, marginBottom: spacing.md }}>
          Este movimiento ya no existe.
        </Text>
        <Button
          label="Volver"
          variant="secondary"
          onPress={navigation.goBack}
        />
      </ModalScreen>
    )
  }

  return (
    <TransactionForm
      title={title}
      transaction={transactionQuery.data ?? null}
      categories={categoriesQuery.data ?? []}
      accounts={accountsQuery.data ?? []}
    />
  )
}

interface TransactionFormProps {
  title: string
  /** Movement being edited, or `null` when registering a new one. */
  transaction: Transaction | null
  categories: Category[]
  accounts: Account[]
}

function TransactionForm({
  title,
  transaction,
  categories,
  accounts,
}: TransactionFormProps) {
  const { colors, spacing, typography } = useTheme()
  const navigation = useNavigation()

  const createTransaction = useCreateTransaction()
  const updateTransaction = useUpdateTransaction()

  const form = useTransactionForm({
    transaction,
    defaultAccountId: accounts[0]?.id,
  })

  const kindCategories = useCategoriesForKind(categories, form.values.kind)

  const categoryOptions = useMemo<ChipOption[]>(
    () =>
      kindCategories.map(category => ({
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
    [kindCategories],
  )

  const accountOptions = useMemo<ChipOption[]>(
    () => accounts.map(account => ({ value: account.id, label: account.name })),
    [accounts],
  )

  const isSaving = createTransaction.isPending || updateTransaction.isPending
  const error = createTransaction.error ?? updateTransaction.error

  const handleSubmit = useCallback(() => {
    const input = form.validate()
    if (!input) {
      return
    }

    const close = () => navigation.goBack()

    if (transaction) {
      updateTransaction.mutate(
        { id: transaction.id, input },
        { onSuccess: close },
      )
      return
    }

    createTransaction.mutate(input, { onSuccess: close })
  }, [createTransaction, form, navigation, transaction, updateTransaction])

  return (
    <ModalScreen
      title={title}
      onClose={navigation.goBack}
      leading="close"
      grabber
      footer={
        <Button
          label={
            transaction ? 'Guardar cambios' : SUBMIT_LABELS[form.values.kind]
          }
          onPress={handleSubmit}
          loading={isSaving}
          icon={<CheckCircleIcon size={20} color={colors.brandText} />}
        />
      }
    >
      <SegmentedControl
        options={KIND_OPTIONS}
        value={form.values.kind}
        onChange={form.setKind}
      />

      <View style={{ paddingVertical: spacing.sm }}>
        <CurrencyField
          label={AMOUNT_LABELS[form.values.kind]}
          value={form.values.amount}
          onChange={form.setAmount}
          error={form.errors.amount}
          autoFocus={!transaction}
          hero
        />
      </View>

      <OptionChips
        label="Categoría"
        options={categoryOptions}
        value={form.values.categoryId}
        onChange={form.setCategoryId}
        error={form.errors.categoryId}
      />

      <TextField
        label="Descripción (Opcional)"
        value={form.values.description}
        onChangeText={form.setDescription}
        placeholder="Ej: Almuerzo de trabajo"
        tone="filled"
      />

      <DateField
        label="Fecha"
        value={form.values.date}
        onChange={form.setDate}
        maximumDate={new Date()}
        tone="filled"
      />

      <OptionChips
        label="Cuenta"
        options={accountOptions}
        value={form.values.accountId}
        onChange={form.setAccountId}
        error={form.errors.accountId}
      />

      {form.values.kind === 'income' && (
        <InfoCallout icon={<StarIcon size={20} color={colors.primary} />}>
          <ToggleRow
            label="¿Es la prima semestral?"
            value={form.values.semesterBonus}
            onValueChange={form.setSemesterBonus}
          />
          {form.values.semesterBonus && form.values.amount > 0 ? (
            <View
              style={[
                styles.bonusAmount,
                {
                  backgroundColor: colors.surface,
                  marginTop: spacing.sm,
                  padding: spacing.sm,
                },
              ]}
            >
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: typography.fontSizes.xs,
                }}
              >
                Valor que se repartirá entre tus metas:
              </Text>
              <Text
                style={{
                  color: colors.primary,
                  fontSize: typography.fontSizes.lg,
                  fontWeight: typography.fontWeights.bold,
                }}
              >
                {formatCurrency(form.values.amount)}
              </Text>
            </View>
          ) : null}
        </InfoCallout>
      )}

      {form.values.kind === 'saving' && (
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: typography.fontSizes.xs,
          }}
        >
          Los ahorros suman a tu progreso del mes en Reportes.
        </Text>
      )}

      <ErrorNotice error={error} />
    </ModalScreen>
  )
}

const styles = StyleSheet.create({
  bonusAmount: {
    borderRadius: 10,
  },
})
