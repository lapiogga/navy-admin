import { useEffect } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useSessionCheck } from '@/features/auth/hooks/useSessionCheck'
import { SessionWarningModal } from '@/features/auth/components/SessionWarningModal'
import { ROUTES } from '@/shared/config/routes'

interface RequireAuthProps {
  children: React.ReactNode
}

/**
 * 인증 보호 라우트 래퍼.
 * - 미인증 시 /login으로 리다이렉트
 * - Idle 기반 세션 만료 감지 + 경고 Modal (useSessionCheck)
 * - 다른 탭에서 로그아웃 시 storage 이벤트로 감지하여 동기화
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const location = useLocation()

  // Idle 기반 세션 만료 체크 (PTL-04)
  const { isWarningVisible, countdown, extendSession } = useSessionCheck()

  // 다른 탭(서브시스템)에서 로그아웃 시 현재 탭도 로그아웃 동기화
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'auth-storage') {
        const stored = e.newValue ? JSON.parse(e.newValue) : null
        if (!stored?.state?.isAuthenticated) {
          useAuthStore.getState().logout()
        }
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  return (
    <>
      {children}
      <SessionWarningModal
        visible={isWarningVisible}
        countdown={countdown}
        onExtend={extendSession}
        onLogout={() => {
          logout()
          navigate(ROUTES.LOGIN)
        }}
      />
    </>
  )
}
