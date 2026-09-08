import { useCallback } from 'react'
import { useNavigation } from '@react-navigation/native'
import type { Alert } from '@/api/types'
import { useMarkAlertRead, useRecurringExpenses } from '@/hooks'

/**
 * `AlertsService.createOnce` on the backend prefixes every message with
 * `[dedupeKey]`, and a `RECURRING_EXPENSE_DUE` alert's dedupe key is
 * `${month}:${expense.id}` — the only place the id survives to this side of
 * the wire, since the alert payload carries no structured reference.
 */
const RECURRING_EXPENSE_ALERT_PATTERN = /^\[\d{4}-\d{2}:([^\]]+)\]/

function extractRecurringExpenseId(message: string): string | null {
  return message.match(RECURRING_EXPENSE_ALERT_PATTERN)?.[1] ?? null
}

/**
 * Marks an alert read and, depending on its `type`, opens whatever it is
 * about. Types with nothing to jump to (a report, a reminder with no linked
 * record) just get marked read.
 */
export function useAlertNavigation() {
  const navigation = useNavigation()
  const markRead = useMarkAlertRead()
  const recurringExpensesQuery = useRecurringExpenses()

  return useCallback(
    (alert: Alert) => {
      if (!alert.isRead) {
        markRead.mutate(alert.id)
      }

      switch (alert.type) {
        case 'RECURRING_EXPENSE_DUE': {
          const recurringExpenseId = extractRecurringExpenseId(alert.message)
          const expense = recurringExpenseId
            ? recurringExpensesQuery.data?.find(
                item => item.id === recurringExpenseId,
              )
            : undefined

          // Prefilling half the form (just the id, no category or amount) is
          // worse than not prefilling at all, so this only fires with the
          // full expense in hand.
          navigation.navigate(
            'RegisterTransaction',
            expense
              ? {
                  category: expense.categoryId,
                  amount: expense.estimatedAmount,
                  recurringExpenseId: expense.id,
                }
              : undefined,
          )
          return
        }
        case 'SAVINGS_TARGET_AT_RISK':
        case 'GOAL_PROGRESS':
          navigation.navigate('Main', {
            screen: 'GoalsTab',
            params: { screen: 'Goals' },
          })
          return
        case 'BUDGET_70':
        case 'BUDGET_90':
        case 'BUDGET_100':
          navigation.navigate('Main', {
            screen: 'ExpensesTab',
            params: { screen: 'Expenses' },
          })
          return
        default:
          return
      }
    },
    [markRead, navigation, recurringExpensesQuery.data],
  )
}
