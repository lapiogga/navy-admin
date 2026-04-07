import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker/locale/ko'
import { randomServiceNumber } from '../mockServiceNumber'

// 타입 정의
export interface Regulation {
  id: string
  title: string
  docNumber: string
  category: string
  department: string
  effectiveDate: string
  content: string
  fileUrl?: string
  fileName?: string
  serviceNumber?: string
  rank?: string
  authorName?: string
}

const RANKS = ['이병','일병','상병','병장','하사','중사','상사','원사','준위','소위','중위','대위','소령','중령','대령']

const DEPARTMENTS = ['인사참모부', '정보작전참모부', '전력기획참모부', '군수참모부', '교육훈련참모부', '감찰실', '법무실', '공보정훈실']
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

// 현행규정 Mock 데이터 (15건)
const regulations: Regulation[] = Array.from({ length: 15 }, (_, i) => ({
  id: `reg-${i + 1}`,
  title: `${DEPARTMENTS[i % DEPARTMENTS.length]} 규정 제${i + 1}호 ${faker.lorem.words({ min: 2, max: 4 })}`,
  docNumber: `REG-${String(i + 1).padStart(3, '0')}`,
  category: CATEGORIES[i % CATEGORIES.length],
  department: DEPARTMENTS[i % DEPARTMENTS.length],
  effectiveDate: faker.date.recent({ days: 365 }).toISOString().split('T')[0],
  content: faker.lorem.paragraphs(2),
  fileUrl: `/files/regulation-${i + 1}.pdf`,
  fileName: `규정_제${i + 1}호.pdf`,
  serviceNumber: randomServiceNumber(),
  rank: faker.helpers.arrayElement(RANKS),
  authorName: faker.person.fullName(),
}))

// 해군본부 예규 Mock 데이터 (12건)
const precedentsHQ: Regulation[] = Array.from({ length: 12 }, (_, i) => ({
  id: `prec-hq-${i + 1}`,
  title: `해군본부 예규 제${i + 1}호 ${faker.lorem.words({ min: 2, max: 4 })}`,
  docNumber: `HQ-PRE-${String(i + 1).padStart(3, '0')}`,
  category: '예규',
  department: DEPARTMENTS[i % DEPARTMENTS.length],
  effectiveDate: faker.date.recent({ days: 365 }).toISOString().split('T')[0],
  content: faker.lorem.paragraphs(2),
  fileUrl: `/files/precedent-hq-${i + 1}.pdf`,
  serviceNumber: randomServiceNumber(),
  rank: faker.helpers.arrayElement(RANKS),
  authorName: faker.person.fullName(),
}))

// 예하부대 예규 Mock 데이터 (10건)
const precedentsUnit: Regulation[] = Array.from({ length: 10 }, (_, i) => ({
  id: `prec-unit-${i + 1}`,
  title: `예하부대 예규 제${i + 1}호 ${faker.lorem.words({ min: 2, max: 4 })}`,
  docNumber: `UNIT-PRE-${String(i + 1).padStart(3, '0')}`,
  category: '예규',
  department: DEPARTMENTS[i % DEPARTMENTS.length],
  effectiveDate: faker.date.recent({ days: 365 }).toISOString().split('T')[0],
  content: faker.lorem.paragraphs(2),
  fileUrl: `/files/precedent-unit-${i + 1}.pdf`,
  serviceNumber: randomServiceNumber(),
  rank: faker.helpers.arrayElement(RANKS),
  authorName: faker.person.fullName(),
}))

// 지시문서 Mock 데이터 (8건)
const directives: Regulation[] = Array.from({ length: 8 }, (_, i) => ({
  id: `dir-${i + 1}`,
  title: `지시문서 제${i + 1}호 ${faker.lorem.words({ min: 2, max: 4 })}`,
  docNumber: `DIR-${String(i + 1).padStart(3, '0')}`,
  category: '지시문서',
  department: DEPARTMENTS[i % DEPARTMENTS.length],
  effectiveDate: faker.date.recent({ days: 365 }).toISOString().split('T')[0],
  content: faker.lorem.paragraphs(2),
  fileUrl: `/files/directive-${i + 1}.pdf`,
  serviceNumber: randomServiceNumber(),
  rank: faker.helpers.arrayElement(RANKS),
  authorName: faker.person.fullName(),
}))

