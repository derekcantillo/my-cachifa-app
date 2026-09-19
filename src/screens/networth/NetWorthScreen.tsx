import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NetWorth } from '@/api/types'
import {
  Card,
  ChartIcon,
  EmptyState,
  ModalScreen,
  Separator,
  Skeleton,
} from '@/components'
import { useNetWorth } from '@/hooks'
import { useTheme } from '@/theme'
import { formatCurrency, formatFullDate, withAlpha } from '@/utils'

const COMING_SOON_LABEL = 'Próximamente'

/**
 * Everything owned minus everything owed, as of today. Unlike the rest of the
 * app this is a snapshot, not a period, so the header carries today's date.
 */
export function NetWorthScreen() {
  const { colors, spacing, typography } = useTheme()
  const navigation = useNavigation()
  const netWorthQuery = useNetWorth()

  return (
    <ModalScreen title="Patrimonio Neto" onClose={navigation.goBack}>
      <Text
        style={[
          styles.centered,
          { color: colors.textSecondary, fontSize: typography.fontSizes.sm },
        ]}
      >
        {`Tu foto financiera de hoy, ${formatFullDate()}`}
      </Text>

      {netWorthQuery.isPending ? (
        <View style={{ gap: spacing.md }}>
          {[0, 1, 2].map(card => (
            <Card key={card}>
              <View style={{ gap: spacing.sm }}>
                <Skeleton height={14} width="40%" />
                <Skeleton height={20} width="80%" />
                <Skeleton height={20} width="70%" />
              </View>
            </Card>
          ))}
        </View>
      ) : netWorthQuery.isError || !netWorthQuery.data ? (
        <Card>
          <EmptyState
            icon={<ChartIcon size={26} color={colors.textSecondary} />}
            title="No pudimos calcular tu patrimonio"
            description="Revisa tu conexión y vuelve a intentarlo."
            actionLabel="Reintentar"
            onAction={() => netWorthQuery.refetch()}
          />
        </Card>
      ) : (
        <NetWorthBreakdown netWorth={netWorthQuery.data} />
      )}
    </ModalScreen>
  )
}

function NetWorthBreakdown({ netWorth }: { netWorth: NetWorth }) {
  const { colors, spacing, typography } = useTheme()
  const { assets, liabilities } = netWorth

  const hasLiabilities =
    liabilities.debts !== 0 || liabilities.creditCardsDebt !== 0
  const totalColor = netWorth.netWorth < 0 ? colors.negative : colors.positive

  return (
    <>
      <Card title="Activos">
        <AmountRow label="Saldo en cuentas" amount={assets.accountsBalance} />
        <Separator />
        <AmountRow label="Préstamos por cobrar" amount={assets.receivables} />
        <Separator />
        <AmountRow label="Ahorro en metas" amount={assets.goalsSavings} />
        <Separator />
        <AmountRow
          label="Cupo disponible en tarjetas"
          amount={assets.creditCardsAvailable}
          comingSoonWhenZero
        />
      </Card>

      <Card title="Pasivos">
        {hasLiabilities ? (
          <>
            <AmountRow
              label="Deudas"
              amount={liabilities.debts}
              comingSoonWhenZero
            />
            <Separator />
            <AmountRow
              label="Deuda en tarjetas"
              amount={liabilities.creditCardsDebt}
              comingSoonWhenZero
            />
          </>
        ) : (
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: typography.fontSizes.sm,
            }}
          >
            {`${COMING_SOON_LABEL} — deudas y tarjetas`}
          </Text>
        )}
      </Card>

      <View
        style={[
          styles.total,
          {
            backgroundColor: withAlpha(totalColor, 0.12),
            padding: spacing.lg,
            gap: spacing.xs,
          },
        ]}
      >
        <Text
          style={[
            styles.totalLabel,
            {
              color: totalColor,
              fontSize: typography.fontSizes.xs,
              fontWeight: typography.fontWeights.semibold,
            },
          ]}
        >
          Patrimonio Neto
        </Text>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          accessibilityLabel={`Patrimonio neto ${formatCurrency(
            netWorth.netWorth,
          )}`}
          style={{
            color: totalColor,
            fontSize: typography.fontSizes.xxl,
            fontWeight: typography.fontWeights.bold,
          }}
        >
          {formatCurrency(netWorth.netWorth)}
        </Text>
      </View>
    </>
  )
}

interface AmountRowProps {
  label: string
  amount: number
  /**
   * For figures the backend does not track yet: a 0 there means "not
   * available", not "you have nothing", so it reads as coming soon instead.
   */
  comingSoonWhenZero?: boolean
}

function AmountRow({
  label,
  amount,
  comingSoonWhenZero = false,
}: AmountRowProps) {
  const { colors, spacing, typography } = useTheme()
  const comingSoon = comingSoonWhenZero && amount === 0
  const tone = comingSoon ? colors.textSecondary : colors.text

  return (
    <View
      style={[styles.row, { paddingVertical: spacing.sm, gap: spacing.sm }]}
    >
      <Text
        style={[
          styles.rowLabel,
          { color: tone, fontSize: typography.fontSizes.md },
        ]}
      >
        {label}
      </Text>
      <Text
        style={{
          color: tone,
          fontSize: comingSoon
            ? typography.fontSizes.sm
            : typography.fontSizes.md,
          fontWeight: comingSoon
            ? typography.fontWeights.medium
            : typography.fontWeights.semibold,
        }}
      >
        {comingSoon ? COMING_SOON_LABEL : formatCurrency(amount)}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  centered: {
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowLabel: {
    flex: 1,
  },
  total: {
    alignItems: 'center',
    borderRadius: 16,
  },
  totalLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
})
