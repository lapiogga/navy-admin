import { apiClient } from '@/shared/api/client'
import type { ListParams, PageResponse } from '@/shared/api/types'
import type { CodeGroup, Code, CodeOption } from './types'

export const codeGroupApi = {
  list(params: ListParams): Promise<PageResponse<CodeGroup>> {
    return apiClient.get('/common/code-groups', { params }) as Promise<PageResponse<CodeGroup>>
  },

  create(data: Omit<CodeGroup, 'id' | 'createdAt' | 'updatedAt'>): Promise<CodeGroup> {
    return apiClient.post('/common/code-groups', data) as Promise<CodeGroup>
  },

  update(id: string, data: Partial<CodeGroup>): Promise<CodeGroup> {
    return apiClient.put(`/common/code-groups/${id}`, data) as Promise<CodeGroup>
  },

  delete(id: string): Promise<void> {
    return apiClient.delete(`/common/code-groups/${id}`) as Promise<void>
  },
}

export const codeApi = {
  listByGroup(groupId: string, params: ListParams): Promise<PageResponse<Code>> {
    return apiClient.get('/common/codes', { params: { ...params, groupId } }) as Promise<PageResponse<Code>>
  },

  create(data: Omit<Code, 'id' | 'createdAt'>): Promise<Code> {
    return apiClient.post('/common/codes', data) as Promise<Code>
  },

  update(id: string, data: Partial<Code>): Promise<Code> {
    return apiClient.put(`/common/codes/${id}`, data) as Promise<Code>
  },

  delete(id: string): Promise<void> {
    return apiClient.delete(`/common/codes/${id}`) as Promise<void>
  },

  getOptions(groupCode: string): Promise<CodeOption[]> {
    return apiClient.get(`/common/codes/options/${groupCode}`) as Promise<CodeOption[]>
  },
}
