import React, { useCallback, useState } from 'react'
import { Alert, StyleSheet, Text, View } from 'react-native'
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { Loan, LoanStatus } from '@/api/types'
import {
  Badge,
  Button,
  CalendarIcon,
  Card,
  CurrencyField,
  DateField,
  ErrorNotice,
  ModalScreen,
  PencilIcon,
  PlusIcon,
  Separator,
  Skeleton,
  TextField,
  TrashIcon,
  type BadgeTone,
} from '@/components'
import { useCreateLoanRepayment, useDeleteLoan, useLoan } from '@/hooks'
import type { RootStackParamList } from '@/navigation/types'
import { useTheme } from '@/theme'
import {
  formatCurrency,
  formatRelativeTime,
  formatShortDate,
  withAlpha,
} from '@/utils'

type LoanDetailRoute = RouteProp<RootStackParamList, 'LoanDetail'>
type LoanDetailNavigation = NativeStackNavigationProp<
  RootStackParamList,
  'LoanDetail'
>

const STATUS_LABELS: Record<LoanStatus, string> = {
  active: 'Activo',
  partially_paid: 'Parcial',
  paid: 'Pagado',
}

const STATUS_TONES: Record<LoanStatus, BadgeTone> = {
  active: 'neutral',
  partially_paid: 'warning',
  paid: 'positive',
}

const REPAYMENT_ICON = '💵'

export function LoanDetailScreen() {
  const { colors, spacing, typography } = useTheme()
  const navigation = useNavigation<LoanDetailNavigation>()
  const route = useRoute<LoanDetailRoute>()

  const { loanId } = route.params
  const loanQuery = useLoan(loanId)
  const loan = loanQuery.data

  return (
    <ModalScreen title="Detalle del préstamo" onClose={navigation.goBack}>
      {loanQuery.isPending ? (
        <Card>
          <Skeleton height={24} width="60%" />
          <View style={{ marginTop: spacing.md }}>
            <Skeleton height={72} radius={14} />
          </View>
        </Card>
      ) : !loan ? (
        <Card>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: typography.fontSizes.sm,
            }}
          >
            Este préstamo ya no existe.
          </Text>
        </Card>
      ) : (
        <LoanDetail loan={loan} />
      )}
    </ModalScreen>
  )
}

interface LoanDetailProps {
  loan: Loan
}

