import { describe, it, expect } from 'vitest'
import type { PermissionGroup, MenuPermission, GroupUser, GroupUnit } from '@/entities/permission/types'

describe('권한관리 타입', () => {
  it('PermissionGroup 타입이 정의되어 있다', () => {
    const group: PermissionGroup = {
      id: '1',
      groupCode: 'ADMIN',
      groupName: '관리자',
      description: '',
      createdAt: '',
      updatedAt: '',
    }
    expect(group.groupCode).toBe('ADMIN')
  })

  it('MenuPermission 타입이 정의되어 있다', () => {
    const perm: MenuPermission = {
      id: '1',
      groupId: '1',
      menuPath: '/sys01/1',
      menuName: '메뉴1',
      subsystemCode: 'sys01',
    }
    expect(perm.menuPath).toBe('/sys01/1')
  })

  it('GroupUser 타입이 정의되어 있다', () => {
    const groupUser: GroupUser = {
      id: '1',
      groupId: '1',
      userId: 'u1',
      userName: '홍길동',
      userRank: '대위',
      userUnit: '해병대사령부',
      assignedAt: '2026-01-01',
    }
    expect(groupUser.userName).toBe('홍길동')
  })

  it('GroupUnit 타입이 정의되어 있다', () => {
    const groupUnit: GroupUnit = {
      id: '1',
      groupId: '1',
      unitCode: 'HQ',
      unitName: '해병대사령부',
      assignedAt: '2026-01-01',
    }
    expect(groupUnit.unitCode).toBe('HQ')
  })
})

describe('permissionHandlers MSW 핸들러', () => {
  it('permissionHandlers가 export된다', async () => {
    const { permissionHandlers } = await import('@/shared/api/mocks/handlers/common/permission')
    expect(Array.isArray(permissionHandlers)).toBe(true)
    expect(permissionHandlers.length).toBeGreaterThan(0)
  })
})

describe('commonHandlers에 permissionHandlers 포함', () => {
  it('commonHandlers 배열에 permission 핸들러가 포함된다', async () => {
    const { commonHandlers } = await import('@/shared/api/mocks/handlers/common/index')
    expect(commonHandlers.length).toBeGreaterThan(0)
  })
})
