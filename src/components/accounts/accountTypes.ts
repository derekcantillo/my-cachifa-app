import type { AccountType } from '@/api/types'

interface AccountTypeDefinition {
  /** Spanish name shown on badges and in the type picker. */
  label: string
  /** Glyph name understood by `CategoryIcon`. */
  icon: string
  /**
   * Fixed hue, like the category colors: legible on both the light and the
   * dark surface, so one value serves both schemes.
   */
  color: string
}

/** One entry per type, in the order the create form offers them. */
export const ACCOUNT_TYPES: Record<AccountType, AccountTypeDefinition> = {
  bank: { label: 'Tarjeta Débito', icon: 'wallet', color: '#2563EB' },
  credit_card: {
    label: 'Tarjeta de Crédito',
    icon: 'credit-card',
    color: '#EA580C',
  },
  cash: { label: 'Efectivo', icon: 'banknote', color: '#16A34A' },
  savings: { label: 'Cuenta de Ahorros', icon: 'piggy-bank', color: '#9333EA' },
}

export const ACCOUNT_TYPE_ORDER: readonly AccountType[] = [
  'bank',
  'credit_card',
  'cash',
  'savings',
]
