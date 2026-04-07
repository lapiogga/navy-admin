import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const hookPath = resolve(__dirname, './useSessionCheck.ts')
const hookContent = readFileSync(hookPath, 'utf-8')

describe('useSessionCheck - 코드 구조 검증', () => {
  it('should export IDLE_TIMEOUT_MS as 60000', () => {
    expect(hookContent).toContain('IDLE_TIMEOUT_MS = 180_000')
  })

  it('should export WARN_BEFORE_MS as 30000', () => {
    expect(hookContent).toContain('WARN_BEFORE_MS = 30_000')
  })

  it('should listen to 5 idle events: mousemove, keydown, click, scroll, touchstart', () => {
    expect(hookContent).toContain('mousemove')
    expect(hookContent).toContain('keydown')
    expect(hookContent).toContain('click')
    expect(hookContent).toContain('scroll')
    expect(hookContent).toContain('touchstart')
  })

  it('should use useCallback for resetTimers to prevent infinite re-renders', () => {
    expect(hookContent).toContain('useCallback')
  })

  it('should clear all 3 timers: warnTimer, idleTimer, countdownInterval', () => {
    expect(hookContent).toContain('warnTimerRef')
    expect(hookContent).toContain('idleTimerRef')
    expect(hookContent).toContain('countdownRef')
    expect(hookContent).toContain('clearTimeout')
    expect(hookContent).toContain('clearInterval')
  })

  it('should return isWarningVisible, countdown, extendSession', () => {
    expect(hookContent).toContain('return { isWarningVisible, countdown, extendSession }')
  })

  it('should call logout and navigate to LOGIN on timeout', () => {
    expect(hookContent).toContain('logout()')
    expect(hookContent).toContain('ROUTES.LOGIN')
  })

  it('should show session expired message', () => {
    expect(hookContent).toContain('세션이 만료되었습니다. 다시 로그인하세요')
  })

  it('should use passive event listeners', () => {
    expect(hookContent).toContain('passive: true')
  })

  it('should clean up event listeners on unmount', () => {
    expect(hookContent).toContain('removeEventListener')
  })
})

describe('RequireAuth - SessionWarningModal 연동 검증', () => {
  const requireAuthContent = readFileSync(
    resolve(__dirname, '../../../app/components/RequireAuth.tsx'),
    'utf-8'
  )

  it('should import SessionWarningModal', () => {
    expect(requireAuthContent).toContain('SessionWarningModal')
  })

  it('should destructure useSessionCheck return values', () => {
    expect(requireAuthContent).toContain('isWarningVisible')
    expect(requireAuthContent).toContain('countdown')
    expect(requireAuthContent).toContain('extendSession')
  })

  it('should render SessionWarningModal with correct props', () => {
    expect(requireAuthContent).toContain('visible={isWarningVisible}')
    expect(requireAuthContent).toContain('countdown={countdown}')
    expect(requireAuthContent).toContain('onExtend={extendSession}')
    expect(requireAuthContent).toContain('onLogout=')
  })

  it('should maintain cross-tab logout sync', () => {
    expect(requireAuthContent).toContain('auth-storage')
    expect(requireAuthContent).toContain('handleStorage')
  })
})
