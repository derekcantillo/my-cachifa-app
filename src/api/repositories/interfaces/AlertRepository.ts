import type { Alert } from '../../types/alert'

export interface AlertRepository {
  getAll(unreadOnly?: boolean): Promise<Alert[]>
  getUnreadCount(): Promise<number>
  markRead(id: string): Promise<Alert>
  markAllRead(): Promise<{ updated: number }>
}
