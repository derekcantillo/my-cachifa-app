import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import { loanRepository } from '@/api/repositoryFactory'
import type {
  CreateLoanInput,
  CreateLoanRepaymentInput,
  UpdateLoanInput,
} from '@/api/types'
import { queryKeys } from './queryKeys'

export function useLoans() {
  return useQuery({
    queryKey: queryKeys.loans(),
    queryFn: () => loanRepository.getAll(),
  })
}

export function useLoan(id: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.loan(id),
    queryFn: () => loanRepository.getById(id),
    enabled: options.enabled ?? Boolean(id),
  })
}

/**
 * A loan and its repayments each create a linked movement that changes an
 * account's `currentBalance`, so both invalidate accounts too — not just the
 * loans list.
 */
function invalidateLoanConsumers(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: queryKeys.loansRoot })
  queryClient.invalidateQueries({ queryKey: queryKeys.accounts() })
}

export function useCreateLoan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateLoanInput) => loanRepository.create(input),
    onSuccess: () => {
      invalidateLoanConsumers(queryClient)
    },
  })
}

export interface CreateLoanRepaymentVariables {
  id: string
  input: CreateLoanRepaymentInput
}

export function useCreateLoanRepayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: CreateLoanRepaymentVariables) =>
      loanRepository.addRepayment(id, input),
    onSuccess: () => {
      invalidateLoanConsumers(queryClient)
    },
  })
}

export interface UpdateLoanVariables {
  id: string
  input: UpdateLoanInput
}

export function useUpdateLoan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: UpdateLoanVariables) =>
      loanRepository.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loansRoot })
    },
  })
}

export function useDeleteLoan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => loanRepository.delete(id),
    onSuccess: () => {
      // Only a loan with no repayments can be deleted, and deleting one
      // takes its linked movement with it — so the balance moves too.
      invalidateLoanConsumers(queryClient)
    },
  })
}
