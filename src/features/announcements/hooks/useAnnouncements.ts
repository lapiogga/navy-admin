import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import type { ApiResult } from '@/shared/api/types'
import type { Announcement } from '../types'

export function useAnnouncements() {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: () =>
      apiClient
        .get<unknown, ApiResult<Announcement[]>>('/announcements')
        .then((r) => (r as ApiResult<Announcement[]>).data ?? (r as unknown as Announcement[])),
  })
}
