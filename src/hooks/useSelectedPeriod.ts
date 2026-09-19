import { useMemo, useState } from 'react'
import type { FinancialPeriod } from '@/api/types'
import { useCurrentPeriod, useFinancialPeriods } from './useFinancialPeriods'

export interface SelectedPeriod {
  periods: FinancialPeriod[]
  /** `undefined` until the current period has loaded. */
  selectedPeriodId: string | undefined
  selectedPeriod: FinancialPeriod | undefined
  /** Whether the selection is the open period (`endDate` null). */
  isCurrentPeriod: boolean
  setSelectedPeriodId: (id: string) => void
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

/**
 * The period a screen with a `PeriodSelector` is showing: the open one until
 * the user steps to another. Keeps "which period" in one place so every
 * period-scoped query on the screen reads the same id.
 */
export function useSelectedPeriod(): SelectedPeriod {
  const periodsQuery = useFinancialPeriods()
  const currentQuery = useCurrentPeriod()

  const [pickedId, setSelectedPeriodId] = useState<string | undefined>()

  const current = currentQuery.data
  const selectedPeriodId = pickedId ?? current?.id

  const periods = useMemo(() => {
    const list = periodsQuery.data ?? []
    // The selector needs the current period to label it, even before (or
    // without) the full list.
    return current && !list.some(period => period.id === current.id)
      ? [current, ...list]
      : list
  }, [current, periodsQuery.data])

  const selectedPeriod = periods.find(period => period.id === selectedPeriodId)

  return {
    periods,
    selectedPeriodId,
    selectedPeriod,
    isCurrentPeriod: selectedPeriod?.endDate === null,
    setSelectedPeriodId,
    isLoading: currentQuery.isPending,
    isError: currentQuery.isError || periodsQuery.isError,
    refetch: () => {
      periodsQuery.refetch()
      currentQuery.refetch()
    },
  }
}
