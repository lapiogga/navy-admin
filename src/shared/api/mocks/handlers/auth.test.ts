import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { setupServer } from 'msw/node'
import { authHandlers } from './auth'

const server = setupServer(...authHandlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('authHandlers', () => {
  it('admin/1234 인증 시 success: true와 user를 반환한다', async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: '1234' }),
    })

    expect(response.ok).toBe(true)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.user.username).toBe('admin')
    expect(data.data.token).toBeDefined()
  })

  it('잘못된 인증 시 status 401과 에러 메시지를 반환한다', async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'wrong', password: 'wrong' }),
    })

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.message).toBeDefined()
  })

  it('GET /api/auth/me가 사용자 정보를 반환한다', async () => {
    const response = await fetch('/api/auth/me')
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.username).toBe('admin')
    expect(data.data.rank).toBeDefined()
  })
})
