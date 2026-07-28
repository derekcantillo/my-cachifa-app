const HEX_RGB = /^#([0-9a-f]{6})$/i
const HEX_RGB_SHORT = /^#([0-9a-f]{3})$/i

/**
 * Returns `color` with the given opacity (0-1) applied, used for the soft
 * tinted surfaces behind badges and icons. Non-hex colors are returned
 * untouched — React Native accepts them, they just cannot be tinted here.
 */
export function withAlpha(color: string, alpha: number): string {
  const clamped = Math.min(Math.max(alpha, 0), 1)
  const suffix = Math.round(clamped * 255)
    .toString(16)
    .padStart(2, '0')

  const shortMatch = HEX_RGB_SHORT.exec(color)
  if (shortMatch?.[1]) {
    const [r, g, b] = shortMatch[1]
    return `#${r}${r}${g}${g}${b}${b}${suffix}`
  }

  if (HEX_RGB.test(color)) {
    return `${color}${suffix}`
  }

  return color
}
