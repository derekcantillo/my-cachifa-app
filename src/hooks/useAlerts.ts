import { useCallback } from 'react'
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import { useFocusEffect } from '@react-navigation/native'
import { alertRepository } from '@/api/repositoryFactory'
import { queryKeys } from './queryKeys'

/** Good enough to keep the badge fresh without polling the backend hard. */
const UNREAD_COUNT_REFETCH_MS = 60_000

export function useAlerts(unreadOnly?: boolean) {
  return useQuery({
    queryKey: queryKeys.alerts(unreadOnly),
    queryFn: () => alertRepository.getAll(unreadOnly),
  })
}

/**
 * Backs the bell's badge, so it polls on an interval and also refetches the
 * moment the screen regains focus — reading an alert elsewhere in the app and
 * coming back to Inicio should drop the count without waiting for the timer.
 */
export function useUnreadAlertsCount() {
  const query = useQuery({
    queryKey: queryKeys.unreadAlertsCount(),
    queryFn: () => alertRepository.getUnreadCount(),
    refetchInterval: UNREAD_COUNT_REFETCH_MS,
  })

  const { refetch } = query
  useFocusEffect(
    useCallback(() => {
      refetch()
    }, [refetch]),
  )

  return query
}

function invalidateAlerts(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: queryKeys.alertsRoot })
}

export function useMarkAlertRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => alertRepository.markRead(id),
    onSuccess: () => {
      invalidateAlerts(queryClient)
    },
  })
}

export function useMarkAllAlertsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => alertRepository.markAllRead(),
    onSuccess: () => {
      invalidateAlerts(queryClient)
    },
  })
}
