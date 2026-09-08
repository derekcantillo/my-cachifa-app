import type { Settings, UpdateSettingsInput } from '../../types/settings'

export interface SettingsRepository {
  get(): Promise<Settings>
  update(input: UpdateSettingsInput): Promise<Settings>
}
