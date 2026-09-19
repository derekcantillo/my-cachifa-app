import type { NetWorth } from '../../types/netWorth'
import type { NetWorthRepository } from '../interfaces/NetWorthRepository'
import { mockAccountRepository } from './MockAccountRepository'
import { mockGoalRepository } from './MockGoalRepository'
import { mockLoanRepository } from './MockLoanRepository'
import { simulateLatency } from './latency'

/**
 * Computed from the other mocks, the way the backend aggregates its tables, so
 * setting a starting balance or repaying a loan shows up here too.
 */
class MockNetWorthRepository implements NetWorthRepository {
  async get(): Promise<NetWorth> {
    await simulateLatency()

    const [accounts, loans, goals] = await Promise.all([
      mockAccountRepository.list(),
      mockLoanRepository.getAll(),
      mockGoalRepository.list(),
    ])

    const accountsBalance = accounts.reduce(
      (sum, account) => sum + account.currentBalance,
      0,
    )
    const receivables = loans
      .filter(loan => loan.status !== 'paid')
      .reduce((sum, loan) => sum + loan.remainingAmount, 0)
    const goalsSavings = goals.reduce(
      (sum, goal) => sum + goal.currentAmount,
      0,
    )

    return {
      assets: {
        accountsBalance,
        receivables,
        goalsSavings,
        creditCardsAvailable: 0,
      },
      liabilities: { debts: 0, creditCardsDebt: 0 },
      netWorth: accountsBalance + receivables + goalsSavings,
    }
  }
}

export const mockNetWorthRepository: NetWorthRepository =
  new MockNetWorthRepository()
