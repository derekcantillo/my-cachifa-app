import React from 'react'
import { Pressable, ScrollView, StyleSheet } from 'react-native'
import type { Category } from '@/api/types'
import { Badge } from '@/components'
import { useTheme } from '@/theme'

interface CategoryFilterChipsProps {
  categories: Category[]
  /** `null` means "every category". */
  value: string | null
  onChange: (categoryId: string | null) => void
}

const ALL_LABEL = 'Todas'

export function CategoryFilterChips({
  categories,
  value,
  onChange,
}: CategoryFilterChipsProps) {
  const { spacing } = useTheme()

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.content, { gap: spacing.sm }]}
    >
      <Chip
        label={ALL_LABEL}
        selected={value === null}
        onPress={() => onChange(null)}
      />
      {categories.map(category => (
        <Chip
          key={category.id}
          label={category.name}
          color={category.color}
          selected={value === category.id}
          onPress={() => onChange(value === category.id ? null : category.id)}
        />
      ))}
    </ScrollView>
  )
}

interface ChipProps {
  label: string
  selected: boolean
  onPress: () => void
  color?: string
}

function Chip({ label, selected, onPress, color }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <Badge label={label} color={color} solid={selected} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
})
