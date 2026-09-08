import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { settingsRepository } from '@/api/repositoryFactory'
import type { UpdateSettingsInput } from '@/api/types'
import { queryKeys } from './queryKeys'

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings(),
    queryFn: () => settingsRepository.get(),
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateSettingsInput) =>
      settingsRepository.update(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings() })
    },
  })
}
