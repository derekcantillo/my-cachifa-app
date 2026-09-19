import React, { useCallback, useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native'
import {
  Button,
  Card,
  CategoryIcon,
  CheckCircleIcon,
  ErrorNotice,
  ModalScreen,
  OptionChips,
  PlusCircleIcon,
  RefreshIcon,
  Separator,
  Skeleton,
  WalletIcon,
  type ChipOption,
} from '@/components'
import { useFinancialPeriods, useResetBudgets, useUpdateBudgets } from '@/hooks'
import type { RootStackParamList } from '@/navigation/types'
import { getCategoryColor, useTheme } from '@/theme'
import { formatCurrency, withAlpha } from '@/utils'
import { BudgetLimitRow } from './components'
import { useBudgetPlanner } from './useBudgetPlanner'

type BudgetRoute = RouteProp<RootStackParamList, 'BudgetManagement'>

export function BudgetManagementScreen() {
  const { colors, spacing, typography } = useTheme()
  const navigation = useNavigation()
  const route = useRoute<BudgetRoute>()

  const { periodId } = route.params
  const plan = useBudgetPlanner(periodId)

  const periodsQuery = useFinancialPeriods()
  const periodLabel =
    periodsQuery.data?.find(period => period.id === periodId)?.label ??
    'este período'

  const [pickerOpen, setPickerOpen] = useState(false)

  const updateBudgets = useUpdateBudgets()
  const resetBudgets = useResetBudgets()

  const busy = updateBudgets.isPending || resetBudgets.isPending

  const handleSave = useCallback(() => {
    updateBudgets.mutate(
      { periodId, limits: plan.changedLimits() },
      {
        onSuccess: () => {
          plan.discardChanges()
          navigation.goBack()
        },
      },
    )
  }, [navigation, periodId, plan, updateBudgets])

  const handleReset = useCallback(() => {
    Alert.alert(
      'Resetear el período',
      `Se borrarán todos los límites de ${periodLabel}. Podrás definirlos de nuevo desde cero.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetear',
          style: 'destructive',
          onPress: () => {
            resetBudgets.mutate(periodId, { onSuccess: plan.discardChanges })
          },
        },
      ],
    )
  }, [periodId, periodLabel, plan, resetBudgets])

  const handleAddCategory = useCallback(
    (categoryId: string) => {
      plan.addCategory(categoryId)
      setPickerOpen(false)
    },
    [plan],
  )

  const categoryOptions: ChipOption[] = plan.availableCategories.map(
    category => ({
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
    }),
  )

  return (
    <ModalScreen
      title="Gestión de Presupuesto"
      onClose={navigation.goBack}
      footer={
        <Button
          label="Guardar cambios"
          onPress={handleSave}
          loading={updateBudgets.isPending}
          disabled={!plan.hasChanges || busy}
          icon={<CheckCircleIcon size={20} color={colors.brandText} />}
        />
      }
    >
      <Text
        style={[
          styles.intro,
          {
            color: colors.textSecondary,
            fontSize: typography.fontSizes.sm,
          },
        ]}
      >
        {`Ajusta los límites para cada categoría de ${periodLabel}. Mantén tus metas claras y realistas.`}
      </Text>

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
          <Card>
            {plan.expenseRows.length === 0 ? (
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: typography.fontSizes.sm,
                }}
              >
                Este período no tiene límites definidos. Añade una categoría
                para empezar.
              </Text>
            ) : (
              plan.expenseRows.map((row, index) => (
                <View key={row.category.id}>
                  {index > 0 && <Separator />}
                  <BudgetLimitRow
                    row={row}
                    onChange={plan.setLimit}
                    autoEdit={row.isNew}
                  />
                </View>
              ))
            )}

            {plan.availableCategories.length > 0 && (
              <>
                <Separator />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Añadir categoría"
                  onPress={() => setPickerOpen(open => !open)}
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
                    Añadir Categoría
                  </Text>
                </Pressable>
              </>
            )}

            {pickerOpen && (
              <View style={{ paddingBottom: spacing.sm }}>
                <OptionChips
                  options={categoryOptions}
                  value={null}
                  onChange={handleAddCategory}
                  wrap
                />
              </View>
            )}
          </Card>

          {plan.savingRows.length > 0 && (
            <Card title="Meta de ahorro">
              {plan.savingRows.map((row, index) => (
                <View key={row.category.id}>
                  {index > 0 && <Separator />}
                  <BudgetLimitRow row={row} onChange={plan.setLimit} />
                </View>
              ))}
            </Card>
          )}

          <View
            style={[
              styles.total,
              {
                backgroundColor: withAlpha(colors.primary, 0.12),
                padding: spacing.md,
                gap: spacing.md,
              },
            ]}
          >
            <View style={styles.totalBody}>
              <Text
                style={[
                  styles.totalLabel,
                  {
                    color: colors.primary,
                    fontSize: typography.fontSizes.xs,
                    fontWeight: typography.fontWeights.semibold,
                  },
                ]}
              >
                Presupuesto total planeado
              </Text>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={{
                  color: colors.text,
                  fontSize: typography.fontSizes.xxl,
                  fontWeight: typography.fontWeights.bold,
                }}
              >
                {formatCurrency(plan.totalPlanned)}
              </Text>
            </View>

            <View
              style={[styles.totalIcon, { backgroundColor: colors.surface }]}
            >
              <WalletIcon size={22} color={colors.primary} />
            </View>
          </View>

          <ErrorNotice error={updateBudgets.error ?? resetBudgets.error} />

          <Button
            label="Resetear período"
            variant="danger"
            onPress={handleReset}
            loading={resetBudgets.isPending}
            disabled={busy}
            icon={<RefreshIcon size={18} color={colors.negative} />}
          />
        </>
      )}
    </ModalScreen>
  )
}

const TOTAL_ICON_SIZE = 44

const styles = StyleSheet.create({
  intro: {
    textAlign: 'center',
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  total: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
  },
  totalBody: {
    flex: 1,
  },
  totalLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  totalIcon: {
    width: TOTAL_ICON_SIZE,
    height: TOTAL_ICON_SIZE,
    borderRadius: TOTAL_ICON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
})
