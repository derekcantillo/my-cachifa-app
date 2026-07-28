import React, { useCallback } from 'react'
import {
  Alert,
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
import {
  Button,
  Card,
  CategoryIcon,
  CurrencyField,
  ErrorNotice,
  ModalHeader,
  SectionHeader,
  Separator,
  Skeleton,
} from '@/components'
import { useResetBudgets, useUpdateBudgets } from '@/hooks'
import type { RootStackParamList } from '@/navigation/types'
import { useTheme } from '@/theme'
import { formatCurrency, formatMonthYear } from '@/utils'
import { useBudgetPlanner, type BudgetPlanRow } from './useBudgetPlanner'

type BudgetRoute = RouteProp<RootStackParamList, 'BudgetManagement'>

export function BudgetManagementScreen() {
  const { colors, spacing, typography } = useTheme()
  const navigation = useNavigation()
  const route = useRoute<BudgetRoute>()

  const { month } = route.params
  const plan = useBudgetPlanner(month)

  const updateBudgets = useUpdateBudgets()
  const resetBudgets = useResetBudgets()

  const busy = updateBudgets.isPending || resetBudgets.isPending

  const handleSave = useCallback(() => {
    updateBudgets.mutate(
      { month, limits: plan.changedLimits() },
      {
        onSuccess: () => {
          plan.discardChanges()
          navigation.goBack()
        },
      },
    )
  }, [month, navigation, plan, updateBudgets])

  const handleReset = useCallback(() => {
    Alert.alert(
      'Resetear el mes',
      `Se borrarán todos los límites de ${formatMonthYear(
        month,
      )}. Podrás definirlos de nuevo desde cero.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetear',
          style: 'destructive',
          onPress: () => {
            resetBudgets.mutate(month, { onSuccess: plan.discardChanges })
          },
        },
      ],
    )
  }, [month, plan, resetBudgets])

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ModalHeader title="Gestionar presupuesto" onClose={navigation.goBack} />

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
          <Card>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typography.fontSizes.sm,
              }}
            >
              {`Plan de ${formatMonthYear(month)}`}
            </Text>
            <Text
              style={{
                color: colors.text,
                fontSize: typography.fontSizes.xxl,
                fontWeight: typography.fontWeights.bold,
              }}
            >
              {formatCurrency(plan.totalPlanned)}
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typography.fontSizes.xs,
              }}
            >
              {plan.totalSaving > 0
                ? `Total planeado en gastos · meta de ahorro ${formatCurrency(
                    plan.totalSaving,
                  )}`
                : 'Total planeado en gastos'}
            </Text>
          </Card>

          {plan.isLoading ? (
            <Card>
              <View style={{ gap: spacing.md }}>
                {[0, 1, 2, 3].map(row => (
                  <Skeleton key={row} height={44} radius={14} />
                ))}
              </View>
            </Card>
          ) : plan.isError ? (
            <Card>
              <Text
                style={{
                  color: colors.negative,
                  fontSize: typography.fontSizes.sm,
                }}
              >
                No pudimos cargar tu presupuesto. Cierra y vuelve a intentarlo.
              </Text>
            </Card>
          ) : (
            <>
              <View style={{ gap: spacing.sm }}>
                <SectionHeader title="Límites por categoría" />
                <Card>
                  {plan.expenseRows.map((row, index) => (
                    <View key={row.category.id}>
                      {index > 0 && <Separator />}
                      <LimitRow row={row} onChange={plan.setLimit} />
                    </View>
                  ))}
                </Card>
              </View>

              {plan.savingRows.length > 0 && (
                <View style={{ gap: spacing.sm }}>
                  <SectionHeader title="Meta de ahorro" />
                  <Card>
                    {plan.savingRows.map((row, index) => (
                      <View key={row.category.id}>
                        {index > 0 && <Separator />}
                        <LimitRow row={row} onChange={plan.setLimit} />
                      </View>
                    ))}
                  </Card>
                </View>
              )}
            </>
          )}

          <ErrorNotice error={updateBudgets.error ?? resetBudgets.error} />

          <View style={{ gap: spacing.sm }}>
            <Button
              label="Guardar cambios"
              onPress={handleSave}
              loading={updateBudgets.isPending}
              disabled={!plan.hasChanges || busy}
            />
            <Button
              label="Resetear mes"
              variant="danger"
              onPress={handleReset}
              loading={resetBudgets.isPending}
              disabled={busy}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

interface LimitRowProps {
  row: BudgetPlanRow
  onChange: (categoryId: string, limit: number) => void
}

/** One category with its editable limit; zero clears the budget on save. */
function LimitRow({ row, onChange }: LimitRowProps) {
  const { spacing } = useTheme()

  const handleChange = useCallback(
    (limit: number) => {
      onChange(row.category.id, limit)
    },
    [onChange, row.category.id],
  )

  return (
    <View
      style={[
        styles.limitRow,
        { gap: spacing.md, paddingVertical: spacing.sm },
      ]}
    >
      <CategoryIcon
        icon={row.category.icon}
        categoryId={row.category.id}
        size={36}
      />

      <View style={styles.limitField}>
        <CurrencyField
          label={row.category.name}
          value={row.limit}
          onChange={handleChange}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  limitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  limitField: {
    flex: 1,
  },
})
