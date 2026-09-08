import type { Account } from '../../types/account'
import type { Alert } from '../../types/alert'
import type { Budget } from '../../types/budget'
import type { Goal } from '../../types/goal'
import type { Loan } from '../../types/loan'
import type { RecurringExpense } from '../../types/recurringExpense'
import type { Transaction } from '../../types/transaction'

// Categories are not seeded: they are the backend's `Category` enum, served
// from `CATEGORY_CATALOG` in `src/api/mappers/categoryMapper.ts` so the mock
// and the real API label and identify them identically.

/** Seed dates are relative to "now" so the app always has current-month data to show. */
function daysAgoISO(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

function daysFromNowISO(days: number): string {
  return daysAgoISO(-days)
}

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

export const seedAccounts: Account[] = [
  {
    id: 'acc-main',
    name: 'Cuenta principal',
    type: 'bank',
    currency: 'USD',
    balance: 1250.4,
  },
  {
    id: 'acc-cash',
    name: 'Efectivo',
    type: 'cash',
    currency: 'USD',
    balance: 85,
  },
  {
    id: 'acc-savings',
    name: 'Ahorros',
    type: 'savings',
    currency: 'USD',
    balance: 3200,
  },
]

export const seedTransactions: Transaction[] = [
  {
    id: 'txn-1',
    kind: 'income',
    amount: 1800,
    categoryId: 'OTHER',
    accountId: 'acc-main',
    date: daysAgoISO(25),
    description: 'Salario mensual',
    tags: [],
    createdAt: daysAgoISO(25),
    updatedAt: daysAgoISO(25),
  },
  {
    id: 'txn-2',
    kind: 'expense',
    amount: 45.5,
    categoryId: 'FOOD',
    accountId: 'acc-cash',
    date: daysAgoISO(20),
    description: 'Almuerzos de la semana',
    tags: ['recurrente'],
    createdAt: daysAgoISO(20),
    updatedAt: daysAgoISO(20),
  },
  {
    id: 'txn-3',
    kind: 'expense',
    amount: 120,
    categoryId: 'HOUSING',
    accountId: 'acc-main',
    date: daysAgoISO(18),
    description: 'Cuota de alquiler',
    tags: [],
    createdAt: daysAgoISO(18),
    updatedAt: daysAgoISO(18),
  },
  {
    id: 'txn-4',
    kind: 'expense',
    amount: 60,
    categoryId: 'TRANSPORT',
    accountId: 'acc-cash',
    date: daysAgoISO(15),
    description: 'Gasolina',
    tags: [],
    createdAt: daysAgoISO(15),
    updatedAt: daysAgoISO(15),
  },
  {
    id: 'txn-5',
    kind: 'expense',
    amount: 35,
    categoryId: 'SERVICES',
    accountId: 'acc-main',
    date: daysAgoISO(14),
    description: 'Internet y cable',
    tags: ['recurrente'],
    createdAt: daysAgoISO(14),
    updatedAt: daysAgoISO(14),
  },
  {
    id: 'txn-6',
    kind: 'expense',
    amount: 90,
    categoryId: 'FOOD',
    accountId: 'acc-main',
    date: daysAgoISO(12),
    description: 'Mercado del mes',
    tags: [],
    createdAt: daysAgoISO(12),
    updatedAt: daysAgoISO(12),
  },
  {
    id: 'txn-7',
    kind: 'expense',
    amount: 25,
    categoryId: 'ENTERTAINMENT',
    accountId: 'acc-cash',
    date: daysAgoISO(10),
    description: 'Cine con amigos',
    tags: [],
    createdAt: daysAgoISO(10),
    updatedAt: daysAgoISO(10),
  },
  {
    id: 'txn-8',
    kind: 'expense',
    amount: 150,
    categoryId: 'DEBT',
    accountId: 'acc-main',
    date: daysAgoISO(8),
    description: 'Cuota tarjeta de crédito',
    tags: [],
    createdAt: daysAgoISO(8),
    updatedAt: daysAgoISO(8),
  },
  {
    id: 'txn-9',
    kind: 'expense',
    amount: 15,
    categoryId: 'ENTERTAINMENT',
    accountId: 'acc-cash',
    date: daysAgoISO(5),
    description: 'Suscripción de streaming',
    tags: ['recurrente'],
    createdAt: daysAgoISO(5),
    updatedAt: daysAgoISO(5),
  },
  {
    id: 'txn-10',
    kind: 'saving',
    amount: 200,
    categoryId: 'SAVING',
    accountId: 'acc-savings',
    date: daysAgoISO(3),
    description: 'Aporte fondo de emergencia',
    tags: [],
    createdAt: daysAgoISO(3),
    updatedAt: daysAgoISO(3),
  },
  {
    id: 'txn-11',
    kind: 'expense',
    amount: 30,
    categoryId: 'FOOD',
    accountId: 'acc-cash',
    date: daysAgoISO(2),
    description: 'Compra rápida de supermercado',
    tags: [],
    createdAt: daysAgoISO(2),
    updatedAt: daysAgoISO(2),
  },
]

const currentBudgetMonth = currentMonth()

/**
 * One limit per category, the way the backend stores them (unique on
 * user + month + category). The old "Mercado" and "Entretenimiento" limits are
 * folded into FOOD and ENTERTAINMENT, which now cover both concepts.
 */
export const seedBudgets: Budget[] = [
  {
    id: 'bud-food',
    categoryId: 'FOOD',
    monthlyLimit: 450,
    month: currentBudgetMonth,
  },
  {
    id: 'bud-transport',
    categoryId: 'TRANSPORT',
    monthlyLimit: 100,
    month: currentBudgetMonth,
  },
  {
    id: 'bud-entertainment',
    categoryId: 'ENTERTAINMENT',
    monthlyLimit: 130,
    month: currentBudgetMonth,
  },
  {
    id: 'bud-services',
    categoryId: 'SERVICES',
    monthlyLimit: 120,
    month: currentBudgetMonth,
  },
  {
    id: 'bud-debt',
    categoryId: 'DEBT',
    monthlyLimit: 200,
    month: currentBudgetMonth,
  },
  {
    id: 'bud-housing',
    categoryId: 'HOUSING',
    monthlyLimit: 500,
    month: currentBudgetMonth,
  },
  // Reuses the Budget shape as a planned-savings target for the report screen.
  {
    id: 'bud-saving',
    categoryId: 'SAVING',
    monthlyLimit: 300,
    month: currentBudgetMonth,
  },
]

export const seedGoals: Goal[] = [
  {
    id: 'goal-emergencia',
    name: 'Fondo de emergencia',
    targetAmount: 3000,
    currentAmount: 1450,
    phase: 'urgent',
    status: 'active',
    contributions: [
      {
        id: 'contrib-1',
        amount: 250,
        date: daysAgoISO(33),
        note: 'Aporte mensual',
      },
      {
        id: 'contrib-2',
        amount: 200,
        date: daysAgoISO(3),
        note: 'Aporte mensual',
      },
    ],
    createdAt: daysAgoISO(90),
  },
  {
    id: 'goal-suzuki-fronx',
    name: 'Cuota inicial carro Suzuki Fronx',
    targetAmount: 5000,
    currentAmount: 1800,
    phase: 'medium_term',
    status: 'active',
    targetDate: daysFromNowISO(240),
    contributions: [
      { id: 'contrib-3', amount: 600, date: daysAgoISO(45) },
      { id: 'contrib-4', amount: 1200, date: daysAgoISO(10) },
    ],
    createdAt: daysAgoISO(120),
  },
  {
    id: 'goal-viaje',
    name: 'Viaje',
    targetAmount: 1200,
    currentAmount: 300,
    phase: 'short_term',
    status: 'active',
    targetDate: daysFromNowISO(90),
    contributions: [{ id: 'contrib-5', amount: 300, date: daysAgoISO(20) }],
    createdAt: daysAgoISO(40),
  },
]

export const seedRecurringExpenses: RecurringExpense[] = [
  {
    id: 'rec-arriendo',
    name: 'Arriendo',
    categoryId: 'HOUSING',
    estimatedAmount: 1200,
    isAmountFixed: true,
    dayOfMonth: 5,
    active: true,
  },
  {
    id: 'rec-servicios',
    name: 'Servicios públicos',
    categoryId: 'SERVICES',
    estimatedAmount: 90,
    isAmountFixed: false,
    dayOfMonth: 15,
    active: true,
  },
  {
    id: 'rec-gimnasio',
    name: 'Gimnasio',
    categoryId: 'HEALTH',
    estimatedAmount: 40,
    isAmountFixed: true,
    dayOfMonth: 1,
    active: false,
  },
]

// The `[dedupeKey]` prefix mirrors the real backend's `AlertsService.createOnce`
// so the mock exercises the same recurring-expense-id parsing the http mode does.
export const seedAlerts: Alert[] = [
  {
    id: 'alert-arriendo-due',
    type: 'RECURRING_EXPENSE_DUE',
    message: `[${currentMonth()}:rec-arriendo] Arriendo: pago estimado de $ 1.200.000 vence el día 5 y todavía no lo registras.`,
    isRead: false,
    createdAt: daysAgoISO(1),
  },
  {
    id: 'alert-savings-risk',
    type: 'SAVINGS_TARGET_AT_RISK',
    message: `[${currentMonth()}] Tus metas activas requieren un aporte de $ 850.000/mes, pero tu ahorro recomendado (30% del disponible) es de $ 600.000. Revisa tus metas o tu meta de ahorro.`,
    isRead: false,
    createdAt: daysAgoISO(2),
  },
  {
    id: 'alert-budget-90',
    type: 'BUDGET_90',
    message: 'Ya usaste el 90% de tu presupuesto en Alimentación este mes.',
    isRead: false,
    createdAt: daysAgoISO(3),
  },
  {
    id: 'alert-budget-100',
    type: 'BUDGET_100',
    message: 'Superaste el presupuesto de Entretenimiento este mes.',
    isRead: true,
    createdAt: daysAgoISO(6),
  },
  {
    id: 'alert-goal-progress',
    type: 'GOAL_PROGRESS',
    message: 'Vas al día con el Fondo de emergencia — sigue así.',
    isRead: true,
    createdAt: daysAgoISO(10),
  },
]

export const seedLoans: Loan[] = [
  {
    id: 'loan-camila',
    borrowerName: 'Camila',
    amount: 300,
    amountRepaid: 100,
    remainingAmount: 200,
    status: 'partially_paid',
    loanDate: daysAgoISO(20),
    dueDate: daysFromNowISO(40),
    note: 'Para la matrícula del curso',
    accountId: 'acc-main',
    repayments: [
      {
        id: 'loan-camila-repay-1',
        amount: 100,
        paidAt: daysAgoISO(5),
        note: 'Primer abono',
      },
    ],
  },
  {
    id: 'loan-andres',
    borrowerName: 'Andrés',
    amount: 80,
    amountRepaid: 80,
    remainingAmount: 0,
    status: 'paid',
    loanDate: daysAgoISO(60),
    accountId: 'acc-cash',
    repayments: [
      {
        id: 'loan-andres-repay-1',
        amount: 80,
        paidAt: daysAgoISO(30),
      },
    ],
  },
]
