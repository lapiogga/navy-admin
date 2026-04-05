/** 게시판 설정 (메타) */
export interface BoardConfig {
  id: string
  boardName: string
  boardType: string // 'NOTICE' | 'QNA' | 'FREE' | 'DATA'
  subsystemCode: string
  description: string
  useCategory: boolean
  useAttachment: boolean
  useComment: boolean
  maxAttachSize: number // MB 단위
  createdAt: string
  updatedAt: string
}

/** 게시판 카테고리 */
export interface BoardCategory {
  id: string
  boardId: string
  categoryName: string
  sortOrder: number
  useYn: string
}

/** 게시글 */
export interface BoardPost {
  id: string
  boardId: string
  categoryId?: string
  title: string
  content: string
  authorId: string
  authorName: string
  authorUnit: string
  viewCount: number
  isPinned: boolean
  status: string // 'ACTIVE' | 'DELETED' | 'HIDDEN'
  attachments: BoardAttachment[]
  createdAt: string
  updatedAt: string
}

/** 첨부파일 */
export interface BoardAttachment {
  id: string
  postId: string
  fileName: string
  fileSize: number // bytes
  mimeType: string
  uploadedAt: string
}

/** 댓글 */
export interface BoardComment {
  id: string
  postId: string
  content: string
  authorId: string
  authorName: string
  createdAt: string
}

/** 게시판 관리자 설정 */
export interface BoardAdmin {
  id: string
  boardId: string
  userId: string
  userName: string
  userRank: string
  assignedAt: string
}

/** 게시판 사용자 설정 */
export interface BoardUser {
  id: string
  boardId: string
  userId: string
  userName: string
  userRank: string
  userUnit: string
  assignedAt: string
}

/** 게시판 부대 설정 */
export interface BoardUnit {
  id: string
  boardId: string
  unitCode: string
  unitName: string
  assignedAt: string
}
