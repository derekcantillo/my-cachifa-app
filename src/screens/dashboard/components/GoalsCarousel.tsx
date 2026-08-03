import React from 'react'
import { FlatList, View } from 'react-native'
import type { Goal } from '@/api/types'
import { EmptyState, GoalCard, SectionHeader, TargetIcon } from '@/components'
import { useTheme } from '@/theme'

interface GoalsCarouselProps {
  goals: Goal[]
  /** Horizontal padding to bleed against, so cards align with the screen. */
  edgeInset: number
  onSeeAllPress?: () => void
  onGoalPress?: (goal: Goal) => void
  /** Sends the user to the goals tab from the empty state. */
  onCreatePress: () => void
}

const CARD_WIDTH = 240

export function GoalsCarousel({
  goals,
  edgeInset,
  onSeeAllPress,
  onGoalPress,
  onCreatePress,
}: GoalsCarouselProps) {
  const { colors, spacing } = useTheme()

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
        <View style={{ paddingHorizontal: edgeInset }}>
          <EmptyState
            icon={<TargetIcon size={26} color={colors.textSecondary} />}
            title="Sin metas activas"
            description="Define a dónde quieres llegar y sigue tu avance mes a mes."
            actionLabel="Ir a Metas"
            onAction={onCreatePress}
          />
        </View>
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
          renderItem={({ item }) => (
            <GoalCard goal={item} width={CARD_WIDTH} onPress={onGoalPress} />
          )}
        />
      )}
    </View>
  )
}
