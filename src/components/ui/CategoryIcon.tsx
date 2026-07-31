import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { getCategoryColor, useTheme } from '@/theme'
import { withAlpha } from '@/utils'

/**
 * Glyphs for the icon names the API ships with. An icon font is not wired up
 * yet, so categories render as an emoji; the fallback keeps unknown names from
 * rendering as an empty space.
 */
const GLYPHS: Record<string, string> = {
  utensils: '🍔',
  car: '🚗',
  'game-controller': '🎉',
  bolt: '📱',
  'credit-card': '💳',
  home: '🏠',
  'shopping-cart': '🛒',
  film: '🎬',
  vehicle: '🚙',
  banknote: '💵',
  'piggy-bank': '💰',
  wallet: '👛',
  gift: '🎁',
  health: '🩺',
  education: '🎓',
}

const FALLBACK_GLYPH = '💠'

type CategoryIconVariant = 'tinted' | 'muted' | 'plain'

interface CategoryIconProps {
  /** Icon name as provided by the category, e.g. 'utensils'. */
  icon: string
  /** Sharpens the color lookup when the caller knows which category this is. */
  categoryId?: string
  /**
   * Overrides the accent used by the `tinted` variant. Left out, the color
   * comes from the app's fixed category map so icons, chips and charts agree.
   */
  color?: string
  size?: number
  /**
   * `tinted` puts the glyph on a disc of its category color, `muted` on a
   * neutral disc, `plain` drops the disc entirely.
   */
  variant?: CategoryIconVariant
}

export function CategoryIcon({
  icon,
  categoryId,
  color,
  size = 40,
  variant = 'tinted',
}: CategoryIconProps) {
  const { colors } = useTheme()
  const glyph = GLYPHS[icon] ?? FALLBACK_GLYPH

  if (variant === 'plain') {
    return <Text style={{ fontSize: size }}>{glyph}</Text>
  }

  const background =
    variant === 'muted'
      ? colors.surfaceMuted
      : withAlpha(color ?? getCategoryColor({ id: categoryId, icon }), 0.16)

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: background,
        },
      ]}
    >
      <Text style={{ fontSize: size * 0.5 }}>{glyph}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})
