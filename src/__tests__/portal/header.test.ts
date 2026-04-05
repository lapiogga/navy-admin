import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('MainPortalLayout header', () => {
  const content = readFileSync(
    resolve(__dirname, '../../app/layouts/MainPortalLayout.tsx'),
    'utf-8'
  )

  it('should display system name "해군 행정포탈"', () => {
    expect(content).toContain('해군 행정포탈')
  })

  it('should display user rank, name, and unit', () => {
    expect(content).toContain('user.rank')
    expect(content).toContain('user.name')
    expect(content).toContain('user.unit')
  })

  it('should show logout success message', () => {
    expect(content).toContain("message.success('로그아웃 되었습니다')")
  })

  it('should use background color #001529 for header', () => {
    expect(content).toContain('#001529')
  })
})

describe('SubsystemProLayout - 메인포탈 복귀 (D-08)', () => {
  const layoutContent = readFileSync(
    resolve(__dirname, '../../app/layouts/PortalLayout.tsx'),
    'utf-8'
  )

  it('should have handleGoPortal function', () => {
    expect(layoutContent).toContain('handleGoPortal')
  })

  it('should call window.opener.focus() before window.close() inside handleGoPortal', () => {
    // handleGoPortal 함수 블록만 추출하여 검증
    const goPortalStart = layoutContent.indexOf('handleGoPortal')
    const goPortalBlock = layoutContent.slice(goPortalStart, goPortalStart + 200)
    const focusIdx = goPortalBlock.indexOf('opener.focus()')
    const closeIdx = goPortalBlock.indexOf('window.close()')
    expect(focusIdx).toBeGreaterThan(-1)
    expect(closeIdx).toBeGreaterThan(-1)
    expect(focusIdx).toBeLessThan(closeIdx)
  })

  it('should fallback to navigate(ROUTES.PORTAL) when no opener', () => {
    expect(layoutContent).toContain('navigate(ROUTES.PORTAL)')
  })

  it('should have "메인포탈로 돌아가기" menu item', () => {
    expect(layoutContent).toContain('메인포탈로 돌아가기')
  })
})
