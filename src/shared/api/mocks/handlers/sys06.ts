import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker/locale/ko'

// 타입 정의 (sys05와 동일 구조, sys06 격리)
export interface Regulation extends Record<string, unknown> {
  id: string
  title: string
  docNumber: string
  category: string
  department: string
  effectiveDate: string
  content: string
  fileUrl?: string
  fileName?: string
}

const DEPARTMENTS = ['정책부', '운영부', '지원부', '법제실', '기획처', '행정처', '감사실', '홍보실']
const CATEGORIES = ['법령', '훈령', '예규', '고시']

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

// 현행규정 Mock 데이터 (16건, sys06 전용 시드)
const regulations: Regulation[] = Array.from({ length: 16 }, (_, i) => ({
  id: `sys06-reg-${i + 1}`,
  title: `${DEPARTMENTS[i % DEPARTMENTS.length]} 규정 제${i + 100}호 ${faker.lorem.words({ min: 2, max: 4 })}`,
  docNumber: `SYS06-REG-${String(i + 1).padStart(3, '0')}`,
  category: CATEGORIES[i % CATEGORIES.length],
  department: DEPARTMENTS[i % DEPARTMENTS.length],
  effectiveDate: faker.date.recent({ days: 365 }).toISOString().split('T')[0],
  content: faker.lorem.paragraphs(2),
  fileUrl: `/files/sys06-regulation-${i + 1}.pdf`,
  fileName: `해병대규정_제${i + 100}호.pdf`,
}))

// 해병대사령부 예규 Mock 데이터 (13건)
const precedentsHQ: Regulation[] = Array.from({ length: 13 }, (_, i) => ({
  id: `sys06-prec-hq-${i + 1}`,
  title: `해병대사령부 예규 제${i + 100}호 ${faker.lorem.words({ min: 2, max: 4 })}`,
  docNumber: `SYS06-HQ-PRE-${String(i + 1).padStart(3, '0')}`,
  category: '예규',
  department: DEPARTMENTS[i % DEPARTMENTS.length],
  effectiveDate: faker.date.recent({ days: 365 }).toISOString().split('T')[0],
  content: faker.lorem.paragraphs(2),
  fileUrl: `/files/sys06-precedent-hq-${i + 1}.pdf`,
}))

// 예하부대 예규 Mock 데이터 (11건)
const precedentsUnit: Regulation[] = Array.from({ length: 11 }, (_, i) => ({
  id: `sys06-prec-unit-${i + 1}`,
  title: `예하부대 예규 제${i + 100}호 ${faker.lorem.words({ min: 2, max: 4 })}`,
  docNumber: `SYS06-UNIT-PRE-${String(i + 1).padStart(3, '0')}`,
  category: '예규',
  department: DEPARTMENTS[i % DEPARTMENTS.length],
  effectiveDate: faker.date.recent({ days: 365 }).toISOString().split('T')[0],
  content: faker.lorem.paragraphs(2),
  fileUrl: `/files/sys06-precedent-unit-${i + 1}.pdf`,
}))

// 지시문서 Mock 데이터 (9건)
const directives: Regulation[] = Array.from({ length: 9 }, (_, i) => ({
  id: `sys06-dir-${i + 1}`,
  title: `지시문서 제${i + 100}호 ${faker.lorem.words({ min: 2, max: 4 })}`,
  docNumber: `SYS06-DIR-${String(i + 1).padStart(3, '0')}`,
  category: '지시문서',
  department: DEPARTMENTS[i % DEPARTMENTS.length],
  effectiveDate: faker.date.recent({ days: 365 }).toISOString().split('T')[0],
  content: faker.lorem.paragraphs(2),
  fileUrl: `/files/sys06-directive-${i + 1}.pdf`,
}))

