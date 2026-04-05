import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker/locale/ko'

// 타입 정의
interface Suggestion {
  id: string
  title: string
  content: string
  authorName: string
  authorUnit: string
  status: 'open' | 'answered' | 'closed'
  isPrivate: boolean
  recommendCount: number
  reportCount: number
  answer?: string
  answeredAt?: string
  answeredBy?: string
  createdAt: string
  updatedAt: string
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
  // status 분포: open 60%, answered 30%, closed 10%
  const rand = i % 10
  let status: 'open' | 'answered' | 'closed'
  if (rand < 6) status = 'open'
  else if (rand < 9) status = 'answered'
  else status = 'closed'

  const createdAt = faker.date.recent({ days: 90 }).toISOString().split('T')[0]
  const hasAnswer = status !== 'open'

  return {
    id: `sug-${i + 1}`,
    title: faker.lorem.words({ min: 3, max: 7 }),
    content: faker.lorem.paragraphs(2),
    authorName: faker.person.lastName() + faker.person.firstName(),
    authorUnit: `제${faker.number.int({ min: 1, max: 5 })}대대`,
    status,
    isPrivate: faker.datatype.boolean({ probability: 0.2 }),
    recommendCount: faker.number.int({ min: 0, max: 30 }),
    reportCount: faker.number.int({ min: 0, max: 5 }),
    answer: hasAnswer ? faker.lorem.paragraph() : undefined,
    answeredAt: hasAnswer ? faker.date.recent({ days: 30 }).toISOString().split('T')[0] : undefined,
    answeredBy: hasAnswer ? faker.person.lastName() + faker.person.firstName() : undefined,
    createdAt,
    updatedAt: createdAt,
  }
})

export const sys14Handlers = [
  // 통계
  http.get('/api/sys14/suggestions/stats', () => {
    const now = new Date()
    const thisMonth = suggestions.filter((s) => {
      const d = new Date(s.createdAt)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length
    const answered = suggestions.filter((s) => s.status === 'answered').length
    const pending = suggestions.filter((s) => s.status === 'open').length
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

  // 목록 조회 (keyword/status 필터 + 페이지네이션)
  http.get('/api/sys14/suggestions', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    const keyword = url.searchParams.get('keyword') || ''
    const status = url.searchParams.get('status') || ''

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
      authorName: '홍길동',
      authorUnit: '제1대대',
      status: 'open',
      isPrivate: body.isPrivate ?? false,
      recommendCount: 0,
      reportCount: 0,
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
    item.status = 'answered'
    item.updatedAt = new Date().toISOString().split('T')[0]
    return HttpResponse.json({ success: true, data: item })
  }),
]
