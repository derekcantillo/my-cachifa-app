import React, { useCallback, useMemo } from 'react'
import { Text } from 'react-native'
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native'
import type { Loan } from '@/api/types'
import {
  Button,
  Card,
  CheckCircleIcon,
  CurrencyField,
  DateField,
  ErrorNotice,
  ModalScreen,
  OptionChips,
  Skeleton,
  TextField,
  type ChipOption,
} from '@/components'
import { useAccounts, useCreateLoan, useLoan, useUpdateLoan } from '@/hooks'
import type { RootStackParamList } from '@/navigation/types'
import { useTheme } from '@/theme'
import { toUpdateInput, useLoanForm } from './useLoanForm'

type CreateLoanRoute = RouteProp<RootStackParamList, 'CreateLoan'>

/** Registers a loan given to someone, or edits one when the route carries a `loanId`. */
export function CreateLoanScreen() {
  const { colors, spacing } = useTheme()
  const navigation = useNavigation()
  const route = useRoute<CreateLoanRoute>()

  const loanId = route.params?.loanId
  const isEditing = loanId !== undefined

  const loanQuery = useLoan(loanId ?? '', { enabled: isEditing })
  const title = isEditing ? 'Editar préstamo' : 'Prestar dinero'

  if (isEditing && loanQuery.isPending) {
    return (
      <ModalScreen title={title} onClose={navigation.goBack} leading="close">
        <Skeleton height={44} radius={14} />
        <Skeleton height={72} radius={14} />
        <Skeleton height={44} radius={14} />
      </ModalScreen>
    )
  }

  if (isEditing && !loanQuery.data) {
    return (
      <ModalScreen title={title} onClose={navigation.goBack} leading="close">
        <Text style={{ color: colors.textSecondary, marginBottom: spacing.md }}>
          Este préstamo ya no existe.
        </Text>
        <Button
          label="Volver"
          variant="secondary"
          onPress={navigation.goBack}
        />
      </ModalScreen>
    )
  }

  return <LoanForm title={title} loan={loanQuery.data ?? null} />
}

interface LoanFormProps {
  title: string
  /** Loan being edited, or `null` when registering a new one. */
  loan: Loan | null
}

function LoanForm({ title, loan }: LoanFormProps) {
  const { colors } = useTheme()
  const navigation = useNavigation()

  const createLoan = useCreateLoan()
  const updateLoan = useUpdateLoan()
  const accountsQuery = useAccounts()

  const form = useLoanForm(loan)

  const accountOptions = useMemo<ChipOption[]>(
    () =>
      (accountsQuery.data ?? []).map(account => ({
        value: account.id,
        label: account.name,
      })),
    [accountsQuery.data],
  )

  const isSaving = createLoan.isPending || updateLoan.isPending
  const error = createLoan.error ?? updateLoan.error

  const handleSubmit = useCallback(() => {
    const input = form.validate()
    if (!input) {
      return
    }

    const close = () => navigation.goBack()

    if (loan) {
      updateLoan.mutate(
        { id: loan.id, input: toUpdateInput(input) },
        { onSuccess: close },
      )
      return
    }

    createLoan.mutate(input, { onSuccess: close })
  }, [createLoan, form, loan, navigation, updateLoan])

  return (
    <ModalScreen
      title={title}
      onClose={navigation.goBack}
      leading="close"
      grabber
      footer={
        <Button
          label={loan ? 'Guardar cambios' : 'Registrar préstamo'}
          onPress={handleSubmit}
          loading={isSaving}
          icon={<CheckCircleIcon size={20} color={colors.brandText} />}
        />
      }
    >
      <Card>
        <TextField
          label="¿A quién le prestas?"
          value={form.values.borrowerName}
          onChangeText={form.setBorrowerName}
          placeholder="Ej: Camila"
          error={form.errors.borrowerName}
          autoFocus={!loan}
        />
      </Card>

      <CurrencyField
        label="Monto prestado"
        value={form.values.amount}
        onChange={form.setAmount}
        error={form.errors.amount}
        editable={!loan}
        {...(loan
          ? { hint: 'No se puede cambiar una vez registrado el préstamo.' }
          : {})}
        hero
      />

      <DateField
        label="Fecha del préstamo"
        value={form.values.loanDate}
        onChange={form.setLoanDate}
        maximumDate={new Date()}
      />

      <DateField
        label="Fecha límite (opcional)"
        value={form.values.dueDate ?? form.values.loanDate}
        onChange={form.setDueDate}
        minimumDate={form.values.loanDate}
      />

      {accountOptions.length > 0 && (
        <OptionChips
          label="Cuenta de origen (opcional)"
          options={accountOptions}
          value={form.values.accountId}
          onChange={form.setAccountId}
        />
      )}

      <TextField
        label="Nota (opcional)"
        value={form.values.note}
        onChangeText={form.setNote}
        placeholder="Ej: Para la matrícula del curso"
        tone="filled"
      />

      <ErrorNotice error={error} />
    </ModalScreen>
  )
}
