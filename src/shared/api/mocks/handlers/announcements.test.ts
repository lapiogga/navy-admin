import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('announcements MSW handler', () => {
  const content = readFileSync(
    resolve(__dirname, './announcements.ts'),
    'utf-8'
  )

  it('should export announcementHandlers array', () => {
    expect(content).toContain('export const announcementHandlers')
  })

  it('should use http.get for /api/announcements', () => {
    expect(content).toContain('http.get')
    expect(content).toContain('/api/announcements')
  })

  it('should return ApiResult format with success flag', () => {
    expect(content).toContain('success: true')
  })

  it('should include isUrgent field in mock data', () => {
    expect(content).toContain('isUrgent')
  })
})
