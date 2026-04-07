import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker/locale/ko'
import { randomServiceNumber } from '../mockServiceNumber'
import { MAIN_UNITS } from '../mockUnits'
import type { ApiResult, PageResponse } from '@/shared/api/types'

// 타입 정의
export type CertStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn'

export interface CertApplication extends Record<string, unknown> {
  id: string
  applicantName: string
  applicantUnit: string
  serviceNumber: string
  rank: string
  organization: string
  certType: string
  requestType: string
  purpose: string
  reason: string
  militaryId: string
  email: string
  phone: string
  agreeToUse: boolean
  status: CertStatus
  ndscaStatus: 'pending' | 'approved' | 'rejected'
  rejectReason?: string
  approverName?: string
  approverRank?: string
  approverServiceNumber?: string
  appliedAt: string
  processedAt?: string
}

const CERT_TYPES = ['재직증명서', '경력증명서', '복무증명서']
const UNITS = MAIN_UNITS
const ORGANIZATIONS = ['해병대사령부', '1사단사령부', '2사단사령부', '교육훈련단', '군수단']
const RANKS = ['이병', '일병', '상병', '병장', '하사', '중사', '상사', '원사', '준위', '소위', '중위', '대위', '소령', '중령', '대령']
const STATUSES: CertStatus[] = ['pending', 'approved', 'rejected']
const REQUEST_TYPES = ['신규발급', '재발급', '갱신']
const NDSCA_STATUSES: Array<'pending' | 'approved' | 'rejected'> = ['pending', 'approved', 'rejected']

// Mock 데이터 20건
let applications: CertApplication[] = Array.from({ length: 20 }, (_, i) => {
  const status = STATUSES[i % STATUSES.length]
  const serviceNumber = randomServiceNumber()
  return {
    id: `cert-${i + 1}`,
    applicantName: faker.person.lastName() + faker.person.firstName(),
    applicantUnit: UNITS[i % UNITS.length],
    serviceNumber,
    rank: faker.helpers.arrayElement(RANKS),
    organization: faker.helpers.arrayElement(ORGANIZATIONS),
    certType: CERT_TYPES[i % CERT_TYPES.length],
    requestType: faker.helpers.arrayElement(REQUEST_TYPES),
    purpose: faker.helpers.arrayElement([
      '취업용',
      '금융기관 제출용',
      '관공서 제출용',
      '학원 등록용',
      '보험사 제출용',
    ]),
    reason: faker.lorem.sentence(),
    militaryId: serviceNumber,
    email: faker.internet.email(),
    phone: faker.phone.number(),
    agreeToUse: true,
    status,
    ndscaStatus: faker.helpers.arrayElement(NDSCA_STATUSES),
    approverName: status !== 'pending' ? faker.person.lastName() + faker.person.firstName() : undefined,
    approverRank: status !== 'pending' ? faker.helpers.arrayElement(RANKS) : undefined,
    approverServiceNumber: status !== 'pending' ? randomServiceNumber() : undefined,
    appliedAt: faker.date.recent({ days: 60 }).toISOString().split('T')[0],
    processedAt: status !== 'pending'
      ? faker.date.recent({ days: 30 }).toISOString().split('T')[0]
      : undefined,
  }
})

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

export const sys04Handlers = [
  // 인증서 신청 목록 (페이지네이션 + 다중 필터)
  http.get('/api/sys04/certificates', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    const status = url.searchParams.get('status') || ''
    const certType = url.searchParams.get('certType') || ''
    const requestType = url.searchParams.get('requestType') || ''

    let filtered = [...applications]
    if (status) {
      filtered = filtered.filter((item) => item.status === status)
    }
    if (certType) {
      filtered = filtered.filter((item) => item.certType === certType)
    }
    if (requestType) {
      filtered = filtered.filter((item) => item.requestType === requestType)
    }

    const result: ApiResult<PageResponse<CertApplication>> = {
      success: true,
      data: paginate(filtered, page, size),
    }
    return HttpResponse.json(result)
  }),

  // 인증서 신청 등록
  http.post('/api/sys04/certificates', async ({ request }) => {
    const body = (await request.json()) as Partial<CertApplication>
    const sn = body.serviceNumber || randomServiceNumber()
    const newItem: CertApplication = {
      id: `cert-${Date.now()}`,
      applicantName: body.applicantName || '홍길동',
      applicantUnit: body.applicantUnit || '해병대사령부',
      serviceNumber: sn,
      rank: body.rank || '대위',
      organization: body.organization || '해병대사령부',
      certType: body.certType || '재직증명서',
      requestType: body.requestType || '신규발급',
      purpose: body.purpose || '',
      reason: body.reason || '',
      militaryId: sn,
      email: body.email || '',
      phone: body.phone || '',
      agreeToUse: true,
      status: 'pending',
      ndscaStatus: 'pending',
      appliedAt: new Date().toISOString().split('T')[0],
    }
    applications = [newItem, ...applications]
    const result: ApiResult<CertApplication> = { success: true, data: newItem }
    return HttpResponse.json(result)
  }),

  // 인증서 신청 수정
  http.put('/api/sys04/certificates/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<CertApplication>
    const index = applications.findIndex((a) => a.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ success: false, message: '신청서를 찾을 수 없습니다' }, { status: 404 })
    }
    applications[index] = { ...applications[index], ...body }
    const result: ApiResult<CertApplication> = { success: true, data: applications[index] }
    return HttpResponse.json(result)
  }),

  // 인증서 신청 삭제
  http.delete('/api/sys04/certificates/:id', ({ params }) => {
    const index = applications.findIndex((a) => a.id === params.id)
    if (index !== -1) {
      applications.splice(index, 1)
    }
    const result: ApiResult<null> = { success: true, data: null }
    return HttpResponse.json(result)
  }),

  // 인증서 승인
  http.patch('/api/sys04/certificates/:id/approve', ({ params }) => {
    const index = applications.findIndex((a) => a.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ success: false, message: '신청서를 찾을 수 없습니다' }, { status: 404 })
    }
    applications[index] = {
      ...applications[index],
      status: 'approved',
      processedAt: new Date().toISOString().split('T')[0],
    }
    const result: ApiResult<CertApplication> = { success: true, data: applications[index] }
    return HttpResponse.json(result)
  }),

  // 인증서 반려
  http.patch('/api/sys04/certificates/:id/reject', async ({ params, request }) => {
    const index = applications.findIndex((a) => a.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ success: false, message: '신청서를 찾을 수 없습니다' }, { status: 404 })
    }
    let rejectReason = ''
    try {
      const body = (await request.json()) as { rejectReason?: string }
      rejectReason = body.rejectReason || ''
    } catch {
      // body가 없을 수 있음
    }
    applications[index] = {
      ...applications[index],
      status: 'rejected',
      rejectReason,
      processedAt: new Date().toISOString().split('T')[0],
    }
    const result: ApiResult<CertApplication> = { success: true, data: applications[index] }
    return HttpResponse.json(result)
  }),

  // 인증서 회수
  http.patch('/api/sys04/certificates/:id/withdraw', ({ params }) => {
    const index = applications.findIndex((a) => a.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ success: false, message: '신청서를 찾을 수 없습니다' }, { status: 404 })
    }
    applications[index] = {
      ...applications[index],
      status: 'withdrawn',
    }
    const result: ApiResult<CertApplication> = { success: true, data: applications[index] }
    return HttpResponse.json(result)
  }),
]
