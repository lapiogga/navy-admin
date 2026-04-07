import { apiClient } from '@/shared/api/client'
import type { ListParams, PageResponse, ApiResult } from '@/shared/api/types'
import type { ApprovalLine } from './types'

interface CreateApprovalLineDto {
  lineName: string
  description: string
  approvers: { userId: string; order: number }[]
}

interface UpdateApprovalLineDto extends CreateApprovalLineDto {}

export const approvalLineApi = {
  list(params: ListParams): Promise<PageResponse<ApprovalLine>> {
    return apiClient.get('/common/approval-lines', { params }) as Promise<
      PageResponse<ApprovalLine>
    >
  },

  detail(id: string): Promise<ApiResult<ApprovalLine>> {
    return apiClient.get(`/common/approval-lines/${id}`) as Promise<ApiResult<ApprovalLine>>
  },

  create(data: CreateApprovalLineDto): Promise<ApiResult<ApprovalLine>> {
    return apiClient.post('/common/approval-lines', data) as Promise<ApiResult<ApprovalLine>>
  },

  update(id: string, data: UpdateApprovalLineDto): Promise<ApiResult<ApprovalLine>> {
    return apiClient.put(`/common/approval-lines/${id}`, data) as Promise<ApiResult<ApprovalLine>>
  },

  delete(id: string): Promise<ApiResult<void>> {
    return apiClient.delete(`/common/approval-lines/${id}`) as Promise<ApiResult<void>>
  },
}
