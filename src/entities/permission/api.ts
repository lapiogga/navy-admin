import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { PermissionGroup, MenuPermission, GroupUser, GroupUnit } from './types'

export const permissionGroupApi = {
  list(params: PageRequest): Promise<PageResponse<PermissionGroup>> {
    return apiClient.get('/common/permission-groups', { params }) as Promise<PageResponse<PermissionGroup>>
  },

  create(data: Omit<PermissionGroup, 'id' | 'createdAt' | 'updatedAt'>): Promise<PermissionGroup> {
    return apiClient.post('/common/permission-groups', data) as Promise<PermissionGroup>
  },

  update(id: string, data: Partial<PermissionGroup>): Promise<PermissionGroup> {
    return apiClient.put(`/common/permission-groups/${id}`, data) as Promise<PermissionGroup>
  },

  delete(id: string): Promise<void> {
    return apiClient.delete(`/common/permission-groups/${id}`) as Promise<void>
  },
}

export const menuPermissionApi = {
  /** 메뉴별 권한그룹 조회 (메뉴 경로로 필터) */
  getByMenu(menuPath: string): Promise<ApiResult<MenuPermission[]>> {
    return apiClient.get('/common/menu-permissions', { params: { menuPath } }) as Promise<ApiResult<MenuPermission[]>>
  },

  /** 권한그룹별 메뉴 조회 */
  getByGroup(groupId: string): Promise<ApiResult<MenuPermission[]>> {
    return apiClient.get('/common/menu-permissions', { params: { groupId } }) as Promise<ApiResult<MenuPermission[]>>
  },

  /** 메뉴 배정 */
  assign(groupId: string, menuPaths: string[]): Promise<ApiResult<void>> {
    return apiClient.post('/common/menu-permissions', { groupId, menuPaths }) as Promise<ApiResult<void>>
  },

  /** 메뉴 해제 */
  remove(groupId: string, menuPaths: string[]): Promise<ApiResult<void>> {
    return apiClient.delete('/common/menu-permissions', { data: { groupId, menuPaths } }) as Promise<ApiResult<void>>
  },

  /** 그룹 메뉴 조회 (/:id/menus 경로) */
  getGroupMenus(groupId: string): Promise<MenuPermission[]> {
    return apiClient.get(`/common/permission-groups/${groupId}/menus`) as Promise<MenuPermission[]>
  },

  /** 그룹 메뉴 배정 (/:id/menus 경로) */
  assignGroupMenus(groupId: string, menuPaths: string[]): Promise<ApiResult<void>> {
    return apiClient.post(`/common/permission-groups/${groupId}/menus`, { menuPaths }) as Promise<ApiResult<void>>
  },

  /** 그룹 메뉴 해제 (/:id/menus 경로) */
  removeGroupMenus(groupId: string, menuPaths: string[]): Promise<ApiResult<void>> {
    return apiClient.delete(`/common/permission-groups/${groupId}/menus`, { data: { menuPaths } }) as Promise<ApiResult<void>>
  },
}

export const groupUserApi = {
  list(groupId: string, params: PageRequest): Promise<PageResponse<GroupUser>> {
    return apiClient.get(`/common/permission-groups/${groupId}/users`, { params }) as Promise<PageResponse<GroupUser>>
  },

  assign(groupId: string, userIds: string[]): Promise<ApiResult<void>> {
    return apiClient.post(`/common/permission-groups/${groupId}/users`, { userIds }) as Promise<ApiResult<void>>
  },

  remove(groupId: string, userId: string): Promise<ApiResult<void>> {
    return apiClient.delete(`/common/permission-groups/${groupId}/users/${userId}`) as Promise<ApiResult<void>>
  },

  detail(groupId: string, userId: string): Promise<ApiResult<GroupUser>> {
    return apiClient.get(`/common/permission-groups/${groupId}/users/${userId}`) as Promise<ApiResult<GroupUser>>
  },
}

export const groupUnitApi = {
  list(groupId: string, params: PageRequest): Promise<PageResponse<GroupUnit>> {
    return apiClient.get(`/common/permission-groups/${groupId}/units`, { params }) as Promise<PageResponse<GroupUnit>>
  },

  assign(groupId: string, units: { unitCode: string; unitName: string }[]): Promise<ApiResult<void>> {
    return apiClient.post(`/common/permission-groups/${groupId}/units`, { units }) as Promise<ApiResult<void>>
  },

  remove(groupId: string, unitId: string): Promise<ApiResult<void>> {
    return apiClient.delete(`/common/permission-groups/${groupId}/units/${unitId}`) as Promise<ApiResult<void>>
  },
}
