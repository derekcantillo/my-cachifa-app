import React from 'react'
import { Button, PlusIcon } from '@/components'
import { useTheme } from '@/theme'

interface CreateGoalButtonProps {
  onPress: () => void
}

const LABEL = 'Crear nueva meta'

export function CreateGoalButton({ onPress }: CreateGoalButtonProps) {
  const { colors } = useTheme()

  return (
    <Button
      label={LABEL}
      onPress={onPress}
      icon={<PlusIcon size={18} color={colors.brandText} />}
    />
  )
}
