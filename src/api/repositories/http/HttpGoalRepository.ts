import axios from 'axios'
import { httpClient } from '../../httpClient'
import type {
  AddGoalContributionInput,
  CreateGoalInput,
  Goal,
  SavingsProjection,
  UpdateGoalInput,
} from '../../types/goal'
import type { GoalRepository } from '../interfaces/GoalRepository'

const BASE_PATH = '/goals'

class HttpGoalRepository implements GoalRepository {
  async list(): Promise<Goal[]> {
    const response = await httpClient.get<Goal[]>(BASE_PATH)
    return response.data
  }

  async getById(id: string): Promise<Goal | null> {
    try {
      const response = await httpClient.get<Goal>(`${BASE_PATH}/${id}`)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null
      }
      throw error
    }
  }

  async create(input: CreateGoalInput): Promise<Goal> {
    const response = await httpClient.post<Goal>(BASE_PATH, input)
    return response.data
  }

  async update(id: string, input: UpdateGoalInput): Promise<Goal> {
    const response = await httpClient.patch<Goal>(`${BASE_PATH}/${id}`, input)
    return response.data
  }

  async remove(id: string): Promise<void> {
    await httpClient.delete(`${BASE_PATH}/${id}`)
  }

  async addContribution(input: AddGoalContributionInput): Promise<Goal> {
    const response = await httpClient.post<Goal>(
      `${BASE_PATH}/${input.goalId}/contributions`,
      input,
    )
    return response.data
  }

  async getSavingsProjection(months?: number): Promise<SavingsProjection> {
    const response = await httpClient.get<SavingsProjection>(
      `${BASE_PATH}/savings-projection`,
      { params: months === undefined ? {} : { months } },
    )
    return response.data
  }
}

export const httpGoalRepository: GoalRepository = new HttpGoalRepository()
