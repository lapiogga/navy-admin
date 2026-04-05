export interface User {
  id: string
  name: string
  rank: string        // 계급 (예: '대위', '소령')
  unit: string        // 소속부대 (예: '해병대사령부')
  username: string
  roles: string[]     // 권한 그룹 코드 (예: ['ADMIN', 'SYS01_USER'])
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}
