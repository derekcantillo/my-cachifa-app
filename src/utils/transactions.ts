import type { Transaction, TransactionKind } from '@/api/types'

export function sumAmount(transactions: readonly Transaction[]): number {
  return transactions.reduce(
    (total, transaction) => total + transaction.amount,
    0,
  )
}

export function sumByKind(
  transactions: readonly Transaction[],
  kind: TransactionKind,
): number {
  return sumAmount(
    transactions.filter(transaction => transaction.kind === kind),
  )
}

/** Total spent per category id, counting expenses only. */
export function sumExpensesByCategory(
  transactions: readonly Transaction[],
): Record<string, number> {
  return transactions.reduce<Record<string, number>>((totals, transaction) => {
    if (transaction.kind !== 'expense') {
      return totals
    }
    totals[transaction.categoryId] =
      (totals[transaction.categoryId] ?? 0) + transaction.amount
    return totals
  }, {})
}

/** Most recent first. Does not mutate the input array. */
export function sortByDateDesc(
  transactions: readonly Transaction[],
): Transaction[] {
  return [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
}
