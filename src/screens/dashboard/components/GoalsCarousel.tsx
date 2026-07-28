import React from 'react'
import { FlatList, Text, View } from 'react-native'
import type { Goal } from '@/api/types'
import { GoalCard, SectionHeader } from '@/components'
import { useTheme } from '@/theme'

interface GoalsCarouselProps {
  goals: Goal[]
  /** Horizontal padding to bleed against, so cards align with the screen. */
  edgeInset: number
  onSeeAllPress?: () => void
}

const CARD_WIDTH = 240

export function GoalsCarousel({
  goals,
  edgeInset,
  onSeeAllPress,
}: GoalsCarouselProps) {
  const { colors, spacing, typography } = useTheme()

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={{ paddingHorizontal: edgeInset }}>
        <SectionHeader
          title="Mis Metas"
          actionLabel={goals.length > 0 ? 'Ver todas' : undefined}
          onActionPress={onSeeAllPress}
        />
      </View>

      {goals.length === 0 ? (
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: typography.fontSizes.sm,
            paddingHorizontal: edgeInset,
          }}
        >
          Todavía no tienes metas activas.
        </Text>
      ) : (
        <FlatList
          horizontal
          data={goals}
          keyExtractor={goal => goal.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: edgeInset,
            gap: spacing.sm,
          }}
          renderItem={({ item }) => <GoalCard goal={item} width={CARD_WIDTH} />}
        />
      )}
    </View>
  )
}
