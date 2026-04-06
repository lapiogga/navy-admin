import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker/locale/ko'
import type { ApiResult, PageResponse } from '@/shared/api/types'

// 타입 정의
export type CertStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn'

export interface CertApplication extends Record<string, unknown> {
  id: string
  applicantName: string
  applicantUnit: string
  certType: string
  requestType: string
  purpose: string
  reason: string
  militaryId: string
  email: string
  phone: string
  status: CertStatus
  ndscaStatus: 'pending' | 'approved' | 'rejected'
  rejectReason?: string
  appliedAt: string
  processedAt?: string
}

const CERT_TYPES = ['재직증명서', '경력증명서', '복무증명서']
const UNITS = ['1사단', '2사단', '해병대사령부']
const STATUSES: CertStatus[] = ['pending', 'approved', 'rejected']
const REQUEST_TYPES = ['신규발급', '재발급', '갱신']
const NDSCA_STATUSES: Array<'pending' | 'approved' | 'rejected'> = ['pending', 'approved', 'rejected']

// Mock 데이터 20건
let applications: CertApplication[] = Array.from({ length: 20 }, (_, i) => ({
  id: `cert-${i + 1}`,
  applicantName: faker.person.lastName() + faker.person.firstName(),
  applicantUnit: UNITS[i % UNITS.length],
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
  militaryId: 'M-' + faker.string.numeric(8),
  email: faker.internet.email(),
  phone: faker.phone.number(),
  status: STATUSES[i % STATUSES.length],
  ndscaStatus: faker.helpers.arrayElement(NDSCA_STATUSES),
  appliedAt: faker.date.recent({ days: 60 }).toISOString().split('T')[0],
  processedAt:
    STATUSES[i % STATUSES.length] !== 'pending'
      ? faker.date.recent({ days: 30 }).toISOString().split('T')[0]
      : undefined,
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

export const sys04Handlers = [
  // 인증서 신청 목록 (페이지네이션 + status 필터)
  http.get('/api/sys04/certificates', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    const status = url.searchParams.get('status') || ''

    let filtered = [...applications]
    if (status) {
      filtered = filtered.filter((item) => item.status === status)
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
    const newItem: CertApplication = {
      id: `cert-${Date.now()}`,
      applicantName: '홍길동',
      applicantUnit: '해병대사령부',
      certType: body.certType || '재직증명서',
      requestType: body.requestType || '신규발급',
      purpose: body.purpose || '',
      reason: body.reason || '',
      militaryId: body.militaryId || 'M-20250001',
      email: body.email || '',
      phone: body.phone || '',
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
