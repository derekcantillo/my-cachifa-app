import React from 'react'
import { act, create, type ReactTestRenderer } from 'react-test-renderer'
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SafeAreaProvider, type Metrics } from 'react-native-safe-area-context'
import { seedAlerts, seedLoans } from '@/api/repositories/mock/seed-data'
import { ThemeProvider } from '@/theme'
import { getCurrentMonthKey } from '@/utils'
import { RootNavigator } from '../RootNavigator'
import type { RootStackParamList } from '../types'

const METRICS: Metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
}

const navigationRef = createNavigationContainerRef<RootStackParamList>()

let tree: ReactTestRenderer | undefined
let client: QueryClient | undefined

jest.setTimeout(30000)

function renderApp(): ReactTestRenderer {
  const testClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  client = testClient

  let rendered: ReactTestRenderer | undefined
  act(() => {
    rendered = create(
      <QueryClientProvider client={testClient}>
        <SafeAreaProvider initialMetrics={METRICS}>
          <ThemeProvider>
            <NavigationContainer ref={navigationRef}>
              <RootNavigator />
            </NavigationContainer>
          </ThemeProvider>
        </SafeAreaProvider>
      </QueryClientProvider>,
    )
  })

  if (!rendered) {
    throw new Error('expected the app to render')
  }
  tree = rendered
  return rendered
}

/** Lets the mock repositories resolve so the modal settles before assertions. */
async function settle(ms = 1500): Promise<void> {
  await act(async () => {
    await new Promise<void>(resolve => setTimeout(resolve, ms))
  })
}

function hasText(rendered: ReactTestRenderer, text: string): boolean {
  return (
    rendered.root.findAll(node => {
      const { children } = node.props as { children?: unknown }
      return typeof children === 'string' && children === text
    }).length > 0
  )
}

/** Like `hasText`, but for a longer paragraph split across lines in the source. */
function hasSubstring(rendered: ReactTestRenderer, text: string): boolean {
  return (
    rendered.root.findAll(node => {
      const { children } = node.props as { children?: unknown }
      return typeof children === 'string' && children.includes(text)
    }).length > 0
  )
}

/**
 * Simulates tapping whatever renders `text` — a `SegmentedControl` option or
 * an `OptionChips` chip, neither of which carries a stable test id, just the
 * label itself. Walks up from the `Text` node to the nearest ancestor with an
 * `onPress`, which is the `Pressable` that owns it.
 */
function pressByText(rendered: ReactTestRenderer, text: string): void {
  const [textNode] = rendered.root.findAll(node => {
    const { children } = node.props as { children?: unknown }
    return typeof children === 'string' && children === text
  })

  if (!textNode) {
    throw new Error(`no text node found for "${text}"`)
  }

  let current = textNode.parent
  while (current && typeof (current.props as { onPress?: unknown }).onPress !== 'function') {
    current = current.parent
  }

  if (!current) {
    throw new Error(`no pressable ancestor found for "${text}"`)
  }

  act(() => {
    ;(current!.props as { onPress: () => void }).onPress()
  })
}

function hasAccessibilityLabel(
  rendered: ReactTestRenderer,
  label: string,
): boolean {
  return (
    rendered.root.findAll(node => {
      const props = node.props as { accessibilityLabel?: string }
      return props.accessibilityLabel === label
    }).length > 0
  )
}

afterEach(async () => {
  await act(async () => {
    tree?.unmount()
  })
  tree = undefined
  client?.clear()
  client?.unmount()
  client = undefined
})

