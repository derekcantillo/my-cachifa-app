import type { NetWorth } from '../../types/netWorth'

export interface NetWorthRepository {
  get(): Promise<NetWorth>
}
