import React from 'react'
import Svg, { Path, type SvgProps } from 'react-native-svg'

export interface IconProps {
  size?: number
  color?: string
}

interface BaseIconProps extends IconProps {
  /** One or more SVG path commands drawn on a 24x24 grid. */
  paths: string[]
  /** Solid shapes fill instead of stroke. */
  filled?: boolean
}

const DEFAULT_SIZE = 24

/**
 * Line icons drawn on a 24x24 grid. Rendering them here keeps the app free of
 * an icon-font dependency and lets every glyph take its color from the theme.
 */
export function BaseIcon({
  paths,
  size = DEFAULT_SIZE,
  color = 'currentColor',
  filled = false,
}: BaseIconProps) {
  const strokeProps: SvgProps = filled
    ? { fill: color }
    : {
        fill: 'none',
        stroke: color,
        strokeWidth: 1.8,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...strokeProps}>
      {paths.map(path => (
        <Path key={path} d={path} />
      ))}
    </Svg>
  )
}
