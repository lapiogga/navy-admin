import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { message } from 'antd'
import { useAuthStore } from '@/features/auth/store/authStore'
import { ROUTES } from '@/shared/config/routes'

export const IDLE_TIMEOUT_MS = 60_000   // 1분 (D-04: MVP 테스트 용이성)
export const WARN_BEFORE_MS = 30_000    // 만료 30초 전 경고 (D-05)

/**
 * Idle 기반 세션 만료 감지 훅.
 * - 5가지 사용자 활동 이벤트를 감지하여 idle 타이머를 리셋
 * - 만료 30초 전: 경고 Modal 표시 + 카운트다운 시작
 * - 만료 시: authStore.logout() + /login 이동 + message.warning
 * - 반환: { isWarningVisible, countdown, extendSession }
 */
export function useSessionCheck() {
  const logout = useAuthStore((s) => s.logout)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const navigate = useNavigate()
  const [isWarningVisible, setIsWarningVisible] = useState(false)
  const [countdown, setCountdown] = useState(30)

  const warnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearAllTimers = useCallback(() => {
    if (warnTimerRef.current) { clearTimeout(warnTimerRef.current); warnTimerRef.current = null }
    if (idleTimerRef.current) { clearTimeout(idleTimerRef.current); idleTimerRef.current = null }
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null }
  }, [])

  const resetTimers = useCallback(() => {
    clearAllTimers()
    setIsWarningVisible(false)
    setCountdown(30)

    // 경고 타이머: 만료 30초 전에 Modal 표시
    warnTimerRef.current = setTimeout(() => {
      setIsWarningVisible(true)
      let cnt = 30
      countdownRef.current = setInterval(() => {
        cnt -= 1
        setCountdown(cnt)
        if (cnt <= 0 && countdownRef.current) {
          clearInterval(countdownRef.current)
          countdownRef.current = null
        }
      }, 1000)
    }, IDLE_TIMEOUT_MS - WARN_BEFORE_MS)

    // Idle 타이머: 만료 시 강제 로그아웃
    idleTimerRef.current = setTimeout(() => {
      clearAllTimers()
      logout()
      navigate(ROUTES.LOGIN, { replace: true })
      message.warning('세션이 만료되었습니다. 다시 로그인하세요')
    }, IDLE_TIMEOUT_MS)
  }, [logout, navigate, clearAllTimers])

  useEffect(() => {
    if (!isAuthenticated) {
      clearAllTimers()
      return
    }

    const events: string[] = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    const handleActivity = () => {
      // 경고 Modal이 표시된 상태에서는 일반 활동으로 리셋하지 않음
      // (버튼 클릭으로만 연장/로그아웃 가능)
      // 단, 경고 전에는 모든 활동이 타이머를 리셋
      if (!warnTimerRef.current && !idleTimerRef.current) return
      // 경고 Modal 표시 중이 아닐 때만 리셋
      resetTimers()
    }

    events.forEach((e) => window.addEventListener(e, handleActivity, { passive: true }))
    resetTimers() // 초기 타이머 시작

    return () => {
      clearAllTimers()
      events.forEach((e) => window.removeEventListener(e, handleActivity))
    }
  }, [isAuthenticated, resetTimers, clearAllTimers])

  const extendSession = useCallback(() => {
    resetTimers()
  }, [resetTimers])

  return { isWarningVisible, countdown, extendSession }
}
