import { describe, it, expect } from 'vitest'
import type {
  BoardConfig,
  BoardPost,
  BoardComment,
  BoardCategory,
  BoardAdmin,
  BoardUser,
  BoardUnit,
} from '@/entities/board/types'

describe('게시판 타입', () => {
  it('BoardConfig 타입이 정의되어 있다', () => {
    const config: BoardConfig = {
      id: '1',
      boardName: '공지사항',
      boardType: 'NOTICE',
      subsystemCode: 'common',
      description: '',
      useCategory: true,
      useAttachment: true,
      useComment: true,
      maxAttachSize: 10,
      createdAt: '',
      updatedAt: '',
    }
    expect(config.boardName).toBe('공지사항')
  })

  it('BoardPost 타입이 정의되어 있다', () => {
    const post: BoardPost = {
      id: '1',
      boardId: '1',
      title: '테스트',
      content: '',
      authorId: '1',
      authorName: '홍길동',
      authorUnit: '1사단',
      viewCount: 0,
      isPinned: false,
      status: 'ACTIVE',
      attachments: [],
      createdAt: '',
      updatedAt: '',
    }
    expect(post.title).toBe('테스트')
  })

  it('BoardAdmin 타입이 정의되어 있다', () => {
    const admin: BoardAdmin = {
      id: '1',
      boardId: '1',
      userId: 'u1',
      userName: '김관리',
      userRank: '소령',
      assignedAt: '2026-01-01',
    }
    expect(admin.userName).toBe('김관리')
  })

  it('BoardUser 타입이 정의되어 있다', () => {
    const user: BoardUser = {
      id: '1',
      boardId: '1',
      userId: 'u2',
      userName: '이사용',
      userRank: '대위',
      userUnit: '2사단',
      assignedAt: '2026-01-01',
    }
    expect(user.userName).toBe('이사용')
  })

  it('BoardUnit 타입이 정의되어 있다', () => {
    const unit: BoardUnit = {
      id: '1',
      boardId: '1',
      unitCode: 'UNIT-01',
      unitName: '해병대1사단',
      assignedAt: '2026-01-01',
    }
    expect(unit.unitName).toBe('해병대1사단')
  })

  it('BoardCategory 타입이 정의되어 있다', () => {
    const cat: BoardCategory = {
      id: '1',
      boardId: '1',
      categoryName: '일반',
      sortOrder: 1,
      useYn: 'Y',
    }
    expect(cat.categoryName).toBe('일반')
  })

  it('BoardComment 타입이 정의되어 있다', () => {
    const comment: BoardComment = {
      id: '1',
      postId: 'p1',
      content: '댓글내용',
      authorId: 'u1',
      authorName: '작성자',
      createdAt: '',
    }
    expect(comment.content).toBe('댓글내용')
  })
})

describe('boardHandlers MSW 핸들러', () => {
  it('boardHandlers가 export된다', { timeout: 15000 }, async () => {
    const { boardHandlers } = await import('@/shared/api/mocks/handlers/common/board')
    expect(Array.isArray(boardHandlers)).toBe(true)
    expect(boardHandlers.length).toBeGreaterThan(0)
  })
})
