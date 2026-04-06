import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker/locale/ko'
import type { ApiResult, PageResponse } from '@/shared/api/types'

// 타입 정의
export type OtStatus = 'draft' | 'pending' | 'approved' | 'rejected'
export type ClosingStatus = 'draft' | 'closed'
export type AbsenceType = '휴가' | '휴직' | '출장' | '파견'
export type OtRequestType = '사전' | '사후'

export interface OtRequest extends Record<string, unknown> {
  id: string
  requestType: OtRequestType
  workDate: string
  startTime: string
  endTime: string
  totalHours: number
  reason: string
  status: OtStatus
  applicantName: string
  applicantUnit: string
  createdAt: string
}

export interface OtApproval extends Record<string, unknown> {
  id: string
  requestId: string
  requestType: OtRequestType
  workDate: string
  totalHours: number
  applicantName: string
  applicantUnit: string
  reason: string
  approvalStatus: OtStatus
  approvedAt?: string
  rejectReason?: string
}

export interface OtBulkRequest extends Record<string, unknown> {
  id: string
  workDate: string
  startTime: string
  endTime: string
  totalHours: number
  reason: string
  status: OtStatus
  applicantCount: number
  createdAt: string
  createdBy: string
}

export interface OtMonthlyClosing extends Record<string, unknown> {
  id: string
  year: number
  month: number
  status: ClosingStatus
  totalOtHours: number
  applicantCount: number
  closedAt?: string
  deadline?: string
  remarks: string
}

export interface OtMyStatus extends Record<string, unknown> {
  month: string
  hours: number
  approvedCount: number
}

export interface OtAbsence extends Record<string, unknown> {
  id: string
  absenceType: AbsenceType
  startDate: string
  endDate: string
  reason: string
  status: string
  applicantName: string
  applicantUnit: string
  createdAt: string
}

export interface OtUnitStatus extends Record<string, unknown> {
  id: string
  unitName: string
  month: string
  totalOtHours: number
  applicantCount: number
  approvedCount: number
  avgHours: number
}

export interface OtUnitPersonnel extends Record<string, unknown> {
  id: string
  name: string
  rank: string
  position: string
  unitName: string
  militaryId: string
  phone: string
  dutyPost: string
}

// 내부 DB
const UNITS = ['1함대', '2함대', '3함대', '해군사령부', '교육사령부', '군수사령부', '해병대사령부']
const RANKS = ['중위', '대위', '소령', '중령', '대령', '준위', '하사', '중사', '상사', '원사']
const POSITIONS = ['작전장교', '인사장교', '군수장교', '정보장교', '통신장교', '의무장교', '법무장교']

let otRequests: OtRequest[] = Array.from({ length: 30 }, () => ({
  id: faker.string.uuid(),
  requestType: faker.helpers.arrayElement(['사전', '사후'] as OtRequestType[]),
  workDate: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
  startTime: '18:00',
  endTime: '22:00',
  totalHours: faker.number.int({ min: 1, max: 4 }),
  reason: faker.helpers.arrayElement(['작전 준비', '행정 처리', '훈련 지원', '비상 대비', '업무 지원']),
  status: faker.helpers.arrayElement(['draft', 'pending', 'approved', 'rejected'] as OtStatus[]),
  applicantName: faker.person.lastName() + faker.person.firstName(),
  applicantUnit: faker.helpers.arrayElement(UNITS),
  createdAt: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
}))

let otApprovals: OtApproval[] = Array.from({ length: 20 }, () => ({
  id: faker.string.uuid(),
  requestId: faker.string.uuid(),
  requestType: faker.helpers.arrayElement(['사전', '사후'] as OtRequestType[]),
  workDate: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
  totalHours: faker.number.int({ min: 1, max: 4 }),
  applicantName: faker.person.lastName() + faker.person.firstName(),
  applicantUnit: faker.helpers.arrayElement(UNITS),
  reason: faker.helpers.arrayElement(['작전 준비', '행정 처리', '훈련 지원', '비상 대비']),
  approvalStatus: faker.helpers.arrayElement(['pending', 'approved', 'rejected'] as OtStatus[]),
  approvedAt: faker.date.recent({ days: 10 }).toISOString().split('T')[0],
}))

