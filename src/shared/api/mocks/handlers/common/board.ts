import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker/locale/ko'
import type { ApiResult, PageResponse } from '@/shared/api/types'
import type {
  BoardConfig,
  BoardCategory,
  BoardPost,
  BoardAttachment,
  BoardComment,
  BoardAdmin,
  BoardUser,
  BoardUnit,
} from '@/entities/board/types'

// ── Mock 데이터 ──────────────────────────────────────────────

const mockBoardConfigs: BoardConfig[] = [
  {
    id: 'board-1',
    boardName: '공지사항',
    boardType: 'NOTICE',
    subsystemCode: 'common',
    description: '전체 공지사항 게시판',
    useCategory: true,
    useAttachment: true,
    useComment: false,
    maxAttachSize: 10,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'board-2',
    boardName: '질의응답',
    boardType: 'QNA',
    subsystemCode: 'common',
    description: '질문과 답변 게시판',
    useCategory: true,
    useAttachment: true,
    useComment: true,
    maxAttachSize: 5,
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
  },
  {
    id: 'board-3',
    boardName: '자료실',
    boardType: 'DATA',
    subsystemCode: 'common',
    description: '자료 공유 게시판',
    useCategory: true,
    useAttachment: true,
    useComment: false,
    maxAttachSize: 50,
    createdAt: '2026-01-03T00:00:00Z',
    updatedAt: '2026-01-03T00:00:00Z',
  },
  {
    id: 'board-4',
    boardName: '자유게시판',
    boardType: 'FREE',
    subsystemCode: 'common',
    description: '자유 토론 게시판',
    useCategory: false,
    useAttachment: true,
    useComment: true,
    maxAttachSize: 10,
    createdAt: '2026-01-04T00:00:00Z',
    updatedAt: '2026-01-04T00:00:00Z',
  },
  {
    id: 'board-5',
    boardName: '건의사항',
    boardType: 'FREE',
    subsystemCode: 'common',
    description: '건의 및 제안 게시판',
    useCategory: false,
    useAttachment: false,
    useComment: true,
    maxAttachSize: 0,
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-01-05T00:00:00Z',
  },
]

const mockCategories: BoardCategory[] = [
  { id: 'cat-1', boardId: 'board-1', categoryName: '일반공지', sortOrder: 1, useYn: 'Y' },
  { id: 'cat-2', boardId: 'board-1', categoryName: '긴급공지', sortOrder: 2, useYn: 'Y' },
  { id: 'cat-3', boardId: 'board-1', categoryName: '훈련공지', sortOrder: 3, useYn: 'Y' },
  { id: 'cat-4', boardId: 'board-2', categoryName: '행정질의', sortOrder: 1, useYn: 'Y' },
  { id: 'cat-5', boardId: 'board-2', categoryName: '기술질의', sortOrder: 2, useYn: 'Y' },
  { id: 'cat-6', boardId: 'board-3', categoryName: '교육자료', sortOrder: 1, useYn: 'Y' },
  { id: 'cat-7', boardId: 'board-3', categoryName: '업무양식', sortOrder: 2, useYn: 'Y' },
  { id: 'cat-8', boardId: 'board-3', categoryName: '규정집', sortOrder: 3, useYn: 'Y' },
  { id: 'cat-9', boardId: 'board-3', categoryName: '매뉴얼', sortOrder: 4, useYn: 'Y' },
]

const units = ['해병대사령부', '해병대1사단', '해병대2사단', '교육훈련단', '해병대6여단']
const ranks = ['소위', '중위', '대위', '소령', '중령', '대령', '하사', '중사', '상사']

function generatePosts(boardId: string, count: number): BoardPost[] {
  return Array.from({ length: count }, (_, i) => {
    const id = `post-${boardId}-${i + 1}`
    const hasAttach = Math.random() > 0.6
    const attachments: BoardAttachment[] = hasAttach
      ? Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (__, j) => ({
          id: `attach-${id}-${j}`,
          postId: id,
          fileName: `${faker.system.fileName()}.pdf`,
          fileSize: Math.floor(Math.random() * 5000000) + 10000,
          mimeType: 'application/pdf',
          uploadedAt: faker.date.recent({ days: 30 }).toISOString(),
        }))
      : []

    return {
      id,
      boardId,
      categoryId: mockCategories.find((c) => c.boardId === boardId)?.id,
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(2),
      authorId: faker.string.uuid(),
      authorName: faker.person.lastName() + faker.person.firstName(),
      authorUnit: faker.helpers.arrayElement(units),
      viewCount: Math.floor(Math.random() * 500),
      isPinned: i === 0,
      status: 'ACTIVE',
      attachments,
      createdAt: faker.date.recent({ days: 60 }).toISOString(),
      updatedAt: faker.date.recent({ days: 30 }).toISOString(),
    }
  })
}

