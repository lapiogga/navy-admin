import { http, HttpResponse } from 'msw'
import type { ApiResult } from '@/shared/api/types'
import type { Announcement } from '@/features/announcements/types'

const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: '시스템 점검 안내',
    content: '2026-04-06 00:00~06:00 시스템 점검이 예정되어 있습니다.',
    createdAt: '2026-04-05',
    isUrgent: true,
  },
  {
    id: '2',
    title: '해군 행정포탈 v1.0 오픈',
    content: '해군 행정포탈 시스템이 정식 오픈되었습니다.',
    createdAt: '2026-04-04',
    isUrgent: false,
  },
  {
    id: '3',
    title: '사용자 매뉴얼 배포',
    content: '시스템 사용자 매뉴얼이 배포되었습니다.',
    createdAt: '2026-04-03',
    isUrgent: false,
  },
]

export const announcementHandlers = [
  http.get('/api/announcements', () => {
    const result: ApiResult<Announcement[]> = {
      success: true,
      data: mockAnnouncements,
    }
    return HttpResponse.json(result)
  }),
]
