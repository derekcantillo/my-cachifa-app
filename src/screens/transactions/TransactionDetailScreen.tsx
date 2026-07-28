import React, { useCallback } from 'react'
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native'
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { Transaction } from '@/api/types'
import {
  Badge,
  Button,
  Card,
  CategoryIcon,
  ErrorNotice,
  ModalHeader,
  PencilIcon,
  Separator,
  Skeleton,
  TrashIcon,
} from '@/components'
import {
  useAccounts,
  useCategories,
  useDeleteTransaction,
  useTransaction,
} from '@/hooks'
import type { RootStackParamList } from '@/navigation/types'
import { getCategoryColor, useTheme } from '@/theme'
import {
  formatCurrency,
  formatFullDate,
  indexById,
  formatRelativeTime,
} from '@/utils'
import { SEMESTER_BONUS_TAG } from './useTransactionForm'

type DetailRoute = RouteProp<RootStackParamList, 'TransactionDetail'>
type DetailNavigation = NativeStackNavigationProp<
  RootStackParamList,
  'TransactionDetail'
>

const KIND_LABELS: Record<Transaction['kind'], string> = {
  expense: 'Gasto',
  income: 'Ingreso',
  saving: 'Ahorro',
}

const TAG_LABELS: Record<string, string> = {
  [SEMESTER_BONUS_TAG]: 'Prima semestral',
  recurrente: 'Recurrente',
}

export function TransactionDetailScreen() {
  const { colors, spacing, typography } = useTheme()
  const navigation = useNavigation<DetailNavigation>()
  const route = useRoute<DetailRoute>()

  const { transactionId } = route.params

  const transactionQuery = useTransaction(transactionId)
  const categoriesQuery = useCategories()
  const accountsQuery = useAccounts()
  const deleteTransaction = useDeleteTransaction()

  const transaction = transactionQuery.data
  const category = transaction
    ? categoriesQuery.data?.find(item => item.id === transaction.categoryId)
    : undefined
  const account = transaction
    ? indexById(accountsQuery.data ?? [])[transaction.accountId]
    : undefined

  const handleEdit = useCallback(() => {
    navigation.replace('RegisterTransaction', { transactionId })
  }, [navigation, transactionId])

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Eliminar movimiento',
      '¿Seguro que quieres eliminarlo? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteTransaction.mutate(transactionId, {
              onSuccess: () => navigation.goBack(),
            })
          },
        },
      ],
    )
  }, [deleteTransaction, navigation, transactionId])

  const amountColor =
    transaction?.kind === 'income'
      ? colors.positive
      : transaction?.kind === 'saving'
      ? colors.primary
      : colors.text

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ModalHeader
        title="Detalle del movimiento"
        onClose={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={{
          padding: spacing.md,
          paddingBottom: spacing.xxl,
          gap: spacing.md,
        }}
      >
        {transactionQuery.isPending ? (
          <Card>
            <View style={{ gap: spacing.sm }}>
              <Skeleton height={56} width={56} radius={28} />
              <Skeleton height={28} width="60%" />
              <Skeleton height={14} width="40%" />
            </View>
          </Card>
        ) : !transaction ? (
          <Card>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typography.fontSizes.sm,
              }}
            >
              Este movimiento ya no existe.
            </Text>
          </Card>
        ) : (
          <>
            <Card>
              <View style={styles.summary}>
                <CategoryIcon
                  icon={category?.icon ?? 'wallet'}
                  categoryId={category?.id}
                  size={56}
                />

                <Text
                  style={{
                    color: amountColor,
                    fontSize: typography.fontSizes.xxl,
                    fontWeight: typography.fontWeights.bold,
                    marginTop: spacing.sm,
                  }}
                >
                  {formatCurrency(
                    transaction.kind === 'expense'
                      ? -transaction.amount
                      : transaction.amount,
                    { signed: true },
                  )}
                </Text>

                <Text
                  style={{
                    color: colors.text,
                    fontSize: typography.fontSizes.md,
                    fontWeight: typography.fontWeights.semibold,
                    marginTop: spacing.xs,
                  }}
                >
                  {transaction.description}
                </Text>

                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: typography.fontSizes.sm,
                  }}
                >
                  {formatFullDate(new Date(transaction.date))}
                </Text>

                <View style={{ marginTop: spacing.sm }}>
                  <Badge
                    label={KIND_LABELS[transaction.kind]}
                    color={getCategoryColor(category)}
                  />
                </View>
              </View>
            </Card>

            <Card>
              <DetailRow
                label="Categoría"
                value={category?.name ?? 'Sin categoría'}
              />
              <Separator />
              <DetailRow label="Cuenta" value={account?.name ?? 'Sin cuenta'} />
              <Separator />
              <DetailRow
                label="Registrado"
                value={formatRelativeTime(transaction.createdAt)}
              />

              {transaction.tags.length > 0 && (
                <>
                  <Separator />
                  <View
                    style={{ paddingVertical: spacing.sm, gap: spacing.xs }}
                  >
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontSize: typography.fontSizes.sm,
                      }}
                    >
                      Etiquetas
                    </Text>
                    <View style={[styles.tags, { gap: spacing.xs }]}>
                      {transaction.tags.map(tag => (
                        <Badge key={tag} label={TAG_LABELS[tag] ?? tag} />
                      ))}
                    </View>
                  </View>
                </>
              )}
            </Card>

            <ErrorNotice error={deleteTransaction.error} />

            <View style={{ gap: spacing.sm }}>
              <Button
                label="Editar"
                onPress={handleEdit}
                icon={<PencilIcon size={18} color={colors.brandText} />}
                disabled={deleteTransaction.isPending}
              />
              <Button
                label="Eliminar"
                variant="danger"
                onPress={handleDelete}
                loading={deleteTransaction.isPending}
                icon={<TrashIcon size={18} color={colors.negative} />}
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

interface DetailRowProps {
  label: string
  value: string
}

function DetailRow({ label, value }: DetailRowProps) {
  const { colors, spacing, typography } = useTheme()

  return (
    <View style={[styles.row, { paddingVertical: spacing.sm }]}>
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: typography.fontSizes.sm,
        }}
      >
        {label}
      </Text>
      <Text
        numberOfLines={1}
        style={[
          styles.rowValue,
          {
            color: colors.text,
            fontSize: typography.fontSizes.sm,
            fontWeight: typography.fontWeights.medium,
          },
        ]}
      >
        {value}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summary: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowValue: {
    flexShrink: 1,
    marginLeft: 16,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
})
