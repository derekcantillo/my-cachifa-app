import type {
  Settings,
  UpdateSettingsInput,
} from '../../types/settings'
import type { SettingsRepository } from '../interfaces/SettingsRepository'
import { simulateLatency, simulateWrite } from './latency'

let settings: Settings = { targetSavingsPercentage: 30 }

class MockSettingsRepository implements SettingsRepository {
  async get(): Promise<Settings> {
    await simulateLatency()
    return { ...settings }
  }

  async update(input: UpdateSettingsInput): Promise<Settings> {
    await simulateWrite()
    settings = { ...input }
    return { ...settings }
  }
}

export const mockSettingsRepository: SettingsRepository =
  new MockSettingsRepository()
