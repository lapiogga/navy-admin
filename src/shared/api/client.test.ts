import { describe, it, expect } from 'vitest'
import { apiClient } from './client'

describe('apiClient', () => {
  it('baseURL이 /api로 설정되어 있다', () => {
    expect(apiClient.defaults.baseURL).toBe('/api')
  })

  it('timeout이 10000ms로 설정되어 있다', () => {
    expect(apiClient.defaults.timeout).toBe(10000)
  })

  it('Content-Type 헤더가 application/json이다', () => {
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json')
  })
})
