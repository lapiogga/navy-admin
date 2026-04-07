import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker/locale/ko'
import { randomServiceNumber } from '../mockServiceNumber'
import { MARINE_UNITS } from '../mockUnits'
import type { ApiResult, PageResponse } from '@/shared/api/types'

// 타입 정의
export type KnowledgeStatus = 'pending' | 'approved' | 'rejected' | 'hidden'

export interface Knowledge extends Record<string, unknown> {
  id: string
  title: string
  category: string
  source: string
  keywords: string[]
  content: string
  serviceNumber: string
  rank: string
  authorName: string
  authorUnit: string
  viewCount: number
  recommendCount: number
  rating: number
  ratingCount: number
  status: KnowledgeStatus
  isFavorite: boolean
  attachments: string[]
  createdAt: string
}

export interface KnowledgeComment extends Record<string, unknown> {
  id: string
  knowledgeId: string
  authorName: string
  content: string
  createdAt: string
}

const CATEGORIES = ['업무지식', '기술지식', '행정지식', '법규지식', '기타']
const UNITS = [...MARINE_UNITS]
const STATUSES: KnowledgeStatus[] = ['pending', 'approved', 'rejected', 'hidden']
const SOURCES = ['생산', '카피']
const RANKS = ['이병', '일병', '상병', '병장', '하사', '중사', '상사', '원사', '소위', '중위', '대위', '소령', '중령', '대령']

// Mock 데이터 30건 생성
let knowledgeList: Knowledge[] = Array.from({ length: 30 }, (_, i) => ({
  id: `know-${i + 1}`,
  title: faker.lorem.sentence(5),
  category: CATEGORIES[i % CATEGORIES.length],
  source: SOURCES[i % SOURCES.length],
  keywords: [faker.word.noun(), faker.word.noun(), faker.word.noun()],
  content: faker.lorem.paragraphs(3),
  serviceNumber: randomServiceNumber(),
  rank: faker.helpers.arrayElement(RANKS),
  authorName: faker.person.lastName() + faker.person.firstName(),
  authorUnit: UNITS[i % UNITS.length],
  viewCount: faker.number.int({ min: 0, max: 500 }),
  recommendCount: faker.number.int({ min: 0, max: 100 }),
  rating: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
  ratingCount: faker.number.int({ min: 0, max: 50 }),
  status: STATUSES[i % STATUSES.length],
  isFavorite: faker.datatype.boolean(),
  attachments: [],
  createdAt: faker.date.recent({ days: 90 }).toISOString().split('T')[0],
}))

// 댓글 Mock 데이터
const commentsMap: Record<string, KnowledgeComment[]> = {}

// 페이지네이션 유틸리티
function paginate<T>(items: T[], page: number, size: number): PageResponse<T> {
  const start = page * size
  const content = items.slice(start, start + size)
  return {
    content,
    totalElements: items.length,
    totalPages: Math.ceil(items.length / size),
    size,
    number: page,
  }
}

