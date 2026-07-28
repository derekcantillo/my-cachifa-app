import React from 'react'
import { BaseIcon, type IconProps } from './Icon'

export type { IconProps } from './Icon'

export function HomeIcon(props: IconProps) {
  return (
    <BaseIcon
      {...props}
      paths={['M3 10.2 12 3l9 7.2', 'M5.5 9.6V20h13V9.6', 'M10 20v-5h4v5']}
    />
  )
}

export function WalletIcon(props: IconProps) {
  return (
    <BaseIcon
      {...props}
      paths={[
        'M4 8a2 2 0 0 1 2-2h11a1 1 0 0 1 1 1v1',
        'M4 8v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2H4z',
        'M16 13.5h1.2',
      ]}
    />
  )
}

export function TargetIcon(props: IconProps) {
  return (
    <BaseIcon
      {...props}
      paths={[
        'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z',
        'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z',
        'M12 11.6a.4.4 0 1 0 0 .8.4.4 0 0 0 0-.8z',
      ]}
    />
  )
}

export function ChartIcon(props: IconProps) {
  return (
    <BaseIcon
      {...props}
      paths={['M4 20h16', 'M7 20v-6', 'M12 20V5', 'M17 20v-9']}
    />
  )
}

export function BellIcon(props: IconProps) {
  return (
    <BaseIcon
      {...props}
      paths={[
        'M18 9a6 6 0 1 0-12 0c0 5-2 7-2 7h16s-2-2-2-7z',
        'M13.7 20a2 2 0 0 1-3.4 0',
      ]}
    />
  )
}

export function PlusIcon(props: IconProps) {
  return <BaseIcon {...props} paths={['M12 5.5v13', 'M5.5 12h13']} />
}

export function ChevronLeftIcon(props: IconProps) {
  return <BaseIcon {...props} paths={['m14.5 5-6 7 6 7']} />
}

export function ChevronRightIcon(props: IconProps) {
  return <BaseIcon {...props} paths={['m9.5 5 6 7-6 7']} />
}

export function MoreIcon(props: IconProps) {
  return (
    <BaseIcon
      {...props}
      filled
      paths={[
        'M6 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z',
        'M12 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z',
        'M18 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z',
      ]}
    />
  )
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <BaseIcon
      {...props}
      paths={[
        'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17z',
        'm8.4 12 2.6 2.6 4.6-5.2',
      ]}
    />
  )
}

export function FilterIcon(props: IconProps) {
  return <BaseIcon {...props} paths={['M4 7h16', 'M7 12h10', 'M10 17h4']} />
}

export function UserIcon(props: IconProps) {
  return (
    <BaseIcon
      {...props}
      paths={[
        'M12 4.5a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5z',
        'M4.8 20a7.2 7.2 0 0 1 14.4 0',
      ]}
    />
  )
}
