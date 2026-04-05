import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/authStore'
import { ROUTES } from '@/shared/config/routes'

const SESSION_CHECK_INTERVAL = 60 * 1000  // 1분마다 체크

/**
 * 세션 만료를 주기적으로 체크하는 훅.
 * RequireAuth 내부에서 사용하여, 세션이 만료되면 자동으로 로그아웃하고 /login으로 이동한다.
 * (CLAUDE.md: 세션만료 시 로그인으로 이동)
 */
export function useSessionCheck() {
  const checkSession = useAuthStore((s) => s.checkSession)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) return

    const intervalId = setInterval(() => {
      const valid = checkSession()
      if (!valid) {
        navigate(ROUTES.LOGIN, { replace: true })
      }
    }, SESSION_CHECK_INTERVAL)

    return () => clearInterval(intervalId)
  }, [isAuthenticated, checkSession, navigate])
}
