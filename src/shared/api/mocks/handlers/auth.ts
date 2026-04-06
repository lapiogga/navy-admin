import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker/locale/ko'
import type { ApiResult } from '@/shared/api/types'
import type { User, LoginResponse } from '@/entities/user/types'

const mockUser: User = {
  id: faker.string.uuid(),
  name: '홍길동',
  rank: '대위',
  unit: '해군본부',
  username: 'admin',
  roles: ['ADMIN', 'SYS01_USER', 'SYS02_USER'],
}

export const authHandlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { username: string; password: string }
    if (body.username === 'admin' && body.password === '1234') {
      const result: ApiResult<LoginResponse> = {
        success: true,
        data: { token: 'mock-jwt-token-' + Date.now(), user: mockUser },
      }
      return HttpResponse.json(result)
    }
    const result: ApiResult = { success: false, data: undefined as never, message: '아이디 또는 비밀번호가 올바르지 않습니다' }
    return HttpResponse.json(result, { status: 401 })
  }),

  http.get('/api/auth/me', () => {
    const result: ApiResult<User> = { success: true, data: mockUser }
    return HttpResponse.json(result)
  }),

  http.post('/api/auth/logout', () => {
    const result: ApiResult = { success: true, data: undefined as never, message: '로그아웃 되었습니다' }
    return HttpResponse.json(result)
  }),
]
