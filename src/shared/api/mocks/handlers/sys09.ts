import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker/locale/ko'
import type { ApiResult, PageResponse } from '@/shared/api/types'

// 타입 정의
export type DeathType = 'combat' | 'duty' | 'disease' | 'accident'
export type InjuryType = 'combat' | 'duty'
export type ReviewResult = 'eligible' | 'ineligible'

export interface Deceased extends Record<string, unknown> {
  id: string
  serviceNumber: string
  name: string
  residentNumber: string     // 마스킹: 앞6-*******
  rank: string
  unit: string
  enlistDate: string
  phone: string
  deathType: DeathType
  deathDate: string
  deathPlace: string
  deathCause: string
  burialPlace: string
  familyContact: string
  remarks: string
  militaryType: string       // 해병/해군/육군/공군
}

export interface Injured extends Record<string, unknown> {
  id: string
  serviceNumber: string
  name: string
  residentNumber: string
  rank: string
  unit: string
  enlistDate: string
  phone: string
  address: string
  injuryType: InjuryType
  injuryGrade: string        // 1~7급
  injuryDate: string
  injuryPlace: string
  injuryCause: string
  hospitalName: string
  remarks: string
  militaryType: string
}

export interface CombatReview extends Record<string, unknown> {
  id: string
  reviewRound: string        // "제1차" etc
  reviewDate: string
  name: string
  serviceNumber: string
  birthDate: string
  enlistDate: string
  rank: string
  unit: string
  incidentType: string       // 전사/순직/전상/공상
  incidentDate: string
  incidentCause: string
  result: ReviewResult
  resultDetail: string
  remarks: string
}

const MILITARY_TYPES = ['해병', '해군', '육군', '공군']
const RANKS = ['이병', '일병', '상병', '병장', '하사', '중사', '상사', '원사', '소위', '중위', '대위', '소령', '중령', '대령']
const UNITS = ['1사단', '2사단', '해병대사령부', '교육훈련단', '상륙기동단']
const DEATH_TYPES: DeathType[] = ['combat', 'duty', 'disease', 'accident']
const INJURY_TYPES: InjuryType[] = ['combat', 'duty']
const INJURY_GRADES = ['1급', '2급', '3급', '4급', '5급', '6급', '7급']
const INCIDENT_TYPES = ['전사', '순직', '전상', '공상']

// Mock 데이터 생성
let deceasedList: Deceased[] = Array.from({ length: 25 }, (_, i) => ({
  id: `deceased-${i + 1}`,
  serviceNumber: `M-${faker.string.numeric(8)}`,
  name: faker.person.lastName() + faker.person.firstName(),
  residentNumber: faker.string.numeric(6) + '-*******',
  rank: RANKS[i % RANKS.length],
  unit: UNITS[i % UNITS.length],
  enlistDate: faker.date.past({ years: 10 }).toISOString().split('T')[0],
  phone: faker.phone.number(),
  deathType: DEATH_TYPES[i % DEATH_TYPES.length],
  deathDate: faker.date.past({ years: 5 }).toISOString().split('T')[0],
  deathPlace: faker.location.city(),
  deathCause: faker.lorem.sentence(),
  burialPlace: faker.location.city() + ' 국립묘지',
  familyContact: faker.phone.number(),
  remarks: '',
  militaryType: MILITARY_TYPES[i % MILITARY_TYPES.length],
}))

let injuredList: Injured[] = Array.from({ length: 20 }, (_, i) => ({
  id: `injured-${i + 1}`,
  serviceNumber: `M-${faker.string.numeric(8)}`,
  name: faker.person.lastName() + faker.person.firstName(),
  residentNumber: faker.string.numeric(6) + '-*******',
  rank: RANKS[i % RANKS.length],
  unit: UNITS[i % UNITS.length],
  enlistDate: faker.date.past({ years: 10 }).toISOString().split('T')[0],
  phone: faker.phone.number(),
  address: faker.location.streetAddress(),
  injuryType: INJURY_TYPES[i % INJURY_TYPES.length],
  injuryGrade: INJURY_GRADES[i % INJURY_GRADES.length],
  injuryDate: faker.date.past({ years: 5 }).toISOString().split('T')[0],
  injuryPlace: faker.location.city(),
  injuryCause: faker.lorem.sentence(),
  hospitalName: faker.company.name() + ' 병원',
  remarks: '',
  militaryType: MILITARY_TYPES[i % MILITARY_TYPES.length],
}))

