import { useQuery } from '@tanstack/react-query'
import { codeApi } from '@/entities/code/api'

export function useCodeOptions(groupCode: string) {
  return useQuery({
    queryKey: ['code-options', groupCode],
    queryFn: () => codeApi.getOptions(groupCode),
    staleTime: 5 * 60 * 1000,
    enabled: !!groupCode,
  })
}
