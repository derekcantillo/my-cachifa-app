import React, { useCallback } from 'react'
import { Alert, StyleSheet, Text, View } from 'react-native'
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { Transaction } from '@/api/types'
import {
  Badge,
  Card,
  CategoryIcon,
  ErrorNotice,
  ModalHeaderAction,
  ModalScreen,
  PencilIcon,
  Separator,
  Skeleton,
  TrashIcon,
  WalletIcon,
} from '@/components'
import {
  useAccounts,
  useCategories,
  useDeleteTransaction,
  useTransaction,
} from '@/hooks'
import type { RootStackParamList } from '@/navigation/types'
import { useTheme } from '@/theme'
import {
  formatCurrency,
  formatFullDate,
  formatRelativeTime,
  indexById,
} from '@/utils'
import { SEMESTER_BONUS_TAG } from './useTransactionForm'

type DetailRoute = RouteProp<RootStackParamList, 'TransactionDetail'>
type DetailNavigation = NativeStackNavigationProp<
  RootStackParamList,
  'TransactionDetail'
>

const TITLES: Record<Transaction['kind'], string> = {
  expense: 'Detalle de Gasto',
  income: 'Detalle de Ingreso',
  saving: 'Detalle de Ahorro',
}

const TAG_LABELS: Record<string, string> = {
  [SEMESTER_BONUS_TAG]: 'Prima semestral',
  recurrente: 'Recurrente',
}

const ICON_SIZE = 96

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
    ? indexById(categoriesQuery.data ?? [])[transaction.categoryId]
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
              onSuccess: navigation.goBack,
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
    <ModalScreen
      title={transaction ? TITLES[transaction.kind] : 'Detalle'}
      onClose={navigation.goBack}
      brandTitle
      headerActions={
        transaction ? (
          <>
            <ModalHeaderAction
              accessibilityLabel="Editar movimiento"
              onPress={handleEdit}
              disabled={deleteTransaction.isPending}
            >
              <PencilIcon size={22} color={colors.text} />
            </ModalHeaderAction>
            <ModalHeaderAction
              accessibilityLabel="Eliminar movimiento"
              onPress={handleDelete}
              disabled={deleteTransaction.isPending}
            >
              <TrashIcon size={22} color={colors.negative} />
            </ModalHeaderAction>
          </>
        ) : null
      }
    >
      {transactionQuery.isPending ? (
        <View style={[styles.summary, { gap: spacing.sm }]}>
          <Skeleton
            height={ICON_SIZE}
            width={ICON_SIZE}
            radius={ICON_SIZE / 2}
          />
          <Skeleton height={28} width="60%" />
          <Skeleton height={14} width="40%" />
        </View>
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
          <View style={[styles.summary, { gap: spacing.sm }]}>
            <CategoryIcon
              icon={category?.icon ?? 'wallet'}
              categoryId={category?.id}
              size={ICON_SIZE}
              variant="muted"
            />

            <Badge label={category?.name ?? 'Sin categoría'} />

            <Text
              style={{
                color: amountColor,
                fontSize: typography.fontSizes.xxl,
                fontWeight: typography.fontWeights.bold,
              }}
            >
              {formatCurrency(
                transaction.kind === 'expense'
                  ? -transaction.amount
                  : transaction.amount,
                { signed: true },
              )}
            </Text>
          </View>

          <Card>
            <DetailRow
              label="Fecha"
              value={formatFullDate(new Date(transaction.date))}
            />
            <Separator />
            <DetailRow label="Descripción" value={transaction.description} />
            <Separator />
            <DetailRow
              label="Cuenta"
              value={account?.name ?? 'Sin cuenta'}
              icon={<WalletIcon size={18} color={colors.primary} />}
            />
            <Separator />
            <DetailRow
              label="Registrado"
              value={formatRelativeTime(transaction.createdAt)}
            />

            {transaction.tags.length > 0 && (
              <>
                <Separator />
                <View style={[styles.tagsRow, { paddingVertical: spacing.sm }]}>
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
                      <Badge
                        key={tag}
                        label={TAG_LABELS[tag] ?? tag}
                        tone={
                          tag === SEMESTER_BONUS_TAG ? 'primary' : 'positive'
                        }
                      />
                    ))}
                  </View>
                </View>
              </>
            )}
          </Card>

          <ErrorNotice error={deleteTransaction.error} />
        </>
      )}
    </ModalScreen>
  )
}

interface DetailRowProps {
  label: string
  value: string
  icon?: React.ReactNode
}

function DetailRow({ label, value, icon }: DetailRowProps) {
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

      <View style={[styles.rowValue, { gap: spacing.xs }]}>
        {icon}
        <Text
          style={[
            styles.rowText,
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
    </View>
  )
}

const styles = StyleSheet.create({
  summary: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  rowValue: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    marginLeft: 16,
  },
  rowText: {
    textAlign: 'right',
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
})