let reviewList: CombatReview[] = Array.from({ length: 15 }, (_, i) => ({
  id: `review-${i + 1}`,
  reviewRound: `제${i + 1}차`,
  reviewDate: faker.date.past({ years: 3 }).toISOString().split('T')[0],
  name: faker.person.lastName() + faker.person.firstName(),
  serviceNumber: `M-${faker.string.numeric(8)}`,
  birthDate: faker.string.numeric(6) + '-*******',
  enlistDate: faker.date.past({ years: 8 }).toISOString().split('T')[0],
  rank: RANKS[i % RANKS.length],
  unit: UNITS[i % UNITS.length],
  incidentType: INCIDENT_TYPES[i % INCIDENT_TYPES.length],
  incidentDate: faker.date.past({ years: 4 }).toISOString().split('T')[0],
  incidentCause: faker.lorem.sentence(),
  result: (i % 3 === 0 ? 'ineligible' : 'eligible') as ReviewResult,
  resultDetail: faker.lorem.sentence(),
  remarks: '',
}))

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

export const sys09Handlers = [
  // 사망자 목록
  http.get('/api/sys09/deceased', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    const militaryType = url.searchParams.get('militaryType') || ''
    const serviceNumber = url.searchParams.get('serviceNumber') || ''
    const name = url.searchParams.get('name') || ''
    const rank = url.searchParams.get('rank') || ''
    const unit = url.searchParams.get('unit') || ''

    let filtered = [...deceasedList]
    if (militaryType) filtered = filtered.filter((d) => d.militaryType === militaryType)
    if (serviceNumber) filtered = filtered.filter((d) => d.serviceNumber.includes(serviceNumber))
    if (name) filtered = filtered.filter((d) => d.name.includes(name))
    if (rank) filtered = filtered.filter((d) => d.rank === rank)
    if (unit) filtered = filtered.filter((d) => d.unit === unit)

    const result: ApiResult<PageResponse<Deceased>> = {
      success: true,
      data: paginate(filtered, page, size),
    }
    return HttpResponse.json(result)
  }),

  // 사망자 상세
  http.get('/api/sys09/deceased/:id', ({ params }) => {
    const item = deceasedList.find((d) => d.id === params.id)
    if (!item) return HttpResponse.json({ success: false, message: '데이터를 찾을 수 없습니다' }, { status: 404 })
    const result: ApiResult<Deceased> = { success: true, data: item }
    return HttpResponse.json(result)
  }),

  // 사망자 등록
  http.post('/api/sys09/deceased', async ({ request }) => {
    const body = (await request.json()) as Partial<Deceased>
    const newItem: Deceased = {
      id: `deceased-${Date.now()}`,
      serviceNumber: body.serviceNumber || '',
      name: body.name || '',
      residentNumber: body.residentNumber || '',
      rank: body.rank || '',
      unit: body.unit || '',
      enlistDate: body.enlistDate || '',
      phone: body.phone || '',
      deathType: (body.deathType as DeathType) || 'duty',
      deathDate: body.deathDate || '',
      deathPlace: body.deathPlace || '',
      deathCause: body.deathCause || '',
      burialPlace: body.burialPlace || '',
      familyContact: body.familyContact || '',
      remarks: body.remarks || '',
      militaryType: body.militaryType || '해병',
    }
    deceasedList = [newItem, ...deceasedList]
    const result: ApiResult<Deceased> = { success: true, data: newItem }
    return HttpResponse.json(result)
  }),

  // 사망자 수정
  http.put('/api/sys09/deceased/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<Deceased>
    const index = deceasedList.findIndex((d) => d.id === params.id)
    if (index === -1) return HttpResponse.json({ success: false, message: '데이터를 찾을 수 없습니다' }, { status: 404 })
    deceasedList[index] = { ...deceasedList[index], ...body }
    const result: ApiResult<Deceased> = { success: true, data: deceasedList[index] }
    return HttpResponse.json(result)
  }),

  // 사망자 삭제
  http.delete('/api/sys09/deceased/:id', ({ params }) => {
    const index = deceasedList.findIndex((d) => d.id === params.id)
    if (index !== -1) deceasedList.splice(index, 1)
    const result: ApiResult<null> = { success: true, data: null }
    return HttpResponse.json(result)
  }),

  // 상이자 목록
  http.get('/api/sys09/injured', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    const militaryType = url.searchParams.get('militaryType') || ''
    const serviceNumber = url.searchParams.get('serviceNumber') || ''
    const name = url.searchParams.get('name') || ''
    const rank = url.searchParams.get('rank') || ''
    const unit = url.searchParams.get('unit') || ''

    let filtered = [...injuredList]
    if (militaryType) filtered = filtered.filter((d) => d.militaryType === militaryType)
    if (serviceNumber) filtered = filtered.filter((d) => d.serviceNumber.includes(serviceNumber))
    if (name) filtered = filtered.filter((d) => d.name.includes(name))
    if (rank) filtered = filtered.filter((d) => d.rank === rank)
    if (unit) filtered = filtered.filter((d) => d.unit === unit)

    const result: ApiResult<PageResponse<Injured>> = {
      success: true,
      data: paginate(filtered, page, size),
    }
    return HttpResponse.json(result)
  }),

  // 상이자 상세
  http.get('/api/sys09/injured/:id', ({ params }) => {
    const item = injuredList.find((d) => d.id === params.id)
    if (!item) return HttpResponse.json({ success: false, message: '데이터를 찾을 수 없습니다' }, { status: 404 })
    const result: ApiResult<Injured> = { success: true, data: item }
    return HttpResponse.json(result)
  }),

  // 상이자 등록
  http.post('/api/sys09/injured', async ({ request }) => {
    const body = (await request.json()) as Partial<Injured>
    const newItem: Injured = {
      id: `injured-${Date.now()}`,
      serviceNumber: body.serviceNumber || '',
      name: body.name || '',
      residentNumber: body.residentNumber || '',
      rank: body.rank || '',
      unit: body.unit || '',
      enlistDate: body.enlistDate || '',
      phone: body.phone || '',
      address: body.address || '',
      injuryType: (body.injuryType as InjuryType) || 'duty',
      injuryGrade: body.injuryGrade || '1급',
      injuryDate: body.injuryDate || '',
      injuryPlace: body.injuryPlace || '',
      injuryCause: body.injuryCause || '',
      hospitalName: body.hospitalName || '',
      remarks: body.remarks || '',
      militaryType: body.militaryType || '해병',
    }
    injuredList = [newItem, ...injuredList]
    const result: ApiResult<Injured> = { success: true, data: newItem }
    return HttpResponse.json(result)
  }),

  // 상이자 수정
  http.put('/api/sys09/injured/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<Injured>
    const index = injuredList.findIndex((d) => d.id === params.id)
    if (index === -1) return HttpResponse.json({ success: false, message: '데이터를 찾을 수 없습니다' }, { status: 404 })
    injuredList[index] = { ...injuredList[index], ...body }
    const result: ApiResult<Injured> = { success: true, data: injuredList[index] }
    return HttpResponse.json(result)
  }),

  // 상이자 삭제
  http.delete('/api/sys09/injured/:id', ({ params }) => {
    const index = injuredList.findIndex((d) => d.id === params.id)
    if (index !== -1) injuredList.splice(index, 1)
    const result: ApiResult<null> = { success: true, data: null }
    return HttpResponse.json(result)
  }),

  // 심사 목록
  http.get('/api/sys09/reviews', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    const name = url.searchParams.get('name') || ''
    const serviceNumber = url.searchParams.get('serviceNumber') || ''
    const rank = url.searchParams.get('rank') || ''
    const unit = url.searchParams.get('unit') || ''

    let filtered = [...reviewList]
    if (name) filtered = filtered.filter((d) => d.name.includes(name))
    if (serviceNumber) filtered = filtered.filter((d) => d.serviceNumber.includes(serviceNumber))
    if (rank) filtered = filtered.filter((d) => d.rank === rank)
    if (unit) filtered = filtered.filter((d) => d.unit === unit)

    const result: ApiResult<PageResponse<CombatReview>> = {
      success: true,
      data: paginate(filtered, page, size),
    }
    return HttpResponse.json(result)
  }),

  // 심사 상세
  http.get('/api/sys09/reviews/:id', ({ params }) => {
    const item = reviewList.find((d) => d.id === params.id)
    if (!item) return HttpResponse.json({ success: false, message: '데이터를 찾을 수 없습니다' }, { status: 404 })
    const result: ApiResult<CombatReview> = { success: true, data: item }
    return HttpResponse.json(result)
  }),

  // 심사 등록
  http.post('/api/sys09/reviews', async ({ request }) => {
    const body = (await request.json()) as Partial<CombatReview>
    const newItem: CombatReview = {
      id: `review-${Date.now()}`,
      reviewRound: body.reviewRound || '제1차',
      reviewDate: body.reviewDate || '',
      name: body.name || '',
      serviceNumber: body.serviceNumber || '',
      birthDate: body.birthDate || '',
      enlistDate: body.enlistDate || '',
      rank: body.rank || '',
      unit: body.unit || '',
      incidentType: body.incidentType || '순직',
      incidentDate: body.incidentDate || '',
      incidentCause: body.incidentCause || '',
      result: (body.result as ReviewResult) || 'eligible',
      resultDetail: body.resultDetail || '',
      remarks: body.remarks || '',
    }
    reviewList = [newItem, ...reviewList]
    const result: ApiResult<CombatReview> = { success: true, data: newItem }
    return HttpResponse.json(result)
  }),

  // 심사 수정
  http.put('/api/sys09/reviews/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<CombatReview>
    const index = reviewList.findIndex((d) => d.id === params.id)
    if (index === -1) return HttpResponse.json({ success: false, message: '데이터를 찾을 수 없습니다' }, { status: 404 })
    reviewList[index] = { ...reviewList[index], ...body }
    const result: ApiResult<CombatReview> = { success: true, data: reviewList[index] }
    return HttpResponse.json(result)
  }),

  // 심사 삭제
  http.delete('/api/sys09/reviews/:id', ({ params }) => {
    const index = reviewList.findIndex((d) => d.id === params.id)
    if (index !== -1) reviewList.splice(index, 1)
    const result: ApiResult<null> = { success: true, data: null }
    return HttpResponse.json(result)
  }),

  // 부대별 사망자 현황 통계
  http.get('/api/sys09/stats/unit', () => {
    const stats = UNITS.map((unit) => {
      const unitDeceased = deceasedList.filter((d) => d.unit === unit)
      return {
        unit,
        combat: unitDeceased.filter((d) => d.deathType === 'combat').length,
        duty: unitDeceased.filter((d) => d.deathType === 'duty').length,
        disease: unitDeceased.filter((d) => d.deathType === 'disease').length,
        accident: unitDeceased.filter((d) => d.deathType === 'accident').length,
        total: unitDeceased.length,
      }
    })
    const result: ApiResult<typeof stats> = { success: true, data: stats }
    return HttpResponse.json(result)
  }),

  // 부대별 사망자 명부
  http.get('/api/sys09/stats/unit-list', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    const result: ApiResult<PageResponse<Deceased>> = {
      success: true,
      data: paginate(deceasedList, page, size),
    }
    return HttpResponse.json(result)
  }),

  // 신분별 사망자 현황 통계
  http.get('/api/sys09/stats/type', () => {
    const types = ['장교', '부사관', '병사', '군무원']
    const stats = types.map((type) => {
      const total = Math.floor(Math.random() * 10) + 1
      return {
        type,
        combat: Math.floor(total * 0.3),
        duty: Math.floor(total * 0.4),
        disease: Math.floor(total * 0.2),
        accident: Math.floor(total * 0.1),
        total,
        value: total,
      }
    })
    const result: ApiResult<typeof stats> = { success: true, data: stats }
    return HttpResponse.json(result)
  }),

  // 연도별 사망자 현황 통계
  http.get('/api/sys09/stats/year', () => {
    const currentYear = new Date().getFullYear()
    const stats = Array.from({ length: 5 }, (_, i) => {
      const year = String(currentYear - 4 + i)
      const total = Math.floor(Math.random() * 8) + 1
      return {
        year,
        combat: Math.floor(total * 0.2),
        duty: Math.floor(total * 0.4),
        disease: Math.floor(total * 0.3),
        accident: Math.floor(total * 0.1),
        total,
      }
    })
    const result: ApiResult<typeof stats> = { success: true, data: stats }
    return HttpResponse.json(result)
  }),

  // 월별 사망자 현황 통계
  http.get('/api/sys09/stats/month', () => {
    const currentYear = new Date().getFullYear()
    const stats = Array.from({ length: 3 }, (_, i) => {
      const year = String(currentYear - 2 + i)
      const row: Record<string, unknown> = { year }
      let total = 0
      for (let m = 1; m <= 12; m++) {
        const count = Math.floor(Math.random() * 3)
        row[`m${m}`] = count
        total += count
      }
      row.total = total
      return row
    })
    const result: ApiResult<typeof stats> = { success: true, data: stats }
    return HttpResponse.json(result)
  }),

  // 전사망자 명부
  http.get('/api/sys09/stats/all-list', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    const result: ApiResult<PageResponse<Deceased>> = {
      success: true,
      data: paginate(deceasedList, page, size),
    }
    return HttpResponse.json(result)
  }),

  // 사망자 현황 보고서
  http.get('/api/sys09/reports/deceased', () => {
    const stats = UNITS.map((unit) => {
      const unitDeceased = deceasedList.filter((d) => d.unit === unit)
      return {
        unit,
        combat: unitDeceased.filter((d) => d.deathType === 'combat').length,
        duty: unitDeceased.filter((d) => d.deathType === 'duty').length,
        disease: unitDeceased.filter((d) => d.deathType === 'disease').length,
        accident: unitDeceased.filter((d) => d.deathType === 'accident').length,
        total: unitDeceased.length,
      }
    })
    const result: ApiResult<typeof stats> = { success: true, data: stats }
    return HttpResponse.json(result)
  }),

  // 상이자 현황 보고서
  http.get('/api/sys09/reports/injured', () => {
    const stats = UNITS.map((unit) => {
      const unitInjured = injuredList.filter((d) => d.unit === unit)
      return {
        unit,
        combat: unitInjured.filter((d) => d.injuryType === 'combat').length,
        duty: unitInjured.filter((d) => d.injuryType === 'duty').length,
        total: unitInjured.length,
      }
    })
    const result: ApiResult<typeof stats> = { success: true, data: stats }
    return HttpResponse.json(result)
  }),

  // 순직/사망확인서
  http.get('/api/sys09/reports/death-cert/:id', ({ params }) => {
    const item = deceasedList.find((d) => d.id === params.id) || deceasedList[0]
    const result: ApiResult<Deceased> = { success: true, data: item }
    return HttpResponse.json(result)
  }),

  // 국가유공자 확인서(사망자)
  http.get('/api/sys09/reports/merit-death/:id', ({ params }) => {
    const item = deceasedList.find((d) => d.id === params.id) || deceasedList[0]
    const result: ApiResult<Deceased> = { success: true, data: item }
    return HttpResponse.json(result)
  }),

  // 국가유공자 확인서(상이자)
  http.get('/api/sys09/reports/merit-injured/:id', ({ params }) => {
    const item = injuredList.find((d) => d.id === params.id) || injuredList[0]
    const result: ApiResult<Injured> = { success: true, data: item }
    return HttpResponse.json(result)
  }),

  // 전공사상심사결과
  http.get('/api/sys09/reports/review-result/:id', ({ params }) => {
    const item = reviewList.find((d) => d.id === params.id) || reviewList[0]
    const result: ApiResult<CombatReview> = { success: true, data: item }
    return HttpResponse.json(result)
  }),

  // 전사망자 확인증 발급대장
  http.get('/api/sys09/reports/issue-ledger', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    const ledgerItems = deceasedList.map((d, i) => ({
      id: `ledger-${i + 1}`,
      issueDate: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
      serviceNumber: d.serviceNumber,
      name: d.name,
      rank: d.rank,
      unit: d.unit,
      purpose: faker.helpers.arrayElement(['취업용', '보험 청구용', '민원 제출용']),
      recipient: faker.person.lastName() + faker.person.firstName(),
    }))
    const result: ApiResult<PageResponse<typeof ledgerItems[0]>> = {
      success: true,
      data: paginate(ledgerItems, page, size),
    }
    return HttpResponse.json(result)
  }),
]