export const sys06Handlers = [
  // 현행규정 목록 (MREG-01)
  http.get('/api/sys06/regulations', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    const keyword = url.searchParams.get('keyword') || ''
    const department = url.searchParams.get('department') || ''

    let filtered = [...regulations]
    if (keyword) {
      filtered = filtered.filter(
        (item) =>
          item.title.includes(keyword) ||
          item.docNumber.includes(keyword) ||
          item.department.includes(keyword),
      )
    }
    if (department) {
      filtered = filtered.filter((item) => item.department === department)
    }
    return HttpResponse.json({ success: true, data: paginate(filtered, page, size) })
  }),

  // 현행규정 상세 조회
  http.get('/api/sys06/regulations/:id', ({ params }) => {
    const item = regulations.find((r) => r.id === params.id)
    if (!item) return HttpResponse.json({ success: false, message: '규정을 찾을 수 없습니다' }, { status: 404 })
    return HttpResponse.json({ success: true, data: item })
  }),

  // 현행규정 등록
  http.post('/api/sys06/regulations', async ({ request }) => {
    const body = await request.json() as Partial<Regulation>
    const newItem: Regulation = {
      id: `sys06-reg-${regulations.length + 1}`,
      title: body.title ?? '',
      docNumber: body.docNumber ?? '',
      category: body.category ?? '법령',
      department: body.department ?? '',
      effectiveDate: body.effectiveDate ?? '',
      content: body.content ?? '',
      fileName: body.fileName,
    }
    regulations.push(newItem)
    return HttpResponse.json({ success: true, data: newItem })
  }),

  // 현행규정 수정
  http.put('/api/sys06/regulations/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<Regulation>
    const idx = regulations.findIndex((r) => r.id === params.id)
    if (idx === -1) return HttpResponse.json({ success: false, message: '규정을 찾을 수 없습니다' }, { status: 404 })
    regulations[idx] = { ...regulations[idx], ...body }
    return HttpResponse.json({ success: true, data: regulations[idx] })
  }),

  // 현행규정 삭제
  http.delete('/api/sys06/regulations/:id', ({ params }) => {
    const idx = regulations.findIndex((r) => r.id === params.id)
    if (idx === -1) return HttpResponse.json({ success: false, message: '규정을 찾을 수 없습니다' }, { status: 404 })
    regulations.splice(idx, 1)
    return HttpResponse.json({ success: true })
  }),

  // 예규(사령부) 목록 (MREG-02)
  http.get('/api/sys06/precedents/hq', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    const keyword = url.searchParams.get('keyword') || ''

    let filtered = [...precedentsHQ]
    if (keyword) {
      filtered = filtered.filter(
        (item) => item.title.includes(keyword) || item.docNumber.includes(keyword),
      )
    }
    return HttpResponse.json({ success: true, data: paginate(filtered, page, size) })
  }),

  // 예규(사령부) 상세 조회
  http.get('/api/sys06/precedents/hq/:id', ({ params }) => {
    const item = precedentsHQ.find((r) => r.id === params.id)
    if (!item) return HttpResponse.json({ success: false, message: '예규를 찾을 수 없습니다' }, { status: 404 })
    return HttpResponse.json({ success: true, data: item })
  }),

  // 예하부대 목록 (MREG-03)
  http.get('/api/sys06/precedents/units', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    const keyword = url.searchParams.get('keyword') || ''

    let filtered = [...precedentsUnit]
    if (keyword) {
      filtered = filtered.filter(
        (item) => item.title.includes(keyword) || item.docNumber.includes(keyword),
      )
    }
    return HttpResponse.json({ success: true, data: paginate(filtered, page, size) })
  }),

  // 지시문서 목록 (MREG-04)
  http.get('/api/sys06/directives', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    const keyword = url.searchParams.get('keyword') || ''

    let filtered = [...directives]
    if (keyword) {
      filtered = filtered.filter(
        (item) => item.title.includes(keyword) || item.docNumber.includes(keyword),
      )
    }
    return HttpResponse.json({ success: true, data: paginate(filtered, page, size) })
  }),

  // 지시문서 상세 조회
  http.get('/api/sys06/directives/:id', ({ params }) => {
    const item = directives.find((d) => d.id === params.id)
    if (!item) return HttpResponse.json({ success: false, message: '지시문서를 찾을 수 없습니다' }, { status: 404 })
    return HttpResponse.json({ success: true, data: item })
  }),

  // 즐겨찾기 토글
  http.post('/api/sys06/regulations/:id/favorite', ({ params }) => {
    const item = regulations.find((r) => r.id === params.id)
    if (!item) return HttpResponse.json({ success: false, message: '규정을 찾을 수 없습니다' }, { status: 404 })
    return HttpResponse.json({ success: true, data: { id: params.id, favorited: true } })
  }),
]
