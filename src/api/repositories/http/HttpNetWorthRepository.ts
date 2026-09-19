import { httpClient } from '../../httpClient'
import { toAmount } from '../../mappers/decimalMapper'
import type { NetWorth } from '../../types/netWorth'
import type { NetWorthRepository } from '../interfaces/NetWorthRepository'

const BASE_PATH = '/net-worth'

type Amount = number | string

interface NetWorthDto {
  assets: {
    accountsBalance: Amount
    receivables: Amount
    goalsSavings: Amount
    creditCardsAvailable: Amount
  }
  liabilities: {
    debts: Amount
    creditCardsDebt: Amount
  }
  netWorth: Amount
}

function toNetWorth(dto: NetWorthDto): NetWorth {
  return {
    assets: {
      accountsBalance: toAmount(dto.assets.accountsBalance),
      receivables: toAmount(dto.assets.receivables),
      goalsSavings: toAmount(dto.assets.goalsSavings),
      creditCardsAvailable: toAmount(dto.assets.creditCardsAvailable),
    },
    liabilities: {
      debts: toAmount(dto.liabilities.debts),
      creditCardsDebt: toAmount(dto.liabilities.creditCardsDebt),
    },
    netWorth: toAmount(dto.netWorth),
  }
}

class HttpNetWorthRepository implements NetWorthRepository {
  async get(): Promise<NetWorth> {
    const response = await httpClient.get<NetWorthDto>(BASE_PATH)
    return toNetWorth(response.data)
  }
}

export const httpNetWorthRepository: NetWorthRepository =
  new HttpNetWorthRepository()
