import React from 'react'
import { act, create, type ReactTestRenderer } from 'react-test-renderer'
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SafeAreaProvider, type Metrics } from 'react-native-safe-area-context'
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
})
