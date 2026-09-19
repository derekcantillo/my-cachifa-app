export interface NetWorthAssets {
  /** Sum of every account's `currentBalance`. */
  accountsBalance: number
  /** What is still owed on loans that are not fully repaid. */
  receivables: number
  /** Sum of every goal's `currentAmount`. */
  goalsSavings: number
  /** Placeholder — always 0 until credit cards are tracked. */
  creditCardsAvailable: number
}

export interface NetWorthLiabilities {
  /** Placeholder — always 0 until own debts are tracked. */
  debts: number
  /** Placeholder — always 0 until credit cards are tracked. */
  creditCardsDebt: number
}

/** Today's snapshot: not tied to any financial period. */
export interface NetWorth {
  assets: NetWorthAssets
  liabilities: NetWorthLiabilities
  /** Total assets minus total liabilities. */
  netWorth: number
}
