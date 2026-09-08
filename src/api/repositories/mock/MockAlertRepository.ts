import type { Alert } from '../../types/alert'
import type { AlertRepository } from '../interfaces/AlertRepository'
import { simulateLatency, simulateWrite } from './latency'
import { seedAlerts } from './seed-data'

let alerts: Alert[] = seedAlerts.map(alert => ({ ...alert }))

class MockAlertRepository implements AlertRepository {
  async getAll(unreadOnly?: boolean): Promise<Alert[]> {
    await simulateLatency()

    return alerts
      .filter(alert => !unreadOnly || !alert.isRead)
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .map(alert => ({ ...alert }))
  }

  async getUnreadCount(): Promise<number> {
    await simulateLatency()
    return alerts.filter(alert => !alert.isRead).length
  }

  async markRead(id: string): Promise<Alert> {
    await simulateWrite()

    const existing = alerts.find(alert => alert.id === id)
    if (!existing) {
      throw new Error(`Alert ${id} not found`)
    }

    const updated: Alert = { ...existing, isRead: true }
    alerts = alerts.map(alert => (alert.id === id ? updated : alert))
    return { ...updated }
  }

  async markAllRead(): Promise<{ updated: number }> {
    await simulateWrite()

    const unread = alerts.filter(alert => !alert.isRead)
    alerts = alerts.map(alert => (alert.isRead ? alert : { ...alert, isRead: true }))
    return { updated: unread.length }
  }
}

export const mockAlertRepository: AlertRepository = new MockAlertRepository()
