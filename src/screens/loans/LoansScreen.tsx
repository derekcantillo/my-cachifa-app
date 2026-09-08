import React, { useCallback } from 'react'
import { View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { Loan } from '@/api/types'
import {
  Button,
  Card,
  CategoryIcon,
  EmptyState,
  ErrorNotice,
  ModalScreen,
  PlusIcon,
  Separator,
  Skeleton,
} from '@/components'
import { useLoans } from '@/hooks'
import { useTheme } from '@/theme'
import { LoanListItem } from './components'

export function LoansScreen() {
  const { colors, spacing } = useTheme()
  const navigation = useNavigation()

  const loansQuery = useLoans()
  const loans = loansQuery.data ?? []

  const openCreateLoan = useCallback(() => {
    navigation.navigate('CreateLoan')
  }, [navigation])

  const openLoanDetail = useCallback(
    (loan: Loan) => {
      navigation.navigate('LoanDetail', { loanId: loan.id })
    },
    [navigation],
  )

  return (
    <ModalScreen
      title="Préstamos"
      onClose={navigation.goBack}
      footer={
        <Button
          label="Prestar dinero"
          onPress={openCreateLoan}
          icon={<PlusIcon size={18} color={colors.brandText} />}
        />
      }
    >
      {loansQuery.isPending ? (
        <View style={{ gap: spacing.md }}>
          <Skeleton height={56} radius={14} />
          <Skeleton height={56} radius={14} />
        </View>
      ) : loansQuery.isError ? (
        <ErrorNotice error={loansQuery.error} />
      ) : loans.length === 0 ? (
        <EmptyState
          icon={<CategoryIcon icon="loan" categoryId="LOAN" variant="plain" size={28} />}
          title="Sin préstamos"
          description="Registra el dinero que le prestas a alguien para hacerle seguimiento, sin que afecte tu presupuesto."
          actionLabel="Prestar dinero"
          onAction={openCreateLoan}
        />
      ) : (
        <Card>
          {loans.map((loan, index) => (
            <View key={loan.id}>
              {index > 0 && <Separator />}
              <LoanListItem loan={loan} onPress={openLoanDetail} />
            </View>
          ))}
        </Card>
      )}
    </ModalScreen>
  )
}