let otBulkRequests: OtBulkRequest[] = Array.from({ length: 10 }, () => ({
  id: faker.string.uuid(),
  workDate: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
  startTime: '18:00',
  endTime: '22:00',
  totalHours: faker.number.int({ min: 2, max: 4 }),
  reason: faker.helpers.arrayElement(['부대 작전', '행정 지원', '훈련 준비']),
  status: faker.helpers.arrayElement(['draft', 'pending', 'approved'] as OtStatus[]),
  applicantCount: faker.number.int({ min: 3, max: 20 }),
  createdAt: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
  createdBy: faker.person.lastName() + faker.person.firstName(),
}))

let otMonthlyClosings: OtMonthlyClosing[] = Array.from({ length: 12 }, (_, i) => ({
  id: faker.string.uuid(),
  year: 2026,
  month: i + 1,
  status: i < 3 ? 'closed' : 'draft' as ClosingStatus,
  totalOtHours: faker.number.int({ min: 100, max: 500 }),
  applicantCount: faker.number.int({ min: 10, max: 50 }),
  closedAt: i < 3 ? `2026-0${i + 1}-31` : undefined,
  deadline: `2026-${String(i + 1).padStart(2, '0')}-25`,
  remarks: '',
}))

let otAbsences: OtAbsence[] = Array.from({ length: 15 }, () => ({
  id: faker.string.uuid(),
  absenceType: faker.helpers.arrayElement(['휴가', '휴직', '출장', '파견'] as AbsenceType[]),
  startDate: faker.date.recent({ days: 60 }).toISOString().split('T')[0],
  endDate: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
  reason: faker.helpers.arrayElement(['연가 사용', '질병 치료', '교육 파견', '해외 출장', '특별 휴가']),
  status: faker.helpers.arrayElement(['approved', 'pending', 'rejected']),
  applicantName: faker.person.lastName() + faker.person.firstName(),
  applicantUnit: faker.helpers.arrayElement(UNITS),
  createdAt: faker.date.recent({ days: 60 }).toISOString().split('T')[0],
}))

const otUnitStatuses: OtUnitStatus[] = Array.from({ length: 20 }, () => ({
  id: faker.string.uuid(),
  unitName: faker.helpers.arrayElement(UNITS),
  month: `2026-${String(faker.number.int({ min: 1, max: 4 })).padStart(2, '0')}`,
  totalOtHours: faker.number.int({ min: 50, max: 300 }),
  applicantCount: faker.number.int({ min: 5, max: 30 }),
  approvedCount: faker.number.int({ min: 3, max: 25 }),
  avgHours: parseFloat(faker.number.float({ min: 1, max: 8, fractionDigits: 1 }).toString()),
}))

const otUnitPersonnel: OtUnitPersonnel[] = Array.from({ length: 25 }, () => ({
  id: faker.string.uuid(),
  name: faker.person.lastName() + faker.person.firstName(),
  rank: faker.helpers.arrayElement(RANKS),
  position: faker.helpers.arrayElement(POSITIONS),
  unitName: faker.helpers.arrayElement(UNITS),
  militaryId: faker.string.numeric(8),
  phone: `010-${faker.string.numeric(4)}-${faker.string.numeric(4)}`,
  dutyPost: faker.helpers.arrayElement(['제1당직실', '제2당직실', '본부 당직실', '지휘통제실']),
}))

function paged<T>(items: T[], page: number, size: number): PageResponse<T> {
  const start = page * size
  return {
    content: items.slice(start, start + size),
    totalElements: items.length,
    totalPages: Math.ceil(items.length / size),
    size,
    number: page,
  }
}

function ok<T>(data: T): HttpResponse {
  return HttpResponse.json({ success: true, data } as ApiResult<T>)
}

