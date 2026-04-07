import { apiClient } from '@/shared/api/client'
import type { ListParams, PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type {
  BoardConfig,
  BoardCategory,
  BoardPost,
  BoardComment,
  BoardAttachment,
  BoardAdmin,
  BoardUser,
  BoardUnit,
} from './types'

/** 게시판 설정 API */
export const boardConfigApi = {
  list: (params: ListParams): Promise<PageResponse<BoardConfig>> =>
    apiClient.get('/common/board-configs', { params }),

  detail: (id: string): Promise<ApiResult<BoardConfig>> =>
    apiClient.get(`/common/board-configs/${id}`),

  create: (
    data: Omit<BoardConfig, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ApiResult<BoardConfig>> =>
    apiClient.post('/common/board-configs', data),

  update: (
    id: string,
    data: Partial<Omit<BoardConfig, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<ApiResult<BoardConfig>> =>
    apiClient.put(`/common/board-configs/${id}`, data),

  delete: (id: string): Promise<ApiResult> =>
    apiClient.delete(`/common/board-configs/${id}`),
}

/** 게시판 카테고리 API */
export const boardCategoryApi = {
  list: (boardId: string): Promise<ApiResult<BoardCategory[]>> =>
    apiClient.get(`/common/boards/${boardId}/categories`),

  create: (
    boardId: string,
    data: Omit<BoardCategory, 'id' | 'boardId'>,
  ): Promise<ApiResult<BoardCategory>> =>
    apiClient.post(`/common/boards/${boardId}/categories`, data),

  update: (
    boardId: string,
    id: string,
    data: Partial<Omit<BoardCategory, 'id' | 'boardId'>>,
  ): Promise<ApiResult<BoardCategory>> =>
    apiClient.put(`/common/boards/${boardId}/categories/${id}`, data),

  delete: (boardId: string, id: string): Promise<ApiResult> =>
    apiClient.delete(`/common/boards/${boardId}/categories/${id}`),
}

/** 게시글 API */
export const boardPostApi = {
  list: (
    boardId: string,
    params: ListParams & { categoryId?: string },
  ): Promise<PageResponse<BoardPost>> =>
    apiClient.get(`/common/boards/${boardId}/posts`, { params }),

  detail: (boardId: string, id: string): Promise<ApiResult<BoardPost>> =>
    apiClient.get(`/common/boards/${boardId}/posts/${id}`),

  create: (
    boardId: string,
    data: Omit<BoardPost, 'id' | 'authorId' | 'authorName' | 'authorUnit' | 'viewCount' | 'attachments' | 'createdAt' | 'updatedAt'>,
  ): Promise<ApiResult<BoardPost>> =>
    apiClient.post(`/common/boards/${boardId}/posts`, data),

  update: (
    boardId: string,
    id: string,
    data: Partial<Omit<BoardPost, 'id' | 'boardId' | 'authorId' | 'authorName' | 'authorUnit' | 'viewCount' | 'attachments' | 'createdAt' | 'updatedAt'>>,
  ): Promise<ApiResult<BoardPost>> =>
    apiClient.put(`/common/boards/${boardId}/posts/${id}`, data),

  delete: (boardId: string, id: string): Promise<ApiResult> =>
    apiClient.delete(`/common/boards/${boardId}/posts/${id}`),
}

/** 댓글 API */
export const boardCommentApi = {
  list: (postId: string): Promise<ApiResult<BoardComment[]>> =>
    apiClient.get(`/common/posts/${postId}/comments`),

  create: (
    postId: string,
    data: { content: string },
  ): Promise<ApiResult<BoardComment>> =>
    apiClient.post(`/common/posts/${postId}/comments`, data),

  delete: (postId: string, commentId: string): Promise<ApiResult> =>
    apiClient.delete(`/common/posts/${postId}/comments/${commentId}`),
}

/** 첨부파일 API (삭제만 — 업로드는 antd Upload action으로 직접 처리) */
export const boardAttachmentApi = {
  delete: (id: string): Promise<ApiResult> =>
    apiClient.delete(`/common/board/attachments/${id}`),
}

/** 게시판 관리자 설정 API */
export const boardAdminApi = {
  list: (boardId: string): Promise<ApiResult<BoardAdmin[]>> =>
    apiClient.get(`/common/boards/${boardId}/admins`),

  assign: (boardId: string, userIds: string[]): Promise<ApiResult> =>
    apiClient.post(`/common/boards/${boardId}/admins`, { userIds }),

  remove: (boardId: string, adminId: string): Promise<ApiResult> =>
    apiClient.delete(`/common/boards/${boardId}/admins/${adminId}`),
}

/** 게시판 사용자 설정 API */
export const boardUserApi = {
  list: (boardId: string, params: PageRequest): Promise<PageResponse<BoardUser>> =>
    apiClient.get(`/common/boards/${boardId}/users`, { params }),

  assign: (boardId: string, userIds: string[]): Promise<ApiResult> =>
    apiClient.post(`/common/boards/${boardId}/users`, { userIds }),

  remove: (boardId: string, userId: string): Promise<ApiResult> =>
    apiClient.delete(`/common/boards/${boardId}/users/${userId}`),
}

/** 게시판 부대 설정 API */
export const boardUnitApi = {
  list: (boardId: string): Promise<ApiResult<BoardUnit[]>> =>
    apiClient.get(`/common/boards/${boardId}/units`),

  assign: (
    boardId: string,
    units: { unitCode: string; unitName: string }[],
  ): Promise<ApiResult> =>
    apiClient.post(`/common/boards/${boardId}/units`, { units }),

  remove: (boardId: string, unitId: string): Promise<ApiResult> =>
    apiClient.delete(`/common/boards/${boardId}/units/${unitId}`),
}

// 타입 재export (편의 목적)
export type { BoardAttachment }
