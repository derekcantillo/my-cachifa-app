import React from 'react'
import { Text, View } from 'react-native'
import { act, create, type ReactTestRenderer } from 'react-test-renderer'
import { ThemeProvider } from '@/theme'
import { EmptyState } from '../EmptyState'

function render(element: React.ReactElement): ReactTestRenderer {
  let tree: ReactTestRenderer | undefined

  act(() => {
    tree = create(<ThemeProvider>{element}</ThemeProvider>)
  })

  if (!tree) {
    throw new Error('expected the tree to render')
  }
  return tree
}

const icon = <View testID="icon" />

describe('EmptyState', () => {
  it('shows what is missing and why', () => {
    const tree = render(
      <EmptyState
        icon={icon}
        title="Sin movimientos este mes"
        description="Registra tu primer gasto."
      />,
    )

    const text = tree.root.findAllByType(Text).map(node => node.props.children)
    expect(text).toContain('Sin movimientos este mes')
    expect(text).toContain('Registra tu primer gasto.')
    expect(tree.root.findAllByProps({ testID: 'icon' }).length).toBeGreaterThan(
      0,
    )
  })

  it('offers the way out when there is one', () => {
    const onAction = jest.fn()
    const tree = render(
      <EmptyState
        icon={icon}
        title="Sin metas"
        description="Crea la primera."
        actionLabel="Crear nueva meta"
        onAction={onAction}
      />,
    )

    const button = tree.root.findByProps({
      accessibilityRole: 'button',
      accessibilityLabel: 'Crear nueva meta',
    })

    act(() => {
      button.props.onPress()
    })
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('renders no button when the label has no handler behind it', () => {
    const tree = render(
      <EmptyState
        icon={icon}
        title="Sin proyección"
        description="Registra un aporte."
        actionLabel="Crear nueva meta"
      />,
    )

    expect(
      tree.root.findAllByProps({ accessibilityRole: 'button' }),
    ).toHaveLength(0)
  })
})
