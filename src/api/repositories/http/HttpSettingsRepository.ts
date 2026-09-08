import { httpClient } from '../../httpClient'
import { toAmount } from '../../mappers/decimalMapper'
import type { Settings, UpdateSettingsInput } from '../../types/settings'
import type { SettingsRepository } from '../interfaces/SettingsRepository'

const BASE_PATH = '/settings'

interface SettingsDto {
  targetSavingsPercentage: number | string
}

function toSettings(dto: SettingsDto): Settings {
  return { targetSavingsPercentage: toAmount(dto.targetSavingsPercentage) }
}

class HttpSettingsRepository implements SettingsRepository {
  async get(): Promise<Settings> {
    const response = await httpClient.get<SettingsDto>(BASE_PATH)
    return toSettings(response.data)
  }

  async update(input: UpdateSettingsInput): Promise<Settings> {
    const response = await httpClient.patch<SettingsDto>(BASE_PATH, input)
    return toSettings(response.data)
  }
}

export const httpSettingsRepository: SettingsRepository =
  new HttpSettingsRepository()
