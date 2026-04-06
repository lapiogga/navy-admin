import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './authStore'

describe('useAuthStore', () => {
  beforeEach(() => {
    // 각 테스트 전 스토어 초기화
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      sessionExpiry: null,
    })
  })

  it('초기 상태는 미인증이다', () => {
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
  })

  it('logout 호출 시 인증 상태가 초기화된다', () => {
    useAuthStore.setState({
      user: { id: '1', name: '홍길동', rank: '대위', unit: '해군본부', username: 'admin', roles: ['ADMIN'] },
      token: 'test-token',
      isAuthenticated: true,
      sessionExpiry: Date.now() + 1800000,
    })

    useAuthStore.getState().logout()

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.sessionExpiry).toBeNull()
  })

  it('checkSession: 세션이 없으면 false를 반환한다', () => {
    const result = useAuthStore.getState().checkSession()
    expect(result).toBe(false)
  })

  it('checkSession: 세션이 유효하면 true를 반환한다', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      sessionExpiry: Date.now() + 1800000, // 30분 후
    })
    const result = useAuthStore.getState().checkSession()
    expect(result).toBe(true)
  })

  it('checkSession: 세션이 만료되면 false를 반환하고 로그아웃된다', () => {
    useAuthStore.setState({
      user: { id: '1', name: '홍길동', rank: '대위', unit: '해군본부', username: 'admin', roles: ['ADMIN'] },
      token: 'test-token',
      isAuthenticated: true,
      sessionExpiry: Date.now() - 1000, // 이미 만료됨
    })

    const result = useAuthStore.getState().checkSession()
    expect(result).toBe(false)
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(useAuthStore.getState().user).toBeNull()
  })
})
