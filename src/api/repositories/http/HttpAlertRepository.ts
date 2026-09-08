import { httpClient } from '../../httpClient'
import type { Alert, AlertType } from '../../types/alert'
import type { AlertRepository } from '../interfaces/AlertRepository'

const BASE_PATH = '/alerts'

/** The backend's `Alert` calls these `read` and `sentAt` — renamed on the way in. */
interface AlertDto {
  id: string
  type: AlertType
  message: string
  read: boolean
  sentAt: string
}

function toAlert(dto: AlertDto): Alert {
  return {
    id: dto.id,
    type: dto.type,
    message: dto.message,
    isRead: dto.read,
    createdAt: dto.sentAt,
  }
}

class HttpAlertRepository implements AlertRepository {
  async getAll(unreadOnly?: boolean): Promise<Alert[]> {
    const response = await httpClient.get<AlertDto[]>(BASE_PATH, {
      params: unreadOnly ? { unreadOnly: true } : undefined,
    })
    return response.data.map(toAlert)
  }

  async getUnreadCount(): Promise<number> {
    const response = await httpClient.get<{ count: number }>(
      `${BASE_PATH}/unread-count`,
    )
    return response.data.count
  }

  async markRead(id: string): Promise<Alert> {
    const response = await httpClient.patch<AlertDto>(
      `${BASE_PATH}/${id}/read`,
      {},
    )
    return toAlert(response.data)
  }

  async markAllRead(): Promise<{ updated: number }> {
    const response = await httpClient.post<{ updated: number }>(
      `${BASE_PATH}/read-all`,
      {},
    )
    return response.data
  }
}

export const httpAlertRepository: AlertRepository = new HttpAlertRepository()
