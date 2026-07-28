import React, { useCallback, useState } from 'react'
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  AppHeader,
  Card,
  CategoryIcon,
  MonthSelector,
  Skeleton,
} from '@/components'
import { useTheme } from '@/theme'
import { formatCurrency, getCurrentMonthKey, type MonthKey } from '@/utils'
import { ExpenseDistributionCard, InsightCard } from './components'
import { useReportsData } from './useReportsData'

const NO_DATA_LABEL = 'Sin datos'

export function ReportsScreen() {
  const { colors, spacing, typography } = useTheme()
  const navigation = useNavigation()

  const [month, setMonth] = useState<MonthKey>(getCurrentMonthKey)

  const {
    topExpense,
    mostFrequent,
    saving,
    distribution,
    totalExpense,
    isLoading,
    isError,
    refetch,
  } = useReportsData(month)

  const openSettings = useCallback(() => {
    navigation.navigate('Settings')
  }, [navigation])

  const savingBeatsPlan = saving.difference >= 0

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <AppHeader onProfilePress={openSettings} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingTop: spacing.sm,
          paddingBottom: spacing.xxl,
          gap: spacing.md,
        }}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refetch} />
        }
      >
        <Text
          style={{
            color: colors.brand,
            fontSize: typography.fontSizes.xl,
            fontWeight: typography.fontWeights.bold,
          }}
        >
          Reportes
        </Text>

        <MonthSelector
          value={month}
          onChange={setMonth}
          maxMonth={getCurrentMonthKey()}
        />

        {isError ? (
          <Card>
            <Text
              style={{
                color: colors.negative,
                fontSize: typography.fontSizes.sm,
              }}
            >
              No pudimos cargar el reporte. Desliza hacia abajo para reintentar.
            </Text>
          </Card>
        ) : isLoading ? (
          [0, 1, 2].map(row => (
            <Card key={row}>
              <View style={{ gap: spacing.sm }}>
                <Skeleton height={12} width="40%" />
                <Skeleton height={20} width="65%" />
                <Skeleton height={12} width="50%" />
              </View>
            </Card>
          ))
        ) : (
          <>
            <InsightCard
              title="Mayor gasto"
              value={topExpense?.label ?? NO_DATA_LABEL}
              caption={
                topExpense
                  ? `${formatCurrency(topExpense.amount)} · ${Math.round(
                      topExpense.percentage,
                    )}% de tus gastos`
                  : 'No registraste gastos en este mes.'
              }
              icon={
                topExpense ? (
                  <CategoryIcon
                    icon={topExpense.category?.icon ?? 'wallet'}
                    categoryId={topExpense.category?.id}
                  />
                ) : undefined
              }
            />

            <InsightCard
              title="Ahorro real vs planeado"
              value={formatCurrency(saving.actual)}
              accent={savingBeatsPlan ? colors.positive : colors.warning}
              caption={
                saving.planned > 0
                  ? `Planeado ${formatCurrency(saving.planned)} · ${
                      savingBeatsPlan ? 'llevas' : 'te faltan'
                    } ${formatCurrency(Math.abs(saving.difference))}`
                  : 'Todavía no defines una meta de ahorro para este mes.'
              }
            />

            <InsightCard
              title="Categoría más frecuente"
              value={mostFrequent?.label ?? NO_DATA_LABEL}
              caption={
                mostFrequent
                  ? 'La que más veces aparece en tus movimientos.'
                  : 'No registraste movimientos en este mes.'
              }
              icon={
                mostFrequent ? (
                  <CategoryIcon
                    icon={mostFrequent.category?.icon ?? 'wallet'}
                    categoryId={mostFrequent.category?.id}
                  />
                ) : undefined
              }
            />

            <ExpenseDistributionCard
              slices={distribution}
              total={totalExpense}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
