import type {
  AddGoalContributionInput,
  CreateGoalInput,
  Goal,
  UpdateGoalInput,
} from '../../types/goal'

export interface GoalRepository {
  list(): Promise<Goal[]>
  getById(id: string): Promise<Goal | null>
  create(input: CreateGoalInput): Promise<Goal>
  update(id: string, input: UpdateGoalInput): Promise<Goal>
  remove(id: string): Promise<void>
  addContribution(input: AddGoalContributionInput): Promise<Goal>
}
