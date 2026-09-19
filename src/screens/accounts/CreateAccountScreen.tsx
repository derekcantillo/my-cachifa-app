import React, { useCallback, useMemo, useState } from 'react'
import { StackActions, useNavigation } from '@react-navigation/native'
import type { AccountType } from '@/api/types'
import {
  ACCOUNT_TYPES,
  ACCOUNT_TYPE_ORDER,
  Button,
  Card,
  CategoryIcon,
  CheckCircleIcon,
  ErrorNotice,
  ModalScreen,
  OptionChips,
  TextField,
  type ChipOption,
} from '@/components'
import { useCreateAccount } from '@/hooks'
import { useTheme } from '@/theme'

interface CreateAccountErrors {
  name?: string
  type?: string
}

/**
 * Registers a new account. Its balance starts at zero, so saving goes straight
 * on to setting the starting balance rather than back to the list.
 */
export function CreateAccountScreen() {
  const { colors } = useTheme()
  const navigation = useNavigation()
  const createAccount = useCreateAccount()

  const [name, setName] = useState('')
  const [type, setType] = useState<AccountType | null>(null)
  const [errors, setErrors] = useState<CreateAccountErrors>({})

  const typeOptions = useMemo<ChipOption<AccountType>[]>(
    () =>
      ACCOUNT_TYPE_ORDER.map(value => {
        const definition = ACCOUNT_TYPES[value]
        return {
          value,
          label: definition.label,
          color: definition.color,
          icon: (
            <CategoryIcon
              icon={definition.icon}
              color={definition.color}
              size={18}
              variant="plain"
            />
          ),
        }
      }),
    [],
  )

  const handleNameChange = useCallback((value: string) => {
    setName(value)
    setErrors(current => ({ ...current, name: undefined }))
  }, [])

  const handleTypeChange = useCallback((value: AccountType) => {
    setType(value)
    setErrors(current => ({ ...current, type: undefined }))
  }, [])

  const handleSubmit = useCallback(() => {
    const trimmed = name.trim()
    const nextErrors: CreateAccountErrors = {
      ...(trimmed ? {} : { name: 'Ingresa un nombre para la cuenta.' }),
      ...(type ? {} : { type: 'Elige el tipo de cuenta.' }),
    }
    setErrors(nextErrors)

    if (!trimmed || !type) {
      return
    }

    createAccount.mutate(
      { name: trimmed, type },
      {
        onSuccess: account => {
          navigation.dispatch(
            StackActions.replace('SetInitialBalance', {
              accountId: account.id,
            }),
          )
        },
      },
    )
  }, [createAccount, name, navigation, type])

  return (
    <ModalScreen
      title="Agregar cuenta"
      onClose={navigation.goBack}
      leading="close"
      grabber
      footer={
        <Button
          label="Crear cuenta"
          onPress={handleSubmit}
          loading={createAccount.isPending}
          icon={<CheckCircleIcon size={20} color={colors.brandText} />}
        />
      }
    >
      <Card>
        <TextField
          label="Nombre"
          value={name}
          onChangeText={handleNameChange}
          placeholder="Ej: Bancolombia nómina"
          error={errors.name}
          autoFocus
        />
      </Card>

      <OptionChips
        label="Tipo de cuenta"
        options={typeOptions}
        value={type}
        onChange={handleTypeChange}
        error={errors.type}
        wrap
      />

      <ErrorNotice error={createAccount.error} />
    </ModalScreen>
  )
}
