import React, { useCallback } from 'react'
import { View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import {
  BellIcon,
  Button,
  Card,
  EmptyState,
  ErrorNotice,
  ModalScreen,
  Separator,
  Skeleton,
} from '@/components'
import { useAlerts, useMarkAllAlertsRead } from '@/hooks'
import { useTheme } from '@/theme'
import { AlertListItem } from './AlertListItem'
import { useAlertNavigation } from './useAlertNavigation'

export function AlertsScreen() {
  const { spacing } = useTheme()
  const navigation = useNavigation()

  const alertsQuery = useAlerts()
  const markAllRead = useMarkAllAlertsRead()
  const handleAlertPress = useAlertNavigation()

  const alerts = alertsQuery.data ?? []
  const hasUnread = alerts.some(alert => !alert.isRead)

  const handleMarkAllRead = useCallback(() => {
    markAllRead.mutate()
  }, [markAllRead])

  return (
    <ModalScreen title="Notificaciones" onClose={navigation.goBack}>
      {hasUnread && (
        <Button
          label="Marcar todas como leídas"
          variant="outline"
          onPress={handleMarkAllRead}
          loading={markAllRead.isPending}
        />
      )}

      <ErrorNotice error={markAllRead.error} />

      {alertsQuery.isPending ? (
        <View style={{ gap: spacing.md }}>
          <Skeleton height={56} radius={14} />
          <Skeleton height={56} radius={14} />
          <Skeleton height={56} radius={14} />
        </View>
      ) : alertsQuery.isError ? (
        <ErrorNotice error={alertsQuery.error} />
      ) : alerts.length === 0 ? (
        <EmptyState
          icon={<BellIcon size={28} />}
          title="Sin notificaciones"
          description="Aquí verás tus alertas de presupuesto, gastos fijos y metas cuando aparezcan."
        />
      ) : (
        <Card>
          {alerts.map((alert, index) => (
            <View key={alert.id}>
              {index > 0 && <Separator />}
              <AlertListItem alert={alert} onPress={handleAlertPress} />
            </View>
          ))}
        </Card>
      )}
    </ModalScreen>
  )
}
