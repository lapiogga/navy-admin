import { useAuthStore } from '@/features/auth/store/authStore'

/**
 * 현재 사용자의 권한을 체크하는 훅.
 * Phase 1: Mock 구현 (항상 true 반환).
 * Phase 2에서 실 권한 체크 연결.
 */
export function usePermission() {
  const user = useAuthStore((s) => s.user)
  const roles = user?.roles ?? []

  return {
    /** 특정 메뉴 경로에 접근 가능한지 확인 */
    hasMenuAccess: (_menuPath: string): boolean => {
      // Phase 1: 항상 true (관리 화면만 구현, 접근 제어는 Phase 2)
      return true
    },
    /** 특정 권한그룹 코드를 보유하고 있는지 확인 */
    hasRole: (roleCode: string): boolean => {
      return roles.includes(roleCode)
    },
    /** 현재 사용자의 권한그룹 코드 목록 */
    roles,
  }
}
