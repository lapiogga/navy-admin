/** 페이지 요청 (Spring Boot Pageable 관례, 0-based) */
export interface PageRequest {
  page: number
  size: number
  sort?: string[]
}

/** 페이지 응답 (Spring Boot Page<T> 관례) */
export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

/** API 응답 래퍼 */
export interface ApiResult<T = void> {
  success: boolean
  data: T
  message?: string
  errorCode?: string
}

/** 목록 조회 파라미터 (검색 + 페이지) */
export interface ListParams extends PageRequest {
  keyword?: string
  [key: string]: unknown
}