export const sys05Handlers = [
  // 현행규정 목록 (검색조건: 규정명, 문서번호, 분류, 소관부서 + 페이지네이션)
  http.get('/api/sys05/regulations', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    const keyword = url.searchParams.get('keyword') || ''
    const department = url.searchParams.get('department') || ''
    const titleSearch = url.searchParams.get('title') || ''
    const docNumberSearch = url.searchParams.get('docNumber') || ''
    const categorySearch = url.searchParams.get('category') || ''

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
    // 검색 파라미터 필터링 (R2)
    if (titleSearch) {
      filtered = filtered.filter((item) => item.title.includes(titleSearch))
    }
    if (docNumberSearch) {
      filtered = filtered.filter((item) => item.docNumber.includes(docNumberSearch))
    }
    if (categorySearch) {
      filtered = filtered.filter((item) => item.category === categorySearch)
    }
    return HttpResponse.json({ success: true, data: paginate(filtered, page, size) })
  }),

  // 현행규정 상세 조회
  http.get('/api/sys05/regulations/:id', ({ params }) => {
    const item = regulations.find((r) => r.id === params.id)
    if (!item) return HttpResponse.json({ success: false, message: '규정을 찾을 수 없습니다' }, { status: 404 })
    return HttpResponse.json({ success: true, data: item })
  }),

  // 현행규정 등록
  http.post('/api/sys05/regulations', async ({ request }) => {
    const body = await request.json() as Partial<Regulation>
    const newItem: Regulation = {
      id: `reg-${regulations.length + 1}`,
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
  http.put('/api/sys05/regulations/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<Regulation>
    const idx = regulations.findIndex((r) => r.id === params.id)
    if (idx === -1) return HttpResponse.json({ success: false, message: '규정을 찾을 수 없습니다' }, { status: 404 })
    regulations[idx] = { ...regulations[idx], ...body }
    return HttpResponse.json({ success: true, data: regulations[idx] })
  }),

  // 현행규정 삭제
  http.delete('/api/sys05/regulations/:id', ({ params }) => {
    const idx = regulations.findIndex((r) => r.id === params.id)
    if (idx === -1) return HttpResponse.json({ success: false, message: '규정을 찾을 수 없습니다' }, { status: 404 })
    regulations.splice(idx, 1)
    return HttpResponse.json({ success: true })
  }),

  // 해군본부 예규 목록 (검색조건: 예규명, 문서번호)
  http.get('/api/sys05/precedents/hq', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    const keyword = url.searchParams.get('keyword') || ''
    const titleSearch = url.searchParams.get('title') || ''
    const docNumberSearch = url.searchParams.get('docNumber') || ''

    let filtered = [...precedentsHQ]
    if (keyword) {
      filtered = filtered.filter(
        (item) => item.title.includes(keyword) || item.docNumber.includes(keyword),
      )
    }
    // 검색 파라미터 필터링 (R2)
    if (titleSearch) {
      filtered = filtered.filter((item) => item.title.includes(titleSearch))
    }
    if (docNumberSearch) {
      filtered = filtered.filter((item) => item.docNumber.includes(docNumberSearch))
    }
    return HttpResponse.json({ success: true, data: paginate(filtered, page, size) })
  }),

  // 해군본부 예규 등록
  http.post('/api/sys05/precedents/hq', async ({ request }) => {
    const body = await request.json() as Partial<Regulation>
    const newItem: Regulation = {
      id: `prec-hq-${precedentsHQ.length + 1}`,
      title: body.title ?? '',
      docNumber: body.docNumber ?? '',
      category: '예규',
      department: body.department ?? '',
      effectiveDate: body.effectiveDate ?? '',
      content: body.content ?? '',
    }
    precedentsHQ.push(newItem)
    return HttpResponse.json({ success: true, data: newItem })
  }),

  // 해군본부 예규 수정
  http.put('/api/sys05/precedents/hq/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<Regulation>
    const idx = precedentsHQ.findIndex((r) => r.id === params.id)
    if (idx === -1) return HttpResponse.json({ success: false, message: '예규를 찾을 수 없습니다' }, { status: 404 })
    precedentsHQ[idx] = { ...precedentsHQ[idx], ...body }
    return HttpResponse.json({ success: true, data: precedentsHQ[idx] })
  }),

  // 해군본부 예규 삭제
  http.delete('/api/sys05/precedents/hq/:id', ({ params }) => {
    const idx = precedentsHQ.findIndex((r) => r.id === params.id)
    if (idx === -1) return HttpResponse.json({ success: false, message: '예규를 찾을 수 없습니다' }, { status: 404 })
    precedentsHQ.splice(idx, 1)
    return HttpResponse.json({ success: true })
  }),

  // 해군본부 예규 상세 조회
  http.get('/api/sys05/precedents/hq/:id', ({ params }) => {
    const item = precedentsHQ.find((r) => r.id === params.id)
    if (!item) return HttpResponse.json({ success: false, message: '예규를 찾을 수 없습니다' }, { status: 404 })
    return HttpResponse.json({ success: true, data: item })
  }),

  // 예하부대 예규 목록
  http.get('/api/sys05/precedents/unit', ({ request }) => {
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

  // 예하부대 예규 상세 조회
  http.get('/api/sys05/precedents/unit/:id', ({ params }) => {
    const item = precedentsUnit.find((r) => r.id === params.id)
    if (!item) return HttpResponse.json({ success: false, message: '예규를 찾을 수 없습니다' }, { status: 404 })
    return HttpResponse.json({ success: true, data: item })
  }),

  // 지시문서 목록 (검색조건: 지시명, 문서번호)
  http.get('/api/sys05/directives', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    const keyword = url.searchParams.get('keyword') || ''
    const titleSearch = url.searchParams.get('title') || ''
    const docNumberSearch = url.searchParams.get('docNumber') || ''

    let filtered = [...directives]
    if (keyword) {
      filtered = filtered.filter(
        (item) => item.title.includes(keyword) || item.docNumber.includes(keyword),
      )
    }
    // 검색 파라미터 필터링 (R2)
    if (titleSearch) {
      filtered = filtered.filter((item) => item.title.includes(titleSearch))
    }
    if (docNumberSearch) {
      filtered = filtered.filter((item) => item.docNumber.includes(docNumberSearch))
    }
    return HttpResponse.json({ success: true, data: paginate(filtered, page, size) })
  }),

  // 지시문서 등록
  http.post('/api/sys05/directives', async ({ request }) => {
    const body = await request.json() as Partial<Regulation>
    const newItem: Regulation = {
      id: `dir-${directives.length + 1}`,
      title: body.title ?? '',
      docNumber: body.docNumber ?? '',
      category: '지시문서',
      department: body.department ?? '',
      effectiveDate: body.effectiveDate ?? '',
      content: body.content ?? '',
    }
    directives.push(newItem)
    return HttpResponse.json({ success: true, data: newItem })
  }),

  // 지시문서 수정
  http.put('/api/sys05/directives/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<Regulation>
    const idx = directives.findIndex((d) => d.id === params.id)
    if (idx === -1) return HttpResponse.json({ success: false, message: '지시문서를 찾을 수 없습니다' }, { status: 404 })
    directives[idx] = { ...directives[idx], ...body }
    return HttpResponse.json({ success: true, data: directives[idx] })
  }),

  // 지시문서 삭제
  http.delete('/api/sys05/directives/:id', ({ params }) => {
    const idx = directives.findIndex((d) => d.id === params.id)
    if (idx === -1) return HttpResponse.json({ success: false, message: '지시문서를 찾을 수 없습니다' }, { status: 404 })
    directives.splice(idx, 1)
    return HttpResponse.json({ success: true })
  }),

  // 지시문서 상세 조회
  http.get('/api/sys05/directives/:id', ({ params }) => {
    const item = directives.find((d) => d.id === params.id)
    if (!item) return HttpResponse.json({ success: false, message: '지시문서를 찾을 수 없습니다' }, { status: 404 })
    return HttpResponse.json({ success: true, data: item })
  }),
]