function LoanDetail({ loan }: LoanDetailProps) {
  const { colors, spacing, typography } = useTheme()
  const navigation = useNavigation<LoanDetailNavigation>()

  const [amount, setAmount] = useState(0)
  const [paidAt, setPaidAt] = useState(new Date())
  const [note, setNote] = useState('')
  const [composerOpen, setComposerOpen] = useState(false)

  const addRepayment = useCreateLoanRepayment()
  const deleteLoan = useDeleteLoan()

  const hasRepayments = loan.amountRepaid > 0

  const handleRegisterRepayment = useCallback(() => {
    if (amount <= 0) {
      return
    }

    addRepayment.mutate(
      {
        id: loan.id,
        input: {
          amount,
          paidAt: paidAt.toISOString(),
          note: note.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setAmount(0)
          setPaidAt(new Date())
          setNote('')
          setComposerOpen(false)
        },
      },
    )
  }, [addRepayment, amount, loan.id, note, paidAt])

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Eliminar préstamo',
      `¿Seguro que quieres eliminar el préstamo a "${loan.borrowerName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteLoan.mutate(loan.id, { onSuccess: navigation.goBack })
          },
        },
      ],
    )
  }, [deleteLoan, loan.borrowerName, loan.id, navigation])

  return (
    <>
      <View style={[styles.heading, { gap: spacing.sm }]}>
        <Text
          style={{
            color: colors.text,
            fontSize: typography.fontSizes.xl,
            fontWeight: typography.fontWeights.bold,
          }}
        >
          {loan.borrowerName}
        </Text>
        <Badge
          label={STATUS_LABELS[loan.status]}
          tone={STATUS_TONES[loan.status]}
        />
      </View>

      <Card>
        <View style={styles.amounts}>
          <View>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typography.fontSizes.sm,
              }}
            >
              Recuperado
            </Text>
            <Text
              style={{
                color: colors.positive,
                fontSize: typography.fontSizes.lg,
                fontWeight: typography.fontWeights.bold,
              }}
            >
              {formatCurrency(loan.amountRepaid)}
            </Text>
          </View>

          <View style={styles.amountRight}>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typography.fontSizes.sm,
              }}
            >
              Pendiente
            </Text>
            <Text
              style={{
                color: colors.text,
                fontSize: typography.fontSizes.lg,
                fontWeight: typography.fontWeights.bold,
              }}
            >
              {formatCurrency(loan.remainingAmount)}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: spacing.md }}>
          <Separator />
        </View>

        <View style={{ marginTop: spacing.md, gap: spacing.xs }}>
          <Row label="Monto total" value={formatCurrency(loan.amount)} />
          <Row
            label="Fecha del préstamo"
            value={formatShortDate(new Date(loan.loanDate))}
          />
          {loan.dueDate ? (
            <Row
              label="Fecha límite"
              value={formatShortDate(new Date(loan.dueDate))}
            />
          ) : null}
          {loan.note ? <Row label="Nota" value={loan.note} /> : null}
        </View>
      </Card>

      <Card>
        <View style={[styles.cardHeading, { gap: spacing.sm }]}>
          <CalendarIcon size={20} color={colors.primary} />
          <Text
            style={{
              color: colors.text,
              fontSize: typography.fontSizes.lg,
              fontWeight: typography.fontWeights.semibold,
            }}
          >
            Registrar pago recibido
          </Text>
        </View>

        <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
          {loan.status === 'paid' ? (
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typography.fontSizes.sm,
              }}
            >
              Este préstamo ya está pagado por completo.
            </Text>
          ) : (
            <>
              {composerOpen && (
                <>
                  <CurrencyField
                    label="¿Cuánto te pagaron?"
                    value={amount}
                    onChange={setAmount}
                    autoFocus
                  />
                  <DateField
                    label="Fecha del pago"
                    value={paidAt}
                    onChange={setPaidAt}
                    maximumDate={new Date()}
                  />
                  <TextField
                    label="Nota (opcional)"
                    value={note}
                    onChangeText={setNote}
                    placeholder="Ej: Segundo abono"
                    tone="filled"
                  />
                </>
              )}

              <ErrorNotice error={addRepayment.error} />

              <Button
                label={composerOpen ? 'Guardar pago' : 'Registrar pago recibido'}
                onPress={
                  composerOpen
                    ? handleRegisterRepayment
                    : () => setComposerOpen(true)
                }
                loading={addRepayment.isPending}
                disabled={composerOpen && amount <= 0}
                icon={<PlusIcon size={18} color={colors.brandText} />}
              />

              {composerOpen && (
                <Button
                  label="Cancelar"
                  variant="ghost"
                  onPress={() => {
                    setComposerOpen(false)
                    setAmount(0)
                    setNote('')
                  }}
                />
              )}
            </>
          )}
        </View>
      </Card>

      <Card title="Historial de pagos">
        {loan.repayments.length === 0 ? (
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: typography.fontSizes.sm,
            }}
          >
            Todavía no registras pagos de este préstamo.
          </Text>
        ) : (
          loan.repayments.map((repayment, index) => (
            <View key={repayment.id}>
              {index > 0 && <Separator />}
              <View
                style={[
                  styles.historyRow,
                  { gap: spacing.sm, paddingVertical: spacing.sm },
                ]}
              >
                <View
                  style={[
                    styles.historyIcon,
                    { backgroundColor: withAlpha(colors.positive, 0.16) },
                  ]}
                >
                  <Text style={styles.historyGlyph}>{REPAYMENT_ICON}</Text>
                </View>

                <View style={styles.historyBody}>
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: typography.fontSizes.sm,
                      fontWeight: typography.fontWeights.medium,
                    }}
                  >
                    {repayment.note ?? 'Pago recibido'}
                  </Text>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: typography.fontSizes.xs,
                    }}
                  >
                    {formatRelativeTime(repayment.paidAt)}
                  </Text>
                </View>

                <Text
                  style={{
                    color: colors.positive,
                    fontSize: typography.fontSizes.sm,
                    fontWeight: typography.fontWeights.semibold,
                  }}
                >
                  {formatCurrency(repayment.amount, { signed: true })}
                </Text>
              </View>
            </View>
          ))
        )}
      </Card>

      <Card title="Acciones">
        <View style={{ gap: spacing.sm }}>
          <ErrorNotice error={deleteLoan.error} />

          <Button
            label="Editar préstamo"
            variant="outline"
            onPress={() => navigation.navigate('CreateLoan', { loanId: loan.id })}
            icon={<PencilIcon size={18} color={colors.primary} />}
          />

          <Button
            label="Eliminar préstamo"
            variant="danger"
            onPress={handleDelete}
            loading={deleteLoan.isPending}
            disabled={hasRepayments}
            icon={<TrashIcon size={18} color={colors.negative} />}
          />

          {hasRepayments ? (
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typography.fontSizes.xs,
              }}
            >
              No puedes eliminar un préstamo con pagos registrados — ya tiene
              historial financiero. Espera a que se complete o llévalo a cero
              con abonos.
            </Text>
          ) : null}
        </View>
      </Card>
    </>
  )
}

interface RowProps {
  label: string
  value: string
}

function Row({ label, value }: RowProps) {
  const { colors, typography } = useTheme()

  return (
    <View style={styles.detailRow}>
      <Text
        style={{ color: colors.textSecondary, fontSize: typography.fontSizes.sm }}
      >
        {label}
      </Text>
      <Text
        numberOfLines={1}
        style={[
          styles.detailValue,
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

const HISTORY_ICON_SIZE = 36

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  amounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountRight: {
    alignItems: 'flex-end',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  detailValue: {
    flexShrink: 1,
    textAlign: 'right',
  },
  cardHeading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyIcon: {
    width: HISTORY_ICON_SIZE,
    height: HISTORY_ICON_SIZE,
    borderRadius: HISTORY_ICON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyGlyph: {
    fontSize: 18,
  },
  historyBody: {
    flex: 1,
  },
})