describe('root modal routes', () => {
  it('opens the register-movement modal', async () => {
    const rendered = renderApp()
    await settle()

    act(() => {
      navigationRef.navigate('RegisterTransaction')
    })
    await settle()

    expect(hasText(rendered, 'Registrar')).toBe(true)
  })

  it('opens a movement detail by id', async () => {
    const rendered = renderApp()
    await settle()

    act(() => {
      navigationRef.navigate('TransactionDetail', { transactionId: 'txn-2' })
    })
    await settle()

    // The title names the kind of movement, as the design does.
    expect(hasText(rendered, 'Detalle de Gasto')).toBe(true)
    expect(hasText(rendered, 'Almuerzos de la semana')).toBe(true)
  })

  it('opens the create-goal modal', async () => {
    const rendered = renderApp()
    await settle()

    act(() => {
      navigationRef.navigate('CreateGoal')
    })
    await settle()

    expect(hasText(rendered, 'Crear nueva meta')).toBe(true)
    // The live preview renders before a single field is filled in.
    expect(hasText(rendered, 'Tu nueva meta')).toBe(true)
  })

  it('opens a goal detail by id', async () => {
    const rendered = renderApp()
    await settle()

    act(() => {
      navigationRef.navigate('GoalDetail', { goalId: 'goal-emergencia' })
    })
    await settle()

    expect(hasText(rendered, 'Fondo de emergencia')).toBe(true)
    expect(hasText(rendered, 'Historial de Ahorro')).toBe(true)
    expect(hasText(rendered, 'Fecha Límite')).toBe(true)
  })

  it('opens budget management for a period', async () => {
    const rendered = renderApp()
    await settle()

    act(() => {
      navigationRef.navigate('BudgetManagement', {
        month: getCurrentMonthKey(),
      })
    })
    await settle()

    expect(hasText(rendered, 'Gestión de Presupuesto')).toBe(true)
    expect(hasText(rendered, 'Presupuesto total planeado')).toBe(true)
    // Only categories that already have a limit are listed.
    expect(hasText(rendered, 'Vivienda')).toBe(true)
  })

  it('opens Settings with the fixed-expenses and savings-target sections', async () => {
    const rendered = renderApp()
    await settle()

    act(() => {
      navigationRef.navigate('Settings')
    })
    await settle()

    expect(hasText(rendered, 'Gastos fijos')).toBe(true)
    expect(hasText(rendered, '% de ahorro objetivo')).toBe(true)
    // Seeded recurring expenses render as rows.
    expect(hasText(rendered, 'Arriendo')).toBe(true)
    expect(hasText(rendered, 'Servicios públicos')).toBe(true)
    expect(hasText(rendered, 'Agregar gasto fijo')).toBe(true)
  })

  it('opens the add-recurring-expense modal', async () => {
    const rendered = renderApp()
    await settle()

    act(() => {
      navigationRef.navigate('RecurringExpenseForm')
    })
    await settle()

    expect(hasText(rendered, 'Agregar gasto fijo')).toBe(true)
    expect(hasText(rendered, 'Monto fijo')).toBe(true)
  })

  it('opens the edit-recurring-expense modal for an existing id', async () => {
    const rendered = renderApp()
    await settle()

    act(() => {
      navigationRef.navigate('RecurringExpenseForm', {
        recurringExpenseId: 'rec-arriendo',
      })
    })
    await settle()

    expect(hasText(rendered, 'Editar gasto fijo')).toBe(true)
    expect(hasText(rendered, 'Eliminar gasto fijo')).toBe(true)
  })

  it('only asks for a budget period on an INCOME + Salario movement', async () => {
    const rendered = renderApp()
    await settle()

    act(() => {
      navigationRef.navigate('RegisterTransaction')
    })
    await settle()

    // A plain expense never asks for it.
    expect(hasText(rendered, '¿Para qué mes es este ingreso?')).toBe(false)

    pressByText(rendered, 'Ingreso')
    await settle(300)
    // Salario is offered once the kind is income, but the field still
    // doesn't apply until the category itself is picked.
    expect(hasText(rendered, 'Salario')).toBe(true)
    expect(hasText(rendered, '¿Para qué mes es este ingreso?')).toBe(false)

    pressByText(rendered, 'Salario')
    await settle(300)

    expect(hasText(rendered, '¿Para qué mes es este ingreso?')).toBe(true)

    // Switching back to expense drops the field again.
    pressByText(rendered, 'Gasto')
    await settle(300)
    expect(hasText(rendered, '¿Para qué mes es este ingreso?')).toBe(false)
  })

  it('prefills a new movement from a pending recurring expense', async () => {
    const rendered = renderApp()
    await settle()

    act(() => {
      navigationRef.navigate('RegisterTransaction', {
        category: 'HOUSING',
        amount: 1200,
        recurringExpenseId: 'rec-arriendo',
      })
    })
    await settle()

    // Vivienda (HOUSING) comes pre-selected among the expense categories.
    const selectedChip = rendered.root.findAll(node => {
      const props = node.props as {
        accessibilityLabel?: string
        accessibilityState?: { selected?: boolean }
      }
      return (
        props.accessibilityLabel === 'Vivienda' &&
        props.accessibilityState?.selected === true
      )
    })
    expect(selectedChip.length).toBeGreaterThan(0)
  })

  it('shows the unread alerts badge and clears it after marking all as read', async () => {
    const rendered = renderApp()
    await settle()

    const unreadCount = seedAlerts.filter(alert => !alert.isRead).length
    expect(
      hasAccessibilityLabel(
        rendered,
        `Ver notificaciones (${unreadCount} sin leer)`,
      ),
    ).toBe(true)

    act(() => {
      navigationRef.navigate('Alerts')
    })
    await settle()

    expect(hasText(rendered, 'Notificaciones')).toBe(true)
    expect(hasText(rendered, 'Marcar todas como leídas')).toBe(true)
    // Every seeded alert renders, whatever its read state.
    for (const alert of seedAlerts) {
      expect(hasText(rendered, alert.message)).toBe(true)
    }

    pressByText(rendered, 'Marcar todas como leídas')
    await settle(1800)

    expect(hasText(rendered, 'Marcar todas como leídas')).toBe(false)

    act(() => {
      navigationRef.goBack()
    })
    await settle()

    expect(hasAccessibilityLabel(rendered, 'Ver notificaciones')).toBe(true)
  })

  it('opens a recurring-expense alert prefilled and marks it read', async () => {
    const rendered = renderApp()
    await settle()

    act(() => {
      navigationRef.navigate('Alerts')
    })
    await settle()

    const dueAlert = seedAlerts.find(
      alert => alert.type === 'RECURRING_EXPENSE_DUE',
    )!
    pressByText(rendered, dueAlert.message)
    await settle()

    expect(hasText(rendered, 'Registrar')).toBe(true)
    // Vivienda (HOUSING) — rec-arriendo's category — comes pre-selected.
    const selectedChip = rendered.root.findAll(node => {
      const props = node.props as {
        accessibilityLabel?: string
        accessibilityState?: { selected?: boolean }
      }
      return (
        props.accessibilityLabel === 'Vivienda' &&
        props.accessibilityState?.selected === true
      )
    })
    expect(selectedChip.length).toBeGreaterThan(0)
  })

  it('routes a budget alert to Expenses and a savings-risk alert to Goals', async () => {
    const rendered = renderApp()
    await settle()

    act(() => {
      navigationRef.navigate('Alerts')
    })
    await settle()

    const budgetAlert = seedAlerts.find(alert => alert.type === 'BUDGET_90')!
    pressByText(rendered, budgetAlert.message)
    await settle(2000)
    expect(hasText(rendered, 'Movimientos')).toBe(true)

    act(() => {
      navigationRef.navigate('Alerts')
    })
    await settle()

    const riskAlert = seedAlerts.find(
      alert => alert.type === 'SAVINGS_TARGET_AT_RISK',
    )!
    pressByText(rendered, riskAlert.message)
    await settle(2000)
    expect(hasText(rendered, 'Mis Metas')).toBe(true)
  })

  it('shows the active-loans card on Inicio, reflecting only what is not fully paid', async () => {
    const rendered = renderApp()
    await settle()

    const active = seedLoans.filter(loan => loan.status !== 'paid')
    expect(active).toHaveLength(1)
    expect(hasText(rendered, 'Préstamos activos')).toBe(true)
    expect(hasText(rendered, '1 préstamo por cobrar')).toBe(true)
  })

  it('opens Loans and lists every seeded loan with its status', async () => {
    const rendered = renderApp()
    await settle()

    act(() => {
      navigationRef.navigate('Loans')
    })
    await settle()

    expect(hasText(rendered, 'Camila')).toBe(true)
    expect(hasText(rendered, 'Andrés')).toBe(true)
    expect(hasText(rendered, 'Parcial')).toBe(true)
    expect(hasText(rendered, 'Pagado')).toBe(true)
  })

  it('opens a loan detail with its repayment history, and disables deleting it', async () => {
    const rendered = renderApp()
    await settle()

    act(() => {
      navigationRef.navigate('LoanDetail', { loanId: 'loan-camila' })
    })
    await settle()

    expect(hasText(rendered, 'Camila')).toBe(true)
    expect(hasText(rendered, 'Primer abono')).toBe(true)

    const deleteButton = rendered.root.findAll(node => {
      const props = node.props as {
        accessibilityLabel?: string
        accessibilityState?: { disabled?: boolean }
      }
      return (
        props.accessibilityLabel === 'Eliminar préstamo' &&
        props.accessibilityState?.disabled === true
      )
    })
    expect(deleteButton.length).toBeGreaterThan(0)
    expect(
      hasSubstring(rendered, 'No puedes eliminar un préstamo con pagos'),
    ).toBe(true)
  })
})
