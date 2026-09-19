import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Card, ChevronRightIcon, Skeleton } from '@/components'
import { useNetWorth } from '@/hooks'
import { useTheme } from '@/theme'
import { formatCurrency } from '@/utils'

interface TotalBalanceCardProps {
  onNetWorthPress: () => void
}

/**
 * What all the accounts hold together right now — the day-to-day number —
 * with the way into the full net worth breakdown. Loads on its own so a slow
 * or failed snapshot never holds up the rest of Inicio.
 */
export function TotalBalanceCard({ onNetWorthPress }: TotalBalanceCardProps) {
  const { colors, spacing, typography } = useTheme()
  const netWorthQuery = useNetWorth()
  const balance = netWorthQuery.data?.assets.accountsBalance

  return (
    <Card>
      <View style={{ gap: spacing.xs }}>
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: typography.fontSizes.sm,
            fontWeight: typography.fontWeights.medium,
          }}
        >
          Saldo total
        </Text>

        {netWorthQuery.isPending ? (
          <Skeleton height={32} width="60%" />
        ) : balance === undefined ? (
          <Text
            style={{
              color: colors.negative,
              fontSize: typography.fontSizes.sm,
            }}
          >
            No pudimos cargar tu saldo.
          </Text>
        ) : (
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{
              color: balance < 0 ? colors.negative : colors.text,
              fontSize: typography.fontSizes.xxl,
              fontWeight: typography.fontWeights.bold,
            }}
          >
            {formatCurrency(balance)}
          </Text>
        )}

        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Ver patrimonio"
          onPress={onNetWorthPress}
          hitSlop={spacing.sm}
          style={({ pressed }) => [
            styles.link,
            { gap: spacing.xs / 2 },
            pressed && styles.pressed,
          ]}
        >
          <Text
            style={{
              color: colors.primary,
              fontSize: typography.fontSizes.sm,
              fontWeight: typography.fontWeights.semibold,
            }}
          >
            Ver patrimonio
          </Text>
          <ChevronRightIcon size={16} color={colors.primary} />
        </Pressable>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  pressed: {
    opacity: 0.6,
  },
})