export const sys01Handlers = [
  // 신청서 CRUD
  http.get('/api/sys01/requests', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    return ok(paged(otRequests, page, size))
  }),
  http.post('/api/sys01/requests', async ({ request }) => {
    const body = await request.json() as Partial<OtRequest>
    const item: OtRequest = {
      id: faker.string.uuid(),
      requestType: body.requestType ?? '사전',
      workDate: body.workDate ?? '',
      startTime: body.startTime ?? '',
      endTime: body.endTime ?? '',
      totalHours: body.totalHours ?? 0,
      reason: body.reason ?? '',
      status: 'draft',
      applicantName: '홍길동',
      applicantUnit: '1함대',
      createdAt: new Date().toISOString().split('T')[0],
    }
    otRequests = [item, ...otRequests]
    return ok(item)
  }),
  http.put('/api/sys01/requests/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<OtRequest>
    otRequests = otRequests.map(r => r.id === params.id ? { ...r, ...body } : r)
    return ok(otRequests.find(r => r.id === params.id))
  }),
  http.delete('/api/sys01/requests/:id', ({ params }) => {
    otRequests = otRequests.filter(r => r.id !== params.id)
    return ok({ id: params.id })
  }),

  // 결재
  http.get('/api/sys01/approvals', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    return ok(paged(otApprovals, page, size))
  }),
  http.put('/api/sys01/approvals/:id/approve', async ({ params }) => {
    otApprovals = otApprovals.map(a => a.id === params.id ? { ...a, approvalStatus: 'approved' as OtStatus, approvedAt: new Date().toISOString().split('T')[0] } : a)
    return ok({ id: params.id })
  }),
  http.put('/api/sys01/approvals/:id/reject', async ({ params, request }) => {
    const body = await request.json() as { reason: string }
    otApprovals = otApprovals.map(a => a.id === params.id ? { ...a, approvalStatus: 'rejected' as OtStatus, rejectReason: body.reason } : a)
    return ok({ id: params.id })
  }),

  // 일괄처리 CRUD
  http.get('/api/sys01/bulk-requests', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    return ok(paged(otBulkRequests, page, size))
  }),
  http.post('/api/sys01/bulk-requests', async ({ request }) => {
    const body = await request.json() as Partial<OtBulkRequest>
    const item: OtBulkRequest = {
      id: faker.string.uuid(),
      workDate: body.workDate ?? '',
      startTime: body.startTime ?? '',
      endTime: body.endTime ?? '',
      totalHours: body.totalHours ?? 0,
      reason: body.reason ?? '',
      status: 'pending',
      applicantCount: body.applicantCount ?? 1,
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: '홍길동',
    }
    otBulkRequests = [item, ...otBulkRequests]
    return ok(item)
  }),
  http.put('/api/sys01/bulk-requests/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<OtBulkRequest>
    otBulkRequests = otBulkRequests.map(r => r.id === params.id ? { ...r, ...body } : r)
    return ok(otBulkRequests.find(r => r.id === params.id))
  }),
  http.delete('/api/sys01/bulk-requests/:id', ({ params }) => {
    otBulkRequests = otBulkRequests.filter(r => r.id !== params.id)
    return ok({ id: params.id })
  }),

  // 일괄처리 승인
  http.get('/api/sys01/bulk-approvals', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    const pending = otBulkRequests.filter(r => r.status === 'pending')
    return ok(paged(pending, page, size))
  }),
  http.put('/api/sys01/bulk-approvals/:id/approve', async ({ params }) => {
    otBulkRequests = otBulkRequests.map(r => r.id === params.id ? { ...r, status: 'approved' as OtStatus } : r)
    return ok({ id: params.id })
  }),
  http.put('/api/sys01/bulk-approvals/:id/reject', async ({ params, request }) => {
    const body = await request.json() as { reason: string }
    otBulkRequests = otBulkRequests.map(r => r.id === params.id ? { ...r, status: 'rejected' as OtStatus, rejectReason: body.reason } : r)
    return ok({ id: params.id })
  }),

  // 월말결산 CRUD
  http.get('/api/sys01/monthly-closing', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 12)
    return ok(paged(otMonthlyClosings, page, size))
  }),
  http.post('/api/sys01/monthly-closing', async ({ request }) => {
    const body = await request.json() as Partial<OtMonthlyClosing>
    const item: OtMonthlyClosing = {
      id: faker.string.uuid(),
      year: body.year ?? 2026,
      month: body.month ?? 1,
      status: 'draft',
      totalOtHours: 0,
      applicantCount: 0,
      remarks: body.remarks ?? '',
    }
    otMonthlyClosings = [item, ...otMonthlyClosings]
    return ok(item)
  }),
  http.put('/api/sys01/monthly-closing/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<OtMonthlyClosing>
    otMonthlyClosings = otMonthlyClosings.map(r => r.id === params.id ? { ...r, ...body } : r)
    return ok(otMonthlyClosings.find(r => r.id === params.id))
  }),
  http.delete('/api/sys01/monthly-closing/:id', ({ params }) => {
    otMonthlyClosings = otMonthlyClosings.filter(r => r.id !== params.id)
    return ok({ id: params.id })
  }),
  http.put('/api/sys01/monthly-closing/:id/close', ({ params }) => {
    otMonthlyClosings = otMonthlyClosings.map(r =>
      r.id === params.id ? { ...r, status: 'closed' as ClosingStatus, closedAt: new Date().toISOString().split('T')[0] } : r
    )
    return ok({ id: params.id })
  }),
  http.put('/api/sys01/monthly-closing/:id/cancel-close', ({ params }) => {
    otMonthlyClosings = otMonthlyClosings.map(r =>
      r.id === params.id ? { ...r, status: 'draft' as ClosingStatus, closedAt: undefined } : r
    )
    return ok({ id: params.id })
  }),
  http.get('/api/sys01/monthly-closing/deadline', () => {
    return ok({ deadline: '2026-04-25' })
  }),

  // 나의 근무현황
  http.get('/api/sys01/my-status', () => {
    const data: OtMyStatus[] = Array.from({ length: 12 }, (_, i) => ({
      month: `${i + 1}월`,
      hours: faker.number.float({ min: 5, max: 40, fractionDigits: 1 }),
      approvedCount: faker.number.int({ min: 1, max: 10 }),
    }))
    return ok(data)
  }),

  // 부재관리 CRUD
  http.get('/api/sys01/absences', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    return ok(paged(otAbsences, page, size))
  }),
  http.post('/api/sys01/absences', async ({ request }) => {
    const body = await request.json() as Partial<OtAbsence>
    const item: OtAbsence = {
      id: faker.string.uuid(),
      absenceType: body.absenceType ?? '휴가',
      startDate: body.startDate ?? '',
      endDate: body.endDate ?? '',
      reason: body.reason ?? '',
      status: 'pending',
      applicantName: '홍길동',
      applicantUnit: '1함대',
      createdAt: new Date().toISOString().split('T')[0],
    }
    otAbsences = [item, ...otAbsences]
    return ok(item)
  }),
  http.put('/api/sys01/absences/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<OtAbsence>
    otAbsences = otAbsences.map(r => r.id === params.id ? { ...r, ...body } : r)
    return ok(otAbsences.find(r => r.id === params.id))
  }),
  http.delete('/api/sys01/absences/:id', ({ params }) => {
    otAbsences = otAbsences.filter(r => r.id !== params.id)
    return ok({ id: params.id })
  }),

  // 부대 근무현황
  http.get('/api/sys01/unit-status', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    return ok(paged(otUnitStatuses, page, size))
  }),

  // 부대 근무통계 (차트용)
  http.get('/api/sys01/unit-stats', () => {
    const data = UNITS.map(unit => ({
      unit,
      jan: faker.number.int({ min: 50, max: 300 }),
      feb: faker.number.int({ min: 50, max: 300 }),
      mar: faker.number.int({ min: 50, max: 300 }),
      apr: faker.number.int({ min: 50, max: 300 }),
    }))
    return ok(data)
  }),

  // 부대 부재현황
  http.get('/api/sys01/unit-absence', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    return ok(paged(otAbsences, page, size))
  }),

  // 월말결산 현황
  http.get('/api/sys01/monthly-status', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 12)
    return ok(paged(otMonthlyClosings, page, size))
  }),

  // 자료출력
  http.get('/api/sys01/export', () => {
    return ok({ message: '자료 출력이 완료되었습니다' })
  }),

  // 부대인원 조회
  http.get('/api/sys01/unit-personnel', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    return ok(paged(otUnitPersonnel, page, size))
  }),

  // Plan 03용 핸들러
  http.get('/api/sys01/max-hours', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    const items = Array.from({ length: 12 }, (_, i) => ({
      id: faker.string.uuid(),
      year: 2026,
      month: i + 1,
      maxHours: faker.number.int({ min: 30, max: 57 }),
      exceptionHours: faker.number.int({ min: 0, max: 10 }),
    }))
    return ok(paged(items, page, size))
  }),
  http.get('/api/sys01/work-hours', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    const items = Array.from({ length: 30 }, () => ({
      id: faker.string.uuid(),
      workDate: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '18:00',
      workHours: 8,
      unitName: faker.helpers.arrayElement(UNITS),
    }))
    return ok(paged(items, page, size))
  }),
  http.get('/api/sys01/holidays', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 20)
    const items = [
      { id: '1', date: '2026-01-01', name: '신정', type: '공휴일' },
      { id: '2', date: '2026-02-16', name: '설날', type: '명절' },
      { id: '3', date: '2026-03-01', name: '삼일절', type: '공휴일' },
      { id: '4', date: '2026-05-05', name: '어린이날', type: '공휴일' },
      { id: '5', date: '2026-06-06', name: '현충일', type: '공휴일' },
      { id: '6', date: '2026-08-15', name: '광복절', type: '공휴일' },
      { id: '7', date: '2026-10-01', name: '추석', type: '명절' },
      { id: '8', date: '2026-10-03', name: '개천절', type: '공휴일' },
      { id: '9', date: '2026-10-09', name: '한글날', type: '공휴일' },
      { id: '10', date: '2026-12-25', name: '성탄절', type: '공휴일' },
    ]
    return ok(paged(items, page, size))
  }),
  http.get('/api/sys01/approval-lines', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    const items = Array.from({ length: 5 }, () => ({
      id: faker.string.uuid(),
      lineName: faker.helpers.arrayElement(['기본결재선', '긴급결재선', '부대결재선']),
      step1: faker.person.lastName() + faker.person.firstName(),
      step2: faker.person.lastName() + faker.person.firstName(),
      unitName: faker.helpers.arrayElement(UNITS),
      isDefault: faker.datatype.boolean(),
    }))
    return ok(paged(items, page, size))
  }),
  http.get('/api/sys01/duty-workers', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    const items = Array.from({ length: 20 }, () => ({
      id: faker.string.uuid(),
      name: faker.person.lastName() + faker.person.firstName(),
      rank: faker.helpers.arrayElement(RANKS),
      unitName: faker.helpers.arrayElement(UNITS),
      dutyDate: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
      dutyPost: faker.helpers.arrayElement(['제1당직실', '제2당직실', '본부 당직실']),
      status: faker.helpers.arrayElement(['근무중', '교대완료']),
    }))
    return ok(paged(items, page, size))
  }),
  http.get('/api/sys01/duty-posts', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    const items = Array.from({ length: 10 }, () => ({
      id: faker.string.uuid(),
      postName: faker.helpers.arrayElement(['제1당직실', '제2당직실', '본부 당직실', '지휘통제실']),
      postId: faker.string.alphanumeric(6).toUpperCase(),
      macAddress: faker.internet.mac(),
      unitNames: [faker.helpers.arrayElement(UNITS)],
      isActive: faker.datatype.boolean(),
    }))
    return ok(paged(items, page, size))
  }),
  http.get('/api/sys01/personal-duty-post', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    const items = Array.from({ length: 8 }, () => ({
      id: faker.string.uuid(),
      applicantName: faker.person.lastName() + faker.person.firstName(),
      requestedPost: faker.helpers.arrayElement(['제1당직실', '제2당직실', '본부 당직실']),
      reason: '근무지 변경 요청',
      status: faker.helpers.arrayElement(['pending', 'approved', 'rejected']),
      createdAt: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
    }))
    return ok(paged(items, page, size))
  }),
  http.get('/api/sys01/personal-dept', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    const items = Array.from({ length: 8 }, () => ({
      id: faker.string.uuid(),
      applicantName: faker.person.lastName() + faker.person.firstName(),
      fromDept: faker.helpers.arrayElement(['작전부서', '인사부서', '군수부서']),
      toDept: faker.helpers.arrayElement(['정보부서', '통신부서', '의무부서']),
      reason: '부서 이동 신청',
      status: faker.helpers.arrayElement(['pending', 'approved', 'rejected']),
      createdAt: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
    }))
    return ok(paged(items, page, size))
  }),
  http.get('/api/sys01/personal-settings', () => {
    return ok({
      approvalDept: '작전부서',
      approver: '김철수 소령',
      dutyPost: '제1당직실',
      unitName: '1함대',
    })
  }),
]