const mockPosts: BoardPost[] = [
  ...generatePosts('board-1', 20),
  ...generatePosts('board-2', 15),
  ...generatePosts('board-3', 25),
  ...generatePosts('board-4', 18),
  ...generatePosts('board-5', 12),
]

function generateComments(postId: string, count: number): BoardComment[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `comment-${postId}-${i + 1}`,
    postId,
    content: faker.lorem.sentence(),
    authorId: faker.string.uuid(),
    authorName: faker.person.lastName() + faker.person.firstName(),
    createdAt: faker.date.recent({ days: 10 }).toISOString(),
  }))
}

const mockComments: BoardComment[] = mockPosts.flatMap((post) => {
  const count = Math.floor(Math.random() * 5)
  return generateComments(post.id, count)
})

const mockBoardAdmins: BoardAdmin[] = mockBoardConfigs.flatMap((board) =>
  Array.from({ length: Math.floor(Math.random() * 2) + 1 }, (_, i) => ({
    id: `admin-${board.id}-${i + 1}`,
    boardId: board.id,
    userId: faker.string.uuid(),
    userName: faker.person.lastName() + faker.person.firstName(),
    userRank: faker.helpers.arrayElement(ranks),
    assignedAt: faker.date.recent({ days: 90 }).toISOString().split('T')[0],
  })),
)

const mockBoardUsers: BoardUser[] = mockBoardConfigs.flatMap((board) =>
  Array.from({ length: Math.floor(Math.random() * 10) + 5 }, (_, i) => ({
    id: `buser-${board.id}-${i + 1}`,
    boardId: board.id,
    userId: faker.string.uuid(),
    userName: faker.person.lastName() + faker.person.firstName(),
    userRank: faker.helpers.arrayElement(ranks),
    userUnit: faker.helpers.arrayElement(units),
    assignedAt: faker.date.recent({ days: 90 }).toISOString().split('T')[0],
  })),
)

const mockBoardUnits: BoardUnit[] = mockBoardConfigs.flatMap((board) =>
  Array.from({ length: Math.floor(Math.random() * 3) + 2 }, (_, i) => ({
    id: `bunit-${board.id}-${i + 1}`,
    boardId: board.id,
    unitCode: `UNIT-${String(i + 1).padStart(2, '0')}`,
    unitName: faker.helpers.arrayElement(units),
    assignedAt: faker.date.recent({ days: 90 }).toISOString().split('T')[0],
  })),
)

// ── MSW 핸들러 ──────────────────────────────────────────────

