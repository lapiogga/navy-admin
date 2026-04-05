import { describe, it, expect } from 'vitest'
import { ROUTES } from '@/shared/config/routes'
import { SUBSYSTEM_META } from '@/entities/subsystem/config'

describe('ROUTES 상수', () => {
  it('LOGIN 경로가 /login이다', () => {
    expect(ROUTES.LOGIN).toBe('/login')
  })

  it('PORTAL 경로가 /이다', () => {
    expect(ROUTES.PORTAL).toBe('/')
  })

  it('18개 서브시스템 경로가 모두 정의되어 있다', () => {
    for (let i = 1; i <= 18; i++) {
      const key = `SYS${String(i).padStart(2, '0')}` as keyof typeof ROUTES
      expect(ROUTES[key]).toBeDefined()
      expect((ROUTES[key] as { ROOT: string }).ROOT).toBe(`/sys${String(i).padStart(2, '0')}`)
    }
  })

  it('COMMON 하위 경로가 정의되어 있다', () => {
    expect(ROUTES.COMMON.AUTH_GROUP).toBe('/common/auth-group')
    expect(ROUTES.COMMON.CODE_MGMT).toBe('/common/code-mgmt')
    expect(ROUTES.COMMON.BOARD).toBe('/common/board')
  })
})

describe('SUBSYSTEM_META', () => {
  it('18개 서브시스템 메타데이터가 존재한다', () => {
    expect(Object.keys(SUBSYSTEM_META)).toHaveLength(18)
  })

  it('각 서브시스템에 필수 필드가 존재한다', () => {
    Object.values(SUBSYSTEM_META).forEach((meta) => {
      expect(meta.code).toBeDefined()
      expect(meta.name).toBeDefined()
      expect(meta.path).toMatch(/^\/sys\d{2}$/)
      expect(meta.componentPrefix).toBeDefined()
      expect(meta.processCount).toBeGreaterThan(0)
    })
  })
})
