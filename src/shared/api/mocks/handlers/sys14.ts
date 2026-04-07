import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker/locale/ko'
import { randomServiceNumber } from '../mockServiceNumber'

// 타입 정의
interface Suggestion {
  id: string
  title: string
  content: string
  authorName: string
  serviceNumber: string
  rank: string
  authorUnit: string
  authorPosition?: string
  authorPhone?: string
  status: 'registered' | 'received' | 'processing' | 'completed' | 'rejected'
  assignedDept: string
  actionDate?: string
  actionType?: string
  rejectReason?: string
  isPrivate: boolean
  recommendCount: number
  reportCount: number
  attachments: { name: string; url: string }[]
  answer?: string
  answeredAt?: string
  answeredBy?: string
  createdAt: string
  updatedAt: string
}

// 댓글 타입
interface SuggestionComment {
  id: string
  suggestionId: string
  authorName: string
  content: string
  createdAt: string
}

// 서식 타입
interface Template {
  id: string
  name: string
  content: string
  createdAt: string
}

// 페이지네이션 유틸리티
function paginate<T>(items: T[], page: number, size: number) {
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

// Mock 제언 데이터 (25건)
const suggestions: Suggestion[] = Array.from({ length: 25 }, (_, i) => {
  const rand = i % 10
  let status: Suggestion['status']
  if (rand < 4) status = 'registered'
  else if (rand < 6) status = 'received'
  else if (rand < 8) status = 'processing'
  else if (rand < 9) status = 'completed'
  else status = 'rejected'

  const createdAt = faker.date.recent({ days: 90 }).toISOString().split('T')[0]
  const hasAnswer = status === 'completed'
  const deptList = ['작전과', '인사과', '군수과', '정보통신과', '기획부']
  // CSV 스펙: 정책반영, 업무추진, 기추진, 업무참고
  const actionTypes = ['정책반영', '업무추진', '기추진', '업무참고']

  return {
    id: `sug-${i + 1}`,
    title: faker.lorem.words({ min: 3, max: 7 }),
    content: faker.lorem.paragraphs(2),
    authorName: faker.person.lastName() + faker.person.firstName(),
    serviceNumber: randomServiceNumber(),
    rank: faker.helpers.arrayElement(['이병', '일병', '상병', '병장', '하사', '중사', '상사', '원사', '준위', '소위', '중위', '대위', '소령', '중령', '대령']),
    authorUnit: `제${faker.number.int({ min: 1, max: 5 })}대대`,
    authorPosition: faker.helpers.arrayElement(['과장', '계장', '담당관', '참모']),
    authorPhone: faker.phone.number({ style: 'national' }),
    status,
    assignedDept: faker.helpers.arrayElement(deptList),
    actionDate: (status === 'completed' || status === 'processing') ? faker.date.recent({ days: 30 }).toISOString().split('T')[0] : undefined,
    actionType: (status === 'completed' || status === 'processing') ? faker.helpers.arrayElement(actionTypes) : undefined,
    rejectReason: status === 'rejected' ? faker.lorem.sentence() : undefined,
    isPrivate: faker.datatype.boolean({ probability: 0.2 }),
    recommendCount: faker.number.int({ min: 0, max: 30 }),
    reportCount: faker.number.int({ min: 0, max: 5 }),
    attachments: faker.datatype.boolean({ probability: 0.3 })
      ? [{ name: `첨부파일_${i + 1}.pdf`, url: `/files/attachment_${i + 1}.pdf` }]
      : [],
    answer: hasAnswer ? faker.lorem.paragraph() : undefined,
    answeredAt: hasAnswer ? faker.date.recent({ days: 30 }).toISOString().split('T')[0] : undefined,
    answeredBy: hasAnswer ? faker.person.lastName() + faker.person.firstName() : undefined,
    createdAt,
    updatedAt: createdAt,
  }
})

// 댓글 저장소
const commentStore: SuggestionComment[] = [
  { id: 'cmt-1', suggestionId: 'sug-1', authorName: '홍길동', content: '좋은 제언입니다.', createdAt: '2026-03-25' },
  { id: 'cmt-2', suggestionId: 'sug-1', authorName: '김철수', content: '동의합니다.', createdAt: '2026-03-26' },
]

// 서식 저장소
const templates: Template[] = [
  { id: 'tmpl-1', name: '기본 서식', content: '1. 제언 배경\n2. 제언 내용\n3. 기대 효과', createdAt: '2026-01-01' },
  { id: 'tmpl-2', name: '개선 제안 서식', content: '1. 현황\n2. 문제점\n3. 개선 방안\n4. 기대 효과', createdAt: '2026-02-01' },
]

export const sys14Handlers = [
  // 통계
  http.get('/api/sys14/suggestions/stats', () => {
    const now = new Date()
    const thisMonth = suggestions.filter((s) => {
      const d = new Date(s.createdAt)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length
    const answered = suggestions.filter((s) => s.status === 'completed').length
    const pending = suggestions.filter((s) => s.status === 'registered').length
    return HttpResponse.json({
      success: true,
      data: { total: suggestions.length, thisMonth, answered, pending },
    })
  }),

  // 최신 5건
  http.get('/api/sys14/suggestions/recent', () => {
    const sorted = [...suggestions].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return HttpResponse.json({ success: true, data: paginate(sorted.slice(0, 5), 0, 5) })
  }),

  // 공지사항 5건
  http.get('/api/sys14/notices', () => {
    const notices = Array.from({ length: 5 }, (_, i) => ({
      id: `notice-${i + 1}`,
      title: faker.lorem.sentence(),
      createdAt: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
    }))
    return HttpResponse.json({ success: true, data: notices })
  }),

  // 목록 조회 (keyword/status 필터 + 페이지네이션)
  http.get('/api/sys14/suggestions', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    const keyword = url.searchParams.get('keyword') || ''
    const status = url.searchParams.get('status') || ''
    const actionType = url.searchParams.get('actionType') || ''
    const author = url.searchParams.get('author') || ''

    let filtered = [...suggestions]
    if (keyword) {
      filtered = filtered.filter(
        (s) =>
          s.title.includes(keyword) ||
          s.content.includes(keyword) ||
          s.authorName.includes(keyword),
      )
    }
    if (status) {
      filtered = filtered.filter((s) => s.status === status)
    }
    if (actionType) {
      filtered = filtered.filter((s) => s.actionType === actionType)
    }
    if (author) {
      filtered = filtered.filter((s) => s.authorName.includes(author))
    }
    return HttpResponse.json({ success: true, data: paginate(filtered, page, size) })
  }),

  // 상세 단건
  http.get('/api/sys14/suggestions/:id', ({ params }) => {
    const item = suggestions.find((s) => s.id === params.id)
    if (!item) {
      return HttpResponse.json({ success: false, message: '제언을 찾을 수 없습니다' }, { status: 404 })
    }
    return HttpResponse.json({ success: true, data: item })
  }),

  // 새 제언 등록
  http.post('/api/sys14/suggestions', async ({ request }) => {
    const body = await request.json() as Partial<Suggestion>
    const newItem: Suggestion = {
      id: `sug-${Date.now()}`,
      title: body.title || '',
      content: body.content || '',
      authorName: body.authorName || '홍길동',
      serviceNumber: body.serviceNumber || 'M-20260001',
      rank: body.rank || '대위',
      authorUnit: body.authorUnit || '해병대사령부',
      authorPosition: body.authorPosition || '과장',
      authorPhone: body.authorPhone || '010-1234-5678',
      status: 'registered',
      assignedDept: '',
      isPrivate: body.isPrivate ?? false,
      recommendCount: 0,
      reportCount: 0,
      attachments: [],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    }
    suggestions.push(newItem)
    return HttpResponse.json({ success: true, data: newItem })
  }),

  // 제언 수정
  http.put('/api/sys14/suggestions/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<Suggestion>
    const index = suggestions.findIndex((s) => s.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ success: false, message: '제언을 찾을 수 없습니다' }, { status: 404 })
    }
    suggestions[index] = {
      ...suggestions[index],
      ...body,
      updatedAt: new Date().toISOString().split('T')[0],
    }
    return HttpResponse.json({ success: true, data: suggestions[index] })
  }),

  // 제언 삭제
  http.delete('/api/sys14/suggestions/:id', ({ params }) => {
    const index = suggestions.findIndex((s) => s.id === params.id)
    if (index !== -1) suggestions.splice(index, 1)
    return HttpResponse.json({ success: true, data: null })
  }),

  // 추천 +1
  http.post('/api/sys14/suggestions/:id/recommend', ({ params }) => {
    const item = suggestions.find((s) => s.id === params.id)
    if (!item) {
      return HttpResponse.json({ success: false, message: '제언을 찾을 수 없습니다' }, { status: 404 })
    }
    item.recommendCount += 1
    return HttpResponse.json({ success: true, data: { recommendCount: item.recommendCount } })
  }),

  // 신고 +1
  http.post('/api/sys14/suggestions/:id/report', ({ params }) => {
    const item = suggestions.find((s) => s.id === params.id)
    if (!item) {
      return HttpResponse.json({ success: false, message: '제언을 찾을 수 없습니다' }, { status: 404 })
    }
    item.reportCount += 1
    return HttpResponse.json({ success: true, data: { reportCount: item.reportCount } })
  }),

  // 비공개 처리
  http.patch('/api/sys14/suggestions/:id/private', ({ params }) => {
    const item = suggestions.find((s) => s.id === params.id)
    if (!item) {
      return HttpResponse.json({ success: false, message: '제언을 찾을 수 없습니다' }, { status: 404 })
    }
    item.isPrivate = true
    item.updatedAt = new Date().toISOString().split('T')[0]
    return HttpResponse.json({ success: true, data: item })
  }),

  // 관리자 답변 등록
  http.patch('/api/sys14/suggestions/:id/answer', async ({ params, request }) => {
    const body = await request.json() as { answer: string }
    const item = suggestions.find((s) => s.id === params.id)
    if (!item) {
      return HttpResponse.json({ success: false, message: '제언을 찾을 수 없습니다' }, { status: 404 })
    }
    item.answer = body.answer
    item.answeredAt = new Date().toISOString().split('T')[0]
    item.answeredBy = '관리자'
    item.status = 'completed'
    item.updatedAt = new Date().toISOString().split('T')[0]
    return HttpResponse.json({ success: true, data: item })
  }),

  // 상태 변경 (G20: 조치유형/조치일 연동, G21: 반려사유)
  http.patch('/api/sys14/suggestions/:id/status', async ({ params, request }) => {
    const body = await request.json() as {
      status: Suggestion['status']
      actionType?: string
      actionDate?: string
      assignedDept?: string
      rejectReason?: string
    }
    const item = suggestions.find((s) => s.id === params.id)
    if (!item) {
      return HttpResponse.json({ success: false, message: '제언을 찾을 수 없습니다' }, { status: 404 })
    }
    item.status = body.status
    if (body.actionType) item.actionType = body.actionType
    if (body.actionDate) item.actionDate = body.actionDate
    if (body.assignedDept) item.assignedDept = body.assignedDept
    if (body.rejectReason) item.rejectReason = body.rejectReason
    item.updatedAt = new Date().toISOString().split('T')[0]
    return HttpResponse.json({ success: true, data: item })
  }),

  // === 댓글 API (G24) ===

  // 댓글 목록
  http.get('/api/sys14/suggestions/:id/comments', ({ params }) => {
    const filtered = commentStore.filter((c) => c.suggestionId === params.id)
    return HttpResponse.json({ success: true, data: filtered })
  }),

  // 댓글 등록
  http.post('/api/sys14/suggestions/:id/comments', async ({ params, request }) => {
    const body = await request.json() as { content: string }
    const newComment: SuggestionComment = {
      id: `cmt-${Date.now()}`,
      suggestionId: params.id as string,
      authorName: '홍길동',
      content: body.content,
      createdAt: new Date().toISOString().split('T')[0],
    }
    commentStore.push(newComment)
    return HttpResponse.json({ success: true, data: newComment })
  }),

  // 댓글 수정
  http.put('/api/sys14/suggestions/:id/comments/:commentId', async ({ params, request }) => {
    const body = await request.json() as { content: string }
    const idx = commentStore.findIndex((c) => c.id === params.commentId)
    if (idx === -1) {
      return HttpResponse.json({ success: false, message: '댓글을 찾을 수 없습니다' }, { status: 404 })
    }
    commentStore[idx] = { ...commentStore[idx], content: body.content }
    return HttpResponse.json({ success: true, data: commentStore[idx] })
  }),

  // 댓글 삭제
  http.delete('/api/sys14/suggestions/:id/comments/:commentId', ({ params }) => {
    const idx = commentStore.findIndex((c) => c.id === params.commentId)
    if (idx !== -1) commentStore.splice(idx, 1)
    return HttpResponse.json({ success: true, data: null })
  }),

  // === 서식 API (G25) ===

  // 서식 목록
  http.get('/api/sys14/templates', () => {
    return HttpResponse.json({ success: true, data: paginate(templates, 0, 20) })
  }),

  // 서식 등록
  http.post('/api/sys14/templates', async ({ request }) => {
    const body = await request.json() as { name: string; content: string }
    const newTemplate: Template = {
      id: `tmpl-${Date.now()}`,
      name: body.name,
      content: body.content,
      createdAt: new Date().toISOString().split('T')[0],
    }
    templates.push(newTemplate)
    return HttpResponse.json({ success: true, data: newTemplate })
  }),

  // 서식 수정
  http.put('/api/sys14/templates/:id', async ({ params, request }) => {
    const body = await request.json() as { name: string; content: string }
    const idx = templates.findIndex((t) => t.id === params.id)
    if (idx === -1) {
      return HttpResponse.json({ success: false, message: '서식을 찾을 수 없습니다' }, { status: 404 })
    }
    templates[idx] = { ...templates[idx], ...body }
    return HttpResponse.json({ success: true, data: templates[idx] })
  }),

  // 서식 삭제
  http.delete('/api/sys14/templates/:id', ({ params }) => {
    const idx = templates.findIndex((t) => t.id === params.id)
    if (idx !== -1) templates.splice(idx, 1)
    return HttpResponse.json({ success: true, data: null })
  }),
]
