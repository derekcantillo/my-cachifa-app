/**
 * Raw color values. Never import `palette` outside this file — screens and
 * components should consume the semantic `ColorPalette` (light/dark) below.
 */
const palette = {
  white: '#FFFFFF',
  black: '#000000',

  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  gray950: '#0B0F14',

  /** App canvas — a hair cooler than pure gray. */
  mist: '#F4F6FA',

  green100: '#DCFCE7',
  green200: '#BBF7D0',
  green400: '#4ADE80',
  green600: '#16A34A',
  green800: '#166534',
  green900: '#14532D',

  red500: '#DC2626',
  red400: '#F87171',
  amber700: '#A16207',
  amber400: '#FBBF24',

  blue300: '#93C5FD',
  blue400: '#60A5FA',
  blue600: '#2563EB',
  blue900: '#1E3A8A',
} as const

export interface ColorPalette {
  background: string
  surface: string
  surfaceElevated: string
  /** Muted panel inside a card, e.g. the weekly summary note. */
  surfaceMuted: string
  border: string
  text: string
  textSecondary: string
  textInverse: string

  /** Links, selected states and blue figures. */
  primary: string
  primaryText: string
  /** Wordmark, screen titles and the floating action button. */
  brand: string
  brandText: string

  tabBarBackground: string
  tabBarActive: string
  tabBarInactive: string
  /** Pill behind the focused tab icon. */
  tabBarActiveBackground: string

  /** Income, positive balances, completed goals. */
  positive: string
  /** Soft fill behind positive callouts. */
  positiveSurface: string
  /** Expenses, negative balances, overdue items. */
  negative: string
  /** Pending or attention-needed states. */
  warning: string
}

export const lightColors: ColorPalette = {
  background: palette.mist,
  surface: palette.white,
  surfaceElevated: palette.white,
  surfaceMuted: palette.gray100,
  border: palette.gray200,
  text: palette.gray900,
  textSecondary: palette.gray500,
  textInverse: palette.white,

  primary: palette.blue600,
  primaryText: palette.white,
  brand: palette.blue900,
  brandText: palette.white,

  tabBarBackground: palette.white,
  tabBarActive: palette.green800,
  tabBarInactive: palette.gray500,
  tabBarActiveBackground: palette.green200,

  positive: palette.green600,
  positiveSurface: palette.green100,
  negative: palette.red500,
  warning: palette.amber700,
}

export const darkColors: ColorPalette = {
  background: palette.gray950,
  surface: palette.gray900,
  surfaceElevated: palette.gray800,
  surfaceMuted: palette.gray800,
  border: palette.gray700,
  text: palette.gray50,
  textSecondary: palette.gray400,
  textInverse: palette.gray900,

  primary: palette.blue400,
  primaryText: palette.gray950,
  brand: palette.blue300,
  brandText: palette.gray950,

  tabBarBackground: palette.gray900,
  tabBarActive: palette.green400,
  tabBarInactive: palette.gray500,
  tabBarActiveBackground: palette.green900,

  positive: palette.green400,
  positiveSurface: palette.green900,
  negative: palette.red400,
  warning: palette.amber400,
}
