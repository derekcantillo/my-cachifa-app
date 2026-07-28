import React from 'react'
import { StyleSheet, View } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  ChartIcon,
  HomeIcon,
  TargetIcon,
  WalletIcon,
  type IconProps,
} from '@/components'
import { useTheme } from '@/theme'
import {
  DashboardStackNavigator,
  ExpensesStackNavigator,
  GoalsStackNavigator,
  ReportsStackNavigator,
} from './stacks'
import type { MainTabParamList } from './types'

const Tab = createBottomTabNavigator<MainTabParamList>()

const BAR_HEIGHT = 62

interface TabIconProps {
  focused: boolean
  color: string
}

/**
 * Wraps a tab glyph in the pill that marks the focused tab. Built once per
 * icon so the navigator never sees a new component type between renders.
 */
function createTabIcon(Icon: React.ComponentType<IconProps>) {
  return function TabIcon({ focused, color }: TabIconProps) {
    const { colors, spacing } = useTheme()

    return (
      <View
        style={[
          styles.pill,
          {
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            backgroundColor: focused
              ? colors.tabBarActiveBackground
              : TRANSPARENT,
          },
        ]}
      >
        <Icon size={22} color={color} />
      </View>
    )
  }
}

const TRANSPARENT = 'transparent'

const DashboardTabIcon = createTabIcon(HomeIcon)
const ExpensesTabIcon = createTabIcon(WalletIcon)
const GoalsTabIcon = createTabIcon(TargetIcon)
const ReportsTabIcon = createTabIcon(ChartIcon)

export function MainTabNavigator() {
  const { colors, typography } = useTheme()
  const insets = useSafeAreaInsets()

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: typography.fontSizes.xs,
          fontWeight: typography.fontWeights.medium,
        },
        tabBarItemStyle: styles.item,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.border,
          height: BAR_HEIGHT + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom,
        },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStackNavigator}
        options={{ title: 'Inicio', tabBarIcon: DashboardTabIcon }}
      />
      <Tab.Screen
        name="ExpensesTab"
        component={ExpensesStackNavigator}
        options={{ title: 'Gastos', tabBarIcon: ExpensesTabIcon }}
      />
      <Tab.Screen
        name="GoalsTab"
        component={GoalsStackNavigator}
        options={{ title: 'Metas', tabBarIcon: GoalsTabIcon }}
      />
      <Tab.Screen
        name="ReportsTab"
        component={ReportsStackNavigator}
        options={{ title: 'Reportes', tabBarIcon: ReportsTabIcon }}
      />
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  item: {
    paddingVertical: 2,
  },
})
