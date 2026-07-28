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
import type {
  Account,
  Category,
  Transaction,
  TransactionKind,
} from '@/api/types'
import {
  Button,
  CategoryIcon,
  CurrencyField,
  DateField,
  ErrorNotice,
  ModalHeader,
  OptionChips,
  SegmentedControl,
  Skeleton,
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
import { useCategoriesForKind, useTransactionForm } from './useTransactionForm'

const KIND_OPTIONS: ReadonlyArray<SegmentedControlOption<TransactionKind>> = [
  { value: 'expense', label: 'Gasto' },
  { value: 'income', label: 'Ingreso' },
  { value: 'saving', label: 'Ahorro' },
]

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
      <FormShell title={title}>
        <Skeleton height={44} radius={14} />
        <Skeleton height={72} radius={14} />
        <Skeleton height={44} radius={14} />
        <Skeleton height={44} radius={14} />
      </FormShell>
    )
  }

  if (isEditing && !transactionQuery.data) {
    return (
      <FormShell title={title}>
        <Text style={{ color: colors.textSecondary, marginBottom: spacing.md }}>
          Este movimiento ya no existe.
        </Text>
        <Button
          label="Volver"
          variant="secondary"
          onPress={() => navigation.goBack()}
        />
      </FormShell>
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
    <FormShell title={title}>
      <SegmentedControl
        options={KIND_OPTIONS}
        value={form.values.kind}
        onChange={form.setKind}
      />

      <CurrencyField
        label="Monto"
        value={form.values.amount}
        onChange={form.setAmount}
        error={form.errors.amount}
        autoFocus={!transaction}
        large
      />

      <OptionChips
        label="Categoría"
        options={categoryOptions}
        value={form.values.categoryId}
        onChange={form.setCategoryId}
        error={form.errors.categoryId}
        wrap
      />

      <TextField
        label="Descripción"
        value={form.values.description}
        onChangeText={form.setDescription}
        placeholder="Ej. Almuerzo con el equipo"
        error={form.errors.description}
      />

      <DateField
        label="Fecha"
        value={form.values.date}
        onChange={form.setDate}
        maximumDate={new Date()}
      />

      <OptionChips
        label="Cuenta"
        options={accountOptions}
        value={form.values.accountId}
        onChange={form.setAccountId}
        error={form.errors.accountId}
      />

      {form.values.kind === 'income' && (
        <ToggleRow
          label="Prima semestral"
          description="Márcala para que el plan la reparta entre tus metas."
          value={form.values.semesterBonus}
          onValueChange={form.setSemesterBonus}
        />
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

      <View style={{ gap: spacing.sm }}>
        <Button
          label={transaction ? 'Guardar cambios' : 'Registrar'}
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

/** Modal chrome shared by the loading, missing and ready states of the form. */
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