export const sys13Handlers = [
  // 지식 목록 (page, size, category, keyword, searchType, sortBy)
  http.get('/api/sys13/knowledge', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    const category = url.searchParams.get('category') || ''
    const keyword = url.searchParams.get('keyword') || ''
    const searchType = url.searchParams.get('searchType') || '전체'
    const sortBy = url.searchParams.get('sortBy') || '최신순'
    const authorUnit = url.searchParams.get('authorUnit') || ''

    let filtered = [...knowledgeList]

    if (category) {
      filtered = filtered.filter((item) => item.category === category)
    }

    // 작성부대 필터
    if (authorUnit) {
      filtered = filtered.filter((item) => item.authorUnit.includes(authorUnit))
    }

    if (keyword) {
      filtered = filtered.filter((item) => {
        if (searchType === '제목') return item.title.includes(keyword)
        if (searchType === '내용') return item.content.includes(keyword)
        if (searchType === '작성자') return item.authorName.includes(keyword)
        return item.title.includes(keyword) || item.content.includes(keyword) || item.authorName.includes(keyword)
      })
    }

    if (sortBy === '추천순') {
      filtered = [...filtered].sort((a, b) => b.recommendCount - a.recommendCount)
    } else if (sortBy === '조회순') {
      filtered = [...filtered].sort((a, b) => b.viewCount - a.viewCount)
    } else if (sortBy === '평점순') {
      filtered = [...filtered].sort((a, b) => b.rating - a.rating)
    } else {
      filtered = [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    }

    const result: ApiResult<PageResponse<Knowledge>> = {
      success: true,
      data: paginate(filtered, page, size),
    }
    return HttpResponse.json(result)
  }),

  // 지식 상세
  http.get('/api/sys13/knowledge/:id', ({ params }) => {
    const item = knowledgeList.find((k) => k.id === params.id)
    if (!item) {
      return HttpResponse.json({ success: false, message: '지식을 찾을 수 없습니다' }, { status: 404 })
    }
    // 조회수 증가
    const index = knowledgeList.findIndex((k) => k.id === params.id)
    knowledgeList[index] = { ...knowledgeList[index], viewCount: knowledgeList[index].viewCount + 1 }
    const result: ApiResult<Knowledge> = { success: true, data: knowledgeList[index] }
    return HttpResponse.json(result)
  }),

  // 지식 등록
  http.post('/api/sys13/knowledge', async ({ request }) => {
    const body = (await request.json()) as Partial<Knowledge>
    const newItem: Knowledge = {
      id: `know-${Date.now()}`,
      title: body.title || '',
      category: body.category || '업무지식',
      source: body.source || '생산',
      keywords: (body.keywords as string[]) || [],
      content: body.content || '',
      serviceNumber: 'M-20210001',
      rank: '중위',
      authorName: '홍길동',
      authorUnit: '해병대사령부',
      viewCount: 0,
      recommendCount: 0,
      rating: 0,
      ratingCount: 0,
      status: 'pending',
      isFavorite: false,
      attachments: [],
      createdAt: new Date().toISOString().split('T')[0],
    }
    knowledgeList = [newItem, ...knowledgeList]
    const result: ApiResult<Knowledge> = { success: true, data: newItem }
    return HttpResponse.json(result)
  }),

  // 지식 수정
  http.put('/api/sys13/knowledge/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<Knowledge>
    const index = knowledgeList.findIndex((k) => k.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ success: false, message: '지식을 찾을 수 없습니다' }, { status: 404 })
    }
    knowledgeList[index] = { ...knowledgeList[index], ...body }
    const result: ApiResult<Knowledge> = { success: true, data: knowledgeList[index] }
    return HttpResponse.json(result)
  }),

  // 지식 삭제
  http.delete('/api/sys13/knowledge/:id', ({ params }) => {
    const index = knowledgeList.findIndex((k) => k.id === params.id)
    if (index !== -1) {
      knowledgeList = knowledgeList.filter((k) => k.id !== params.id)
    }
    const result: ApiResult<null> = { success: true, data: null }
    return HttpResponse.json(result)
  }),

  // 추천
  http.post('/api/sys13/knowledge/:id/recommend', ({ params }) => {
    const index = knowledgeList.findIndex((k) => k.id === params.id)
    if (index !== -1) {
      knowledgeList[index] = { ...knowledgeList[index], recommendCount: knowledgeList[index].recommendCount + 1 }
    }
    const result: ApiResult<null> = { success: true, data: null }
    return HttpResponse.json(result)
  }),

  // 비추천
  http.post('/api/sys13/knowledge/:id/unrecommend', ({ params }) => {
    const index = knowledgeList.findIndex((k) => k.id === params.id)
    if (index !== -1) {
      const count = knowledgeList[index].recommendCount
      knowledgeList[index] = { ...knowledgeList[index], recommendCount: Math.max(0, count - 1) }
    }
    const result: ApiResult<null> = { success: true, data: null }
    return HttpResponse.json(result)
  }),

  // 평점
  http.post('/api/sys13/knowledge/:id/rate', async ({ params, request }) => {
    const body = (await request.json()) as { rating: number }
    const index = knowledgeList.findIndex((k) => k.id === params.id)
    if (index !== -1) {
      const item = knowledgeList[index]
      const totalRating = item.rating * item.ratingCount + body.rating
      const newCount = item.ratingCount + 1
      knowledgeList[index] = {
        ...item,
        rating: Math.round((totalRating / newCount) * 10) / 10,
        ratingCount: newCount,
      }
    }
    const result: ApiResult<null> = { success: true, data: null }
    return HttpResponse.json(result)
  }),

  // 신고
  http.post('/api/sys13/knowledge/:id/report', () => {
    const result: ApiResult<null> = { success: true, data: null }
    return HttpResponse.json(result)
  }),

  // 즐겨찾기 토글
  http.post('/api/sys13/knowledge/:id/favorite', ({ params }) => {
    const index = knowledgeList.findIndex((k) => k.id === params.id)
    if (index !== -1) {
      knowledgeList[index] = { ...knowledgeList[index], isFavorite: !knowledgeList[index].isFavorite }
    }
    const result: ApiResult<null> = { success: true, data: null }
    return HttpResponse.json(result)
  }),

  // 관리자 상태변경
  http.put('/api/sys13/knowledge/:id/status', async ({ params, request }) => {
    const body = (await request.json()) as { status: KnowledgeStatus }
    const index = knowledgeList.findIndex((k) => k.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ success: false, message: '지식을 찾을 수 없습니다' }, { status: 404 })
    }
    knowledgeList[index] = { ...knowledgeList[index], status: body.status }
    const result: ApiResult<Knowledge> = { success: true, data: knowledgeList[index] }
    return HttpResponse.json(result)
  }),

  // 댓글 목록
  http.get('/api/sys13/knowledge/:id/comments', ({ params }) => {
    const comments = commentsMap[params.id as string] || []
    const result: ApiResult<KnowledgeComment[]> = { success: true, data: comments }
    return HttpResponse.json(result)
  }),

  // 댓글 등록
  http.post('/api/sys13/knowledge/:id/comments', async ({ params, request }) => {
    const body = (await request.json()) as { content: string }
    const newComment: KnowledgeComment = {
      id: `comment-${Date.now()}`,
      knowledgeId: params.id as string,
      authorName: '홍길동',
      content: body.content || '',
      createdAt: new Date().toISOString().split('T')[0],
    }
    const knowledgeId = params.id as string
    commentsMap[knowledgeId] = [newComment, ...(commentsMap[knowledgeId] || [])]
    const result: ApiResult<KnowledgeComment> = { success: true, data: newComment }
    return HttpResponse.json(result)
  }),

  // 댓글 삭제
  http.delete('/api/sys13/knowledge/:id/comments/:commentId', ({ params }) => {
    const knowledgeId = params.id as string
    if (commentsMap[knowledgeId]) {
      commentsMap[knowledgeId] = commentsMap[knowledgeId].filter((c) => c.id !== params.commentId)
    }
    const result: ApiResult<null> = { success: true, data: null }
    return HttpResponse.json(result)
  }),

  // 유형별 통계
  http.get('/api/sys13/stats/category', () => {
    const total = knowledgeList.length
    const byCategory = CATEGORIES.map((cat) => {
      const count = knowledgeList.filter((k) => k.category === cat).length
      return { category: cat, count, ratio: total > 0 ? Math.round((count / total) * 100) : 0 }
    })
    const result: ApiResult<typeof byCategory> = { success: true, data: byCategory }
    return HttpResponse.json(result)
  }),

  // 부대별 통계
  http.get('/api/sys13/stats/unit', () => {
    const byUnit = UNITS.map((unit) => {
      const items = knowledgeList.filter((k) => k.authorUnit === unit)
      const count = items.length
      const recommendCount = items.reduce((sum, k) => sum + k.recommendCount, 0)
      const avgRating =
        count > 0 ? Math.round((items.reduce((sum, k) => sum + k.rating, 0) / count) * 10) / 10 : 0
      return { unit, count, recommendCount, avgRating }
    })
    const result: ApiResult<typeof byUnit> = { success: true, data: byUnit }
    return HttpResponse.json(result)
  }),

  // 작성자별 통계 (기간 필터 + 정렬)
  http.get('/api/sys13/stats/author', ({ request }) => {
    const url = new URL(request.url)
    const startDate = url.searchParams.get('startDate') || ''
    const endDate = url.searchParams.get('endDate') || ''
    const sortBy = url.searchParams.get('sortBy') || '작성수순'

    let filtered = [...knowledgeList]
    if (startDate) filtered = filtered.filter((k) => k.createdAt >= startDate)
    if (endDate) filtered = filtered.filter((k) => k.createdAt <= endDate)

    // 작성자별 집계 (군번/계급/성명 포함)
    const authorMap = new Map<string, { unit: string; serviceNumber: string; rank: string; authorName: string; count: number; recommendCount: number; rating: number; viewCount: number }>()
    filtered.forEach((k) => {
      const key = `${k.authorUnit}__${k.authorName}`
      if (!authorMap.has(key)) {
        authorMap.set(key, { unit: k.authorUnit, serviceNumber: k.serviceNumber, rank: k.rank, authorName: k.authorName, count: 0, recommendCount: 0, rating: 0, viewCount: 0 })
      }
      const entry = authorMap.get(key)!
      authorMap.set(key, {
        ...entry,
        count: entry.count + 1,
        recommendCount: entry.recommendCount + k.recommendCount,
        rating: entry.rating + k.rating,
        viewCount: entry.viewCount + k.viewCount,
      })
    })

    let data = Array.from(authorMap.values()).map((entry) => ({
      ...entry,
      rating: entry.count > 0 ? Math.round((entry.rating / entry.count) * 10) / 10 : 0,
    }))

    if (sortBy === '추천순') data = data.sort((a, b) => b.recommendCount - a.recommendCount)
    else if (sortBy === '평점순') data = data.sort((a, b) => b.rating - a.rating)
    else if (sortBy === '조회순') data = data.sort((a, b) => b.viewCount - a.viewCount)
    else data = data.sort((a, b) => b.count - a.count)

    const result: ApiResult<typeof data> = { success: true, data }
    return HttpResponse.json(result)
  }),

  // 부대별 작성 목록
  http.get('/api/sys13/stats/unit-list', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')

    const result: ApiResult<PageResponse<Knowledge>> = {
      success: true,
      data: paginate(knowledgeList, page, size),
    }
    return HttpResponse.json(result)
  }),
]
