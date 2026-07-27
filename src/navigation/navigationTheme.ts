import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native'
import type { ColorPalette } from '@/theme/colors'
import type { ColorScheme } from '@/theme/ThemeProvider'

export function buildNavigationTheme(
  scheme: ColorScheme,
  colors: ColorPalette,
): Theme {
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme

  return {
    ...base,
    dark: scheme === 'dark',
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.warning,
    },
  }
}
