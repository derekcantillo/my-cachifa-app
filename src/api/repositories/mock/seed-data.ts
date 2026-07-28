import type { Account } from '../../types/account'
import type { Budget } from '../../types/budget'
import type { Category } from '../../types/category'
import type { Goal } from '../../types/goal'
import type { Transaction } from '../../types/transaction'

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

export const seedCategories: Category[] = [
  {
    id: 'cat-alimentacion',
    name: 'Alimentación',
    kind: 'expense',
    icon: 'utensils',
    color: '#F97316',
    description: 'Restaurantes, domicilios',
  },
  {
    id: 'cat-transporte',
    name: 'Transporte',
    kind: 'expense',
    icon: 'car',
    color: '#3B82F6',
    description: 'Gasolina, transporte público',
  },
  {
    id: 'cat-ocio',
    name: 'Ocio',
    kind: 'expense',
    icon: 'game-controller',
    color: '#A855F7',
    description: 'Salidas, planes',
  },
  {
    id: 'cat-servicios',
    name: 'Servicios',
    kind: 'expense',
    icon: 'bolt',
    color: '#EAB308',
    description: 'Internet, celular, luz',
  },
  {
    id: 'cat-deuda',
    name: 'Deuda',
    kind: 'expense',
    icon: 'credit-card',
    color: '#EF4444',
    description: 'Cuotas y tarjetas',
  },
  {
    id: 'cat-vivienda',
    name: 'Vivienda',
    kind: 'expense',
    icon: 'home',
    color: '#0EA5E9',
    description: 'Arriendo, administración',
  },
  {
    id: 'cat-mercado',
    name: 'Mercado',
    kind: 'expense',
    icon: 'shopping-cart',
    color: '#22C55E',
    description: 'Comida, aseo',
  },
  {
    id: 'cat-entretenimiento',
    name: 'Entretenimiento',
    kind: 'expense',
    icon: 'film',
    color: '#EC4899',
    description: 'Suscripciones, cine',
  },
  {
    id: 'cat-salario',
    name: 'Salario',
    kind: 'income',
    icon: 'banknote',
    color: '#16A34A',
    description: 'Sueldo y quincenas',
  },
  {
    id: 'cat-ahorro',
    name: 'Ahorro',
    kind: 'saving',
    icon: 'piggy-bank',
    color: '#2563EB',
    description: 'Lo que apartas cada mes',
  },
]

export const seedTransactions: Transaction[] = [
  {
    id: 'txn-1',
    kind: 'income',
    amount: 1800,
    categoryId: 'cat-salario',
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
    categoryId: 'cat-alimentacion',
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
    categoryId: 'cat-vivienda',
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
    categoryId: 'cat-transporte',
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
    categoryId: 'cat-servicios',
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
    categoryId: 'cat-mercado',
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
    categoryId: 'cat-ocio',
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
    categoryId: 'cat-deuda',
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
    categoryId: 'cat-entretenimiento',
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
    categoryId: 'cat-ahorro',
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
    categoryId: 'cat-alimentacion',
    accountId: 'acc-cash',
    date: daysAgoISO(2),
    description: 'Compra rápida de supermercado',
    tags: [],
    createdAt: daysAgoISO(2),
    updatedAt: daysAgoISO(2),
  },
]

const currentBudgetMonth = currentMonth()

export const seedBudgets: Budget[] = [
  {
    id: 'bud-alimentacion',
    categoryId: 'cat-alimentacion',
    monthlyLimit: 250,
    month: currentBudgetMonth,
  },
  {
    id: 'bud-transporte',
    categoryId: 'cat-transporte',
    monthlyLimit: 100,
    month: currentBudgetMonth,
  },
  {
    id: 'bud-ocio',
    categoryId: 'cat-ocio',
    monthlyLimit: 80,
    month: currentBudgetMonth,
  },
  {
    id: 'bud-servicios',
    categoryId: 'cat-servicios',
    monthlyLimit: 120,
    month: currentBudgetMonth,
  },
  {
    id: 'bud-deuda',
    categoryId: 'cat-deuda',
    monthlyLimit: 200,
    month: currentBudgetMonth,
  },
  {
    id: 'bud-vivienda',
    categoryId: 'cat-vivienda',
    monthlyLimit: 500,
    month: currentBudgetMonth,
  },
  {
    id: 'bud-mercado',
    categoryId: 'cat-mercado',
    monthlyLimit: 200,
    month: currentBudgetMonth,
  },
  {
    id: 'bud-entretenimiento',
    categoryId: 'cat-entretenimiento',
    monthlyLimit: 50,
    month: currentBudgetMonth,
  },
  // Reuses the Budget shape as a planned-savings target for the report screen.
  {
    id: 'bud-ahorro',
    categoryId: 'cat-ahorro',
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
