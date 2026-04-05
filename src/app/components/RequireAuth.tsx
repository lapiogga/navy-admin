import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useSessionCheck } from '@/features/auth/hooks/useSessionCheck'
import { ROUTES } from '@/shared/config/routes'

interface RequireAuthProps {
  children: React.ReactNode
}

/**
 * 인증 보호 라우트 래퍼.
 * - 미인증 시 /login으로 리다이렉트
 * - 인증된 상태에서 세션 만료를 1분 간격으로 자동 체크 (useSessionCheck)
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = useLocation()

  // 세션 만료 주기적 체크 (per BASE-08)
  useSessionCheck()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  return <>{children}</>
}
