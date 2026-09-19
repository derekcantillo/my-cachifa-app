import React, { useCallback, useState } from 'react'
import { StyleSheet, Text } from 'react-native'
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native'
import type { Account } from '@/api/types'
import {
  ACCOUNT_TYPES,
  Button,
  CheckCircleIcon,
  CurrencyField,
  DateField,
  ErrorNotice,
  InfoCallout,
  ModalScreen,
  Skeleton,
  ToggleRow,
} from '@/components'
import { useAccounts, useSetInitialBalance } from '@/hooks'
import type { RootStackParamList } from '@/navigation/types'
import { useTheme } from '@/theme'
import { formatCurrency } from '@/utils'

type SetInitialBalanceRoute = RouteProp<RootStackParamList, 'SetInitialBalance'>

const TITLE = 'Saldo inicial'

/** Sets the balance an account starts from, and the date it applies from. */
export function SetInitialBalanceScreen() {
  const { colors, spacing } = useTheme()
  const navigation = useNavigation()
  const route = useRoute<SetInitialBalanceRoute>()

  const accountsQuery = useAccounts()
  const account = accountsQuery.data?.find(
    item => item.id === route.params.accountId,
  )

  if (accountsQuery.isPending) {
    return (
      <ModalScreen title={TITLE} onClose={navigation.goBack} leading="close">
        <Skeleton height={72} radius={14} />
        <Skeleton height={44} radius={14} />
      </ModalScreen>
    )
  }

  if (!account) {
    return (
      <ModalScreen title={TITLE} onClose={navigation.goBack} leading="close">
        <Text style={{ color: colors.textSecondary, marginBottom: spacing.md }}>
          {accountsQuery.isError
            ? 'No pudimos cargar tus cuentas.'
            : 'Esta cuenta ya no existe.'}
        </Text>
        <Button
          label="Volver"
          variant="secondary"
          onPress={navigation.goBack}
        />
      </ModalScreen>
    )
  }

  return <InitialBalanceForm account={account} />
}

function InitialBalanceForm({ account }: { account: Account }) {
  const { colors, typography } = useTheme()
  const navigation = useNavigation()
  const setInitialBalance = useSetInitialBalance()

  const [amount, setAmount] = useState(Math.abs(account.initialBalance))
  const [date, setDate] = useState(
    account.initialBalanceDate
      ? new Date(account.initialBalanceDate)
      : new Date(),
  )
  // A credit card, or any account already set below zero, can start in debt.
  const canBeNegative =
    account.type === 'credit_card' || account.initialBalance < 0
  const [isDebt, setIsDebt] = useState(account.initialBalance < 0)

  const handleSubmit = useCallback(() => {
    setInitialBalance.mutate(
      {
        id: account.id,
        input: {
          amount: isDebt ? -amount : amount,
          date: date.toISOString(),
        },
      },
      { onSuccess: () => navigation.goBack() },
    )
  }, [account.id, amount, date, isDebt, navigation, setInitialBalance])

  return (
    <ModalScreen
      title={TITLE}
      onClose={navigation.goBack}
      leading="close"
      grabber
      footer={
        <Button
          label="Guardar saldo"
          onPress={handleSubmit}
          loading={setInitialBalance.isPending}
          icon={<CheckCircleIcon size={20} color={colors.brandText} />}
        />
      }
    >
      <Text
        style={[
          styles.summary,
          {
            color: colors.textSecondary,
            fontSize: typography.fontSizes.sm,
          },
        ]}
      >
        {`${account.name} · ${
          ACCOUNT_TYPES[account.type].label
        } · Saldo actual ${formatCurrency(account.currentBalance)}`}
      </Text>

      <CurrencyField
        label="Saldo de partida"
        value={amount}
        onChange={setAmount}
        hero
      />

      {canBeNegative && (
        <ToggleRow
          label="Es deuda"
          description="Actívalo si la cuenta arranca debiendo este monto."
          value={isDebt}
          onValueChange={setIsDebt}
        />
      )}

      <DateField
        label="Fecha del saldo"
        value={date}
        onChange={setDate}
        maximumDate={new Date()}
      />

      <InfoCallout>
        <Text style={{ color: colors.text, fontSize: typography.fontSizes.sm }}>
          Este es tu saldo de partida — no necesitas reconstruir movimientos
          anteriores a esta fecha.
        </Text>
      </InfoCallout>

      <ErrorNotice error={setInitialBalance.error} />
    </ModalScreen>
  )
}

const styles = StyleSheet.create({
  summary: {
    textAlign: 'center',
  },
})
