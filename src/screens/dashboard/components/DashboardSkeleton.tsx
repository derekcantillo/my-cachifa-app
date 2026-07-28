import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Card, Skeleton } from '@/components'
import { useTheme } from '@/theme'

/** Mirrors the dashboard layout while the queries resolve. */
export function DashboardSkeleton() {
  const { spacing } = useTheme()

  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ gap: spacing.xs }}>
        <Skeleton width={200} height={30} />
        <Skeleton width={140} height={14} />
      </View>

      <Card>
        <View style={{ gap: spacing.xs }}>
          <Skeleton height={20} width="55%" />
          <Skeleton height={14} width="30%" />
        </View>
        <View style={[styles.ring, { marginVertical: spacing.lg }]}>
          <Skeleton width={180} height={180} radius={90} />
        </View>
        <View style={{ gap: spacing.sm }}>
          <Skeleton height={24} width="60%" />
          <Skeleton height={24} width="50%" />
          <Skeleton height={28} width="45%" radius={999} />
        </View>
      </Card>

      <Card>
        <View style={{ gap: spacing.sm }}>
          <Skeleton height={20} width="45%" />
          <Skeleton height={16} />
          <Skeleton height={16} width="80%" />
          <Skeleton height={44} radius={12} />
        </View>
      </Card>

      <Card>
        <View style={{ gap: spacing.xs }}>
          <Skeleton height={12} width="25%" />
          <Skeleton height={20} width="65%" />
        </View>
      </Card>

      <Card>
        <View style={{ gap: spacing.md }}>
          {[0, 1, 2].map(row => (
            <View key={row} style={styles.row}>
              <Skeleton width={40} height={40} radius={20} />
              <View
                style={[
                  styles.body,
                  { marginLeft: spacing.md, gap: spacing.xs },
                ]}
              >
                <Skeleton height={14} width="70%" />
                <Skeleton height={12} width="45%" />
              </View>
            </View>
          ))}
        </View>
      </Card>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  body: {
    flex: 1,
  },
  ring: {
    alignItems: 'center',
  },
})
