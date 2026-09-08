import React, { useCallback, useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { setHasApiKey } from '@/api/apiKeyGate'
import { setApiKeyCache } from '@/api/httpClient'
import { clearApiKey } from '@/api/secureStorage'
import {
  Button,
  Card,
  CategoryIcon,
  ErrorNotice,
  ModalScreen,
  PlusCircleIcon,
  Separator,
  Skeleton,
  TextField,
} from '@/components'
import {
  useCategories,
  useRecurringExpenses,
  useSettings,
  useUpdateSettings,
} from '@/hooks'
import { useTheme } from '@/theme'
import { indexById } from '@/utils'
import { RecurringExpenseListItem } from './components'

export function SettingsScreen() {
  const { colors, spacing, typography } = useTheme()
  const navigation = useNavigation()

  const expensesQuery = useRecurringExpenses()
  const categoriesQuery = useCategories()
  const categoriesById = indexById(categoriesQuery.data ?? [])

  const openAddExpense = useCallback(() => {
    navigation.navigate('RecurringExpenseForm')
  }, [navigation])

  const openEditExpense = useCallback(
    (id: string) => {
      navigation.navigate('RecurringExpenseForm', { recurringExpenseId: id })
    },
    [navigation],
  )

  const openLoans = useCallback(() => {
    navigation.navigate('Loans')
  }, [navigation])

  const handleChangeApiKey = useCallback(async () => {
    await clearApiKey()
    setApiKeyCache(null)
    setHasApiKey(false)
  }, [])

  return (
    <ModalScreen title="Ajustes" onClose={navigation.goBack}>
      <View style={{ gap: spacing.xs }}>
        <Text
          style={{
            color: colors.text,
            fontSize: typography.fontSizes.lg,
            fontWeight: typography.fontWeights.bold,
          }}
        >
          Gastos fijos
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: typography.fontSizes.sm,
          }}
        >
          Compromisos que se repiten cada mes, como el arriendo. Fijan el
          presupuesto de su categoría por encima de cualquier regla de
          porcentaje.
        </Text>
      </View>

      <Card>
        {expensesQuery.isPending ? (
          <View style={{ gap: spacing.md }}>
            <Skeleton height={44} radius={14} />
            <Skeleton height={44} radius={14} />
          </View>
        ) : expensesQuery.isError ? (
          <Text
            style={{ color: colors.negative, fontSize: typography.fontSizes.sm }}
          >
            No pudimos cargar tus gastos fijos.
          </Text>
        ) : (
          (expensesQuery.data ?? []).map((expense, index) => (
            <View key={expense.id}>
              {index > 0 && <Separator />}
              <RecurringExpenseListItem
                expense={expense}
                category={categoriesById[expense.categoryId]}
                onPress={item => openEditExpense(item.id)}
              />
            </View>
          ))
        )}

        <Separator />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Agregar gasto fijo"
          onPress={openAddExpense}
          style={({ pressed }) => [
            styles.addRow,
            { gap: spacing.sm, paddingVertical: spacing.md },
            pressed && styles.pressed,
          ]}
        >
          <PlusCircleIcon size={22} color={colors.primary} />
          <Text
            style={{
              color: colors.primary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.semibold,
            }}
          >
            Agregar gasto fijo
          </Text>
        </Pressable>
      </Card>

      <SavingsTargetCard />

      <Button
        label="Préstamos"
        variant="outline"
        onPress={openLoans}
        icon={<CategoryIcon icon="loan" categoryId="LOAN" variant="plain" size={18} />}
      />

      <Button
        label="Cambiar API Key"
        variant="outline"
        onPress={handleChangeApiKey}
      />
    </ModalScreen>
  )
}

/** % of the discretionary income the plan recommends setting aside for goals. */
function SavingsTargetCard() {
  const { colors, spacing, typography } = useTheme()

  const settingsQuery = useSettings()
  const updateSettings = useUpdateSettings()

  const [value, setValue] = useState('')

  // Seeds the field once the current value loads; typing afterwards is local
  // until "Guardar" is pressed.
  useEffect(() => {
    if (settingsQuery.data) {
      setValue(String(settingsQuery.data.targetSavingsPercentage))
    }
  }, [settingsQuery.data])

  const parsed = Number(value)
  const isValid = value.trim() !== '' && Number.isFinite(parsed) && parsed >= 0 && parsed <= 100
  const hasChanged =
    settingsQuery.data !== undefined &&
    isValid &&
    parsed !== settingsQuery.data.targetSavingsPercentage

  const handleSave = useCallback(() => {
    if (!isValid) return
    updateSettings.mutate({ targetSavingsPercentage: parsed })
  }, [isValid, parsed, updateSettings])

  return (
    <View style={{ gap: spacing.xs }}>
      <Text
        style={{
          color: colors.text,
          fontSize: typography.fontSizes.lg,
          fontWeight: typography.fontWeights.bold,
        }}
      >
        % de ahorro objetivo
      </Text>
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: typography.fontSizes.sm,
        }}
      >
        Qué parte de tu ingreso disponible (ya descontados los gastos fijos)
        el plan recomienda destinar a tus metas cada mes.
      </Text>

      <Card>
        {settingsQuery.isPending ? (
          <Skeleton height={44} radius={14} />
        ) : settingsQuery.isError ? (
          <Text
            style={{ color: colors.negative, fontSize: typography.fontSizes.sm }}
          >
            No pudimos cargar tu meta de ahorro.
          </Text>
        ) : (
          <View style={{ gap: spacing.md }}>
            <TextField
              label="% de ahorro objetivo"
              value={value}
              onChangeText={setValue}
              placeholder="30"
              keyboardType="number-pad"
              error={
                value.trim() !== '' && !isValid
                  ? 'Ingresa un porcentaje entre 0 y 100.'
                  : undefined
              }
            />
            <Button
              label="Guardar"
              onPress={handleSave}
              loading={updateSettings.isPending}
              disabled={!hasChanged}
            />
          </View>
        )}
      </Card>

      <ErrorNotice error={updateSettings.error} />
    </View>
  )
}

const styles = StyleSheet.create({
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
})
