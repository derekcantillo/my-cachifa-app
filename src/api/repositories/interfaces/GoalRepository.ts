import type {
  AddGoalContributionInput,
  CreateGoalInput,
  Goal,
  SavingsProjection,
  UpdateGoalInput,
} from '../../types/goal'

export interface GoalRepository {
  list(): Promise<Goal[]>
  getById(id: string): Promise<Goal | null>
  create(input: CreateGoalInput): Promise<Goal>
  update(id: string, input: UpdateGoalInput): Promise<Goal>
  remove(id: string): Promise<void>
  addContribution(input: AddGoalContributionInput): Promise<Goal>
  /**
   * Accumulated savings across every goal for the coming periods, with the
   * events that bend the curve.
   *
   * @param months How many periods to project, the current one included.
   */
  getSavingsProjection(months?: number): Promise<SavingsProjection>
}
