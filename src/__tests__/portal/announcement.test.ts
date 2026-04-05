import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('AnnouncementSection', () => {
  const content = readFileSync(
    resolve(__dirname, '../../features/announcements/components/AnnouncementSection.tsx'),
    'utf-8'
  )

  it('should use antd List with size="small"', () => {
    expect(content).toContain('size="small"')
  })

  it('should render Alert for urgent announcements', () => {
    expect(content).toContain('Alert')
    expect(content).toContain('type="warning"')
  })

  it('should show empty text when no announcements', () => {
    expect(content).toContain('등록된 공지사항이 없습니다')
  })

  it('should use useAnnouncements hook', () => {
    expect(content).toContain('useAnnouncements')
  })
})

describe('AnnouncementHandlers', () => {
  const handlerContent = readFileSync(
    resolve(__dirname, '../../shared/api/mocks/handlers/announcements.ts'),
    'utf-8'
  )

  it('should handle GET /api/announcements', () => {
    expect(handlerContent).toContain("'/api/announcements'")
  })

  it('should include 3 mock announcements', () => {
    expect(handlerContent).toContain('시스템 점검 안내')
    expect(handlerContent).toContain('해군 행정포탈 v1.0 오픈')
    expect(handlerContent).toContain('사용자 매뉴얼 배포')
  })
})
