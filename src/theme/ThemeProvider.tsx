import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Appearance, type ColorSchemeName } from 'react-native'
import { darkColors, lightColors, type ColorPalette } from './colors'
import { spacing, type Spacing } from './spacing'
import { typography, type Typography } from './typography'

export type ColorScheme = 'light' | 'dark'

/**
 * 'system' follows the OS. 'light'/'dark' are reserved for a future manual
 * override (e.g. a setting in Block 6) and are not selectable yet.
 */
export type ThemePreference = ColorScheme | 'system'

interface ThemeContextValue {
  scheme: ColorScheme
  preference: ThemePreference
  setPreference: (preference: ThemePreference) => void
  colors: ColorPalette
  spacing: Spacing
  typography: Typography
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

type SystemScheme = ColorSchemeName | null | undefined

function resolveScheme(
  preference: ThemePreference,
  systemScheme: SystemScheme,
): ColorScheme {
  if (preference === 'system') {
    return systemScheme === 'dark' ? 'dark' : 'light'
  }
  return preference
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>('system')
  const [systemScheme, setSystemScheme] = useState<SystemScheme>(() =>
    Appearance.getColorScheme(),
  )

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme)
    })
    return () => subscription.remove()
  }, [])

  const scheme = resolveScheme(preference, systemScheme)

  const value = useMemo<ThemeContextValue>(
    () => ({
      scheme,
      preference,
      setPreference,
      colors: scheme === 'dark' ? darkColors : lightColors,
      spacing,
      typography,
    }),
    [scheme, preference],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
