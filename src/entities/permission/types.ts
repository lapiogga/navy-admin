export interface PermissionGroup {
  id: string
  groupCode: string       // 예: 'ADMIN', 'COMMON_USER', 'SYS01_MANAGER'
  groupName: string       // 예: '관리자', '일반사용자'
  description: string
  createdAt: string
  updatedAt: string
}

export interface MenuPermission {
  id: string
  groupId: string
  menuPath: string        // 예: '/sys01/1/1'
  menuName: string        // 예: '신청서 작성'
  subsystemCode: string   // 예: 'sys01'
}

export interface GroupUser {
  id: string
  groupId: string
  userId: string
  userName: string
  userRank: string
  userUnit: string
  assignedAt: string
}

export interface GroupUnit {
  id: string
  groupId: string
  unitCode: string
  unitName: string
  assignedAt: string
}