export const boardHandlers = [
  // ── 게시판 설정 ──

  http.get('/api/common/board-configs', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '0')
    const size = Number(url.searchParams.get('size') ?? '10')
    const keyword = url.searchParams.get('keyword') ?? ''

    const filtered = keyword
      ? mockBoardConfigs.filter(
          (b) => b.boardName.includes(keyword) || b.description.includes(keyword),
        )
      : mockBoardConfigs

    const content = filtered.slice(page * size, (page + 1) * size)
    const result: ApiResult<PageResponse<BoardConfig>> = {
      success: true,
      data: {
        content,
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / size),
        size,
        number: page,
      },
    }
    return HttpResponse.json(result)
  }),

  http.post('/api/common/board-configs', async ({ request }) => {
    const body = (await request.json()) as Omit<BoardConfig, 'id' | 'createdAt' | 'updatedAt'>
    const newConfig: BoardConfig = {
      ...body,
      id: faker.string.uuid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockBoardConfigs.push(newConfig)
    const result: ApiResult<BoardConfig> = {
      success: true,
      data: newConfig,
      message: '등록되었습니다',
    }
    return HttpResponse.json(result, { status: 201 })
  }),

  http.get('/api/common/board-configs/:id', ({ params }) => {
    const config = mockBoardConfigs.find((b) => b.id === params.id)
    if (!config) return HttpResponse.json({ success: false, message: '게시판을 찾을 수 없습니다' }, { status: 404 })
    const result: ApiResult<BoardConfig> = { success: true, data: config }
    return HttpResponse.json(result)
  }),

  http.put('/api/common/board-configs/:id', async ({ params, request }) => {
    const idx = mockBoardConfigs.findIndex((b) => b.id === params.id)
    if (idx === -1) return HttpResponse.json({ success: false, message: '게시판을 찾을 수 없습니다' }, { status: 404 })
    const body = (await request.json()) as Partial<BoardConfig>
    mockBoardConfigs[idx] = { ...mockBoardConfigs[idx], ...body, updatedAt: new Date().toISOString() }
    const result: ApiResult<BoardConfig> = { success: true, data: mockBoardConfigs[idx], message: '수정되었습니다' }
    return HttpResponse.json(result)
  }),

  http.delete('/api/common/board-configs/:id', ({ params }) => {
    const idx = mockBoardConfigs.findIndex((b) => b.id === params.id)
    if (idx !== -1) mockBoardConfigs.splice(idx, 1)
    const result: ApiResult = { success: true, data: undefined as never, message: '삭제되었습니다' }
    return HttpResponse.json(result)
  }),

  // ── 카테고리 ──

  http.get('/api/common/boards/:boardId/categories', ({ params }) => {
    const categories = mockCategories.filter((c) => c.boardId === params.boardId)
    const result: ApiResult<BoardCategory[]> = { success: true, data: categories }
    return HttpResponse.json(result)
  }),

  http.post('/api/common/boards/:boardId/categories', async ({ params, request }) => {
    const body = (await request.json()) as Omit<BoardCategory, 'id' | 'boardId'>
    const newCat: BoardCategory = { ...body, id: faker.string.uuid(), boardId: params.boardId as string }
    mockCategories.push(newCat)
    const result: ApiResult<BoardCategory> = { success: true, data: newCat, message: '등록되었습니다' }
    return HttpResponse.json(result, { status: 201 })
  }),

  http.put('/api/common/boards/:boardId/categories/:id', async ({ params, request }) => {
    const idx = mockCategories.findIndex((c) => c.id === params.id && c.boardId === params.boardId)
    if (idx === -1) return HttpResponse.json({ success: false, message: '카테고리를 찾을 수 없습니다' }, { status: 404 })
    const body = (await request.json()) as Partial<BoardCategory>
    mockCategories[idx] = { ...mockCategories[idx], ...body }
    const result: ApiResult<BoardCategory> = { success: true, data: mockCategories[idx], message: '수정되었습니다' }
    return HttpResponse.json(result)
  }),

  http.delete('/api/common/boards/:boardId/categories/:id', ({ params }) => {
    const idx = mockCategories.findIndex((c) => c.id === params.id && c.boardId === params.boardId)
    if (idx !== -1) mockCategories.splice(idx, 1)
    const result: ApiResult = { success: true, data: undefined as never, message: '삭제되었습니다' }
    return HttpResponse.json(result)
  }),

  // ── 게시글 ──

  http.get('/api/common/boards/:boardId/posts', ({ params, request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '0')
    const size = Number(url.searchParams.get('size') ?? '10')
    const keyword = url.searchParams.get('keyword') ?? ''
    const categoryId = url.searchParams.get('categoryId') ?? ''

    let filtered = mockPosts.filter((p) => p.boardId === params.boardId && p.status === 'ACTIVE')
    if (keyword) {
      filtered = filtered.filter((p) => p.title.includes(keyword) || p.content.includes(keyword))
    }
    if (categoryId) {
      filtered = filtered.filter((p) => p.categoryId === categoryId)
    }

    const content = filtered.slice(page * size, (page + 1) * size)
    const result: ApiResult<PageResponse<BoardPost>> = {
      success: true,
      data: {
        content,
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / size),
        size,
        number: page,
      },
    }
    return HttpResponse.json(result)
  }),

  http.get('/api/common/boards/:boardId/posts/:id', ({ params }) => {
    const post = mockPosts.find((p) => p.id === params.id && p.boardId === params.boardId)
    if (!post) return HttpResponse.json({ success: false, message: '게시글을 찾을 수 없습니다' }, { status: 404 })
    // 조회수 증가
    post.viewCount += 1
    const result: ApiResult<BoardPost> = { success: true, data: post }
    return HttpResponse.json(result)
  }),

  http.post('/api/common/boards/:boardId/posts', async ({ params, request }) => {
    const body = (await request.json()) as Partial<BoardPost>
    const newPost: BoardPost = {
      id: faker.string.uuid(),
      boardId: params.boardId as string,
      categoryId: body.categoryId,
      title: body.title ?? '',
      content: body.content ?? '',
      authorId: 'user-mock',
      authorName: '홍길동',
      authorUnit: '해병대사령부',
      viewCount: 0,
      isPinned: body.isPinned ?? false,
      status: 'ACTIVE',
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockPosts.push(newPost)
    const result: ApiResult<BoardPost> = { success: true, data: newPost, message: '등록되었습니다' }
    return HttpResponse.json(result, { status: 201 })
  }),

  http.put('/api/common/boards/:boardId/posts/:id', async ({ params, request }) => {
    const idx = mockPosts.findIndex((p) => p.id === params.id && p.boardId === params.boardId)
    if (idx === -1) return HttpResponse.json({ success: false, message: '게시글을 찾을 수 없습니다' }, { status: 404 })
    const body = (await request.json()) as Partial<BoardPost>
    mockPosts[idx] = { ...mockPosts[idx], ...body, updatedAt: new Date().toISOString() }
    const result: ApiResult<BoardPost> = { success: true, data: mockPosts[idx], message: '수정되었습니다' }
    return HttpResponse.json(result)
  }),

  http.delete('/api/common/boards/:boardId/posts/:id', ({ params }) => {
    const idx = mockPosts.findIndex((p) => p.id === params.id && p.boardId === params.boardId)
    if (idx !== -1) mockPosts[idx].status = 'DELETED'
    const result: ApiResult = { success: true, data: undefined as never, message: '삭제되었습니다' }
    return HttpResponse.json(result)
  }),

  // ── 댓글 ──

  http.get('/api/common/posts/:postId/comments', ({ params }) => {
    const comments = mockComments.filter((c) => c.postId === params.postId)
    const result: ApiResult<BoardComment[]> = { success: true, data: comments }
    return HttpResponse.json(result)
  }),

  http.post('/api/common/posts/:postId/comments', async ({ params, request }) => {
    const body = (await request.json()) as { content: string }
    const newComment: BoardComment = {
      id: faker.string.uuid(),
      postId: params.postId as string,
      content: body.content,
      authorId: 'user-mock',
      authorName: '홍길동',
      createdAt: new Date().toISOString(),
    }
    mockComments.push(newComment)
    const result: ApiResult<BoardComment> = { success: true, data: newComment, message: '등록되었습니다' }
    return HttpResponse.json(result, { status: 201 })
  }),

  http.delete('/api/common/posts/:postId/comments/:id', ({ params }) => {
    const idx = mockComments.findIndex((c) => c.id === params.id && c.postId === params.postId)
    if (idx !== -1) mockComments.splice(idx, 1)
    const result: ApiResult = { success: true, data: undefined as never, message: '삭제되었습니다' }
    return HttpResponse.json(result)
  }),

  // ── 첨부파일 ──

  http.post('/api/common/board/attachments', async ({ request }) => {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const newAttach: BoardAttachment = {
      id: faker.string.uuid(),
      postId: '',
      fileName: file?.name ?? 'unknown',
      fileSize: file?.size ?? 0,
      mimeType: file?.type ?? 'application/octet-stream',
      uploadedAt: new Date().toISOString(),
    }
    const result: ApiResult<BoardAttachment> = { success: true, data: newAttach, message: '업로드되었습니다' }
    return HttpResponse.json(result, { status: 201 })
  }),

  http.delete('/api/common/board/attachments/:id', () => {
    const result: ApiResult = { success: true, data: undefined as never, message: '삭제되었습니다' }
    return HttpResponse.json(result)
  }),

  // ── 관리자설정 ──

  http.get('/api/common/boards/:boardId/admins', ({ params }) => {
    const admins = mockBoardAdmins.filter((a) => a.boardId === params.boardId)
    const result: ApiResult<BoardAdmin[]> = { success: true, data: admins }
    return HttpResponse.json(result)
  }),

  http.post('/api/common/boards/:boardId/admins', async ({ params, request }) => {
    const body = (await request.json()) as { userIds: string[] }
    const newAdmins: BoardAdmin[] = body.userIds.map((userId) => ({
      id: faker.string.uuid(),
      boardId: params.boardId as string,
      userId,
      userName: faker.person.lastName() + faker.person.firstName(),
      userRank: faker.helpers.arrayElement(ranks),
      assignedAt: new Date().toISOString().split('T')[0],
    }))
    mockBoardAdmins.push(...newAdmins)
    const result: ApiResult = { success: true, data: undefined as never, message: '저장되었습니다' }
    return HttpResponse.json(result, { status: 201 })
  }),

  http.delete('/api/common/boards/:boardId/admins/:adminId', ({ params }) => {
    const idx = mockBoardAdmins.findIndex(
      (a) => a.id === params.adminId && a.boardId === params.boardId,
    )
    if (idx !== -1) mockBoardAdmins.splice(idx, 1)
    const result: ApiResult = { success: true, data: undefined as never, message: '삭제되었습니다' }
    return HttpResponse.json(result)
  }),

  // ── 사용자설정 ──

  http.get('/api/common/boards/:boardId/users', ({ params, request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '0')
    const size = Number(url.searchParams.get('size') ?? '10')

    const filtered = mockBoardUsers.filter((u) => u.boardId === params.boardId)
    const content = filtered.slice(page * size, (page + 1) * size)
    const result: ApiResult<PageResponse<BoardUser>> = {
      success: true,
      data: {
        content,
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / size),
        size,
        number: page,
      },
    }
    return HttpResponse.json(result)
  }),

  http.post('/api/common/boards/:boardId/users', async ({ params, request }) => {
    const body = (await request.json()) as { userIds: string[] }
    const newUsers: BoardUser[] = body.userIds.map((userId) => ({
      id: faker.string.uuid(),
      boardId: params.boardId as string,
      userId,
      userName: faker.person.lastName() + faker.person.firstName(),
      userRank: faker.helpers.arrayElement(ranks),
      userUnit: faker.helpers.arrayElement(units),
      assignedAt: new Date().toISOString().split('T')[0],
    }))
    mockBoardUsers.push(...newUsers)
    const result: ApiResult = { success: true, data: undefined as never, message: '저장되었습니다' }
    return HttpResponse.json(result, { status: 201 })
  }),

  http.delete('/api/common/boards/:boardId/users/:userId', ({ params }) => {
    const idx = mockBoardUsers.findIndex(
      (u) => u.id === params.userId && u.boardId === params.boardId,
    )
    if (idx !== -1) mockBoardUsers.splice(idx, 1)
    const result: ApiResult = { success: true, data: undefined as never, message: '삭제되었습니다' }
    return HttpResponse.json(result)
  }),

  // ── 부대설정 ──

  http.get('/api/common/boards/:boardId/units', ({ params }) => {
    const boardUnits = mockBoardUnits.filter((u) => u.boardId === params.boardId)
    const result: ApiResult<BoardUnit[]> = { success: true, data: boardUnits }
    return HttpResponse.json(result)
  }),

  http.post('/api/common/boards/:boardId/units', async ({ params, request }) => {
    const body = (await request.json()) as { units: { unitCode: string; unitName: string }[] }
    const newUnits: BoardUnit[] = body.units.map((u) => ({
      id: faker.string.uuid(),
      boardId: params.boardId as string,
      unitCode: u.unitCode,
      unitName: u.unitName,
      assignedAt: new Date().toISOString().split('T')[0],
    }))
    mockBoardUnits.push(...newUnits)
    const result: ApiResult = { success: true, data: undefined as never, message: '저장되었습니다' }
    return HttpResponse.json(result, { status: 201 })
  }),

  http.delete('/api/common/boards/:boardId/units/:unitId', ({ params }) => {
    const idx = mockBoardUnits.findIndex(
      (u) => u.id === params.unitId && u.boardId === params.boardId,
    )
    if (idx !== -1) mockBoardUnits.splice(idx, 1)
    const result: ApiResult = { success: true, data: undefined as never, message: '삭제되었습니다' }
    return HttpResponse.json(result)
  }),
]
