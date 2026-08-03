import React from 'react'
import { View } from 'react-native'
import { act, create, type ReactTestRenderer } from 'react-test-renderer'
import { ThemeProvider } from '@/theme'
import { canRenderPieChart, LineChart, PieChart } from '..'

const mounted: ReactTestRenderer[] = []

// The line chart animates itself in on mount, and those timers outlive the
// test unless they are run to completion, taking the Jest environment with
// them when they fire. Fake timers keep them inside the test.
beforeEach(() => {
  jest.useFakeTimers()
})

afterEach(() => {
  mounted.splice(0).forEach(tree => {
    act(() => {
      tree.unmount()
    })
  })
  act(() => {
    jest.runOnlyPendingTimers()
  })
  jest.useRealTimers()
})

function render(element: React.ReactElement): ReactTestRenderer {
  let tree: ReactTestRenderer | undefined

  act(() => {
    tree = create(<ThemeProvider>{element}</ThemeProvider>)
  })

  if (!tree) {
    throw new Error('expected the tree to render')
  }

  mounted.push(tree)
  return tree
}

/**
 * `onLayout` never fires in the test renderer, and the line chart waits for it
 * before drawing, so the measurement is faked here.
 */
function layout(tree: ReactTestRenderer, width: number): void {
  const measured = tree.root
    .findAllByType(View)
    .find(node => typeof node.props.onLayout === 'function')

  if (!measured) {
    throw new Error('expected a view that measures itself')
  }

  act(() => {
    measured.props.onLayout({
      nativeEvent: { layout: { x: 0, y: 0, width, height: 200 } },
    })
  })
}

describe('LineChart', () => {
  it('draws the line once the container has been measured', () => {
    const tree = render(
      <LineChart
        data={[
          { value: 3550, label: 'Jul' },
          { value: 3850 },
          { value: 6650, marker: 'Venta del carro' },
        ]}
      />,
    )

    layout(tree, 320)

    // The marker's callout is rendered alongside the line.
    expect(
      tree.root.findAllByProps({ children: 'Venta del carro' }).length,
    ).toBeGreaterThan(0)
  })

  it('renders nothing but its spacer when there is no data', () => {
    const tree = render(<LineChart data={[]} />)
    expect(() => layout(tree, 320)).not.toThrow()
  })
})

describe('PieChart', () => {
  it('renders a donut with a center label', () => {
    const tree = render(
      <PieChart
        data={[
          { key: 'cat-deuda', label: 'Deuda', value: 150, color: '#EF4444' },
          {
            key: 'cat-vivienda',
            label: 'Vivienda',
            value: 120,
            color: '#0EA5E9',
          },
        ]}
        centerLabel="$ 270"
        centerCaption="Gastado"
      />,
    )

    expect(
      tree.root.findAllByProps({ children: '$ 270' }).length,
    ).toBeGreaterThan(0)
  })

  it('draws nothing for a period with no expenses', () => {
    // A month whose request succeeded but holds no expense arrives as an empty
    // array; drawing it would leave an arc computed from a total of zero.
    const tree = render(<PieChart data={[]} centerLabel="$ 0" />)
    expect(tree.toJSON()).toBeNull()
  })

  it('draws nothing when every slice sits at zero', () => {
    const tree = render(
      <PieChart
        data={[
          { key: 'FOOD', label: 'Alimentación', value: 0, color: '#F97316' },
          { key: 'DEBT', label: 'Deuda', value: 0, color: '#EF4444' },
        ]}
      />,
    )
    expect(tree.toJSON()).toBeNull()
  })

  it('keeps a single category, which is a full ring and not a broken one', () => {
    const tree = render(
      <PieChart
        data={[
          { key: 'FOOD', label: 'Alimentación', value: 450, color: '#F97316' },
        ]}
        centerLabel="$ 450"
      />,
    )
    expect(tree.toJSON()).not.toBeNull()
  })
})

describe('canRenderPieChart', () => {
  const slice = (value: number) => ({
    key: 'FOOD',
    label: 'Alimentación',
    value,
    color: '#F97316',
  })

  it('agrees with what the chart actually draws', () => {
    expect(canRenderPieChart([])).toBe(false)
    expect(canRenderPieChart([slice(0)])).toBe(false)
    expect(canRenderPieChart([slice(Number.NaN)])).toBe(false)
    expect(canRenderPieChart([slice(0), slice(120)])).toBe(true)
  })
})
