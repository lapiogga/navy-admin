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

// ─── 당직 관련 타입 정의 ───
export interface DutyWorker extends Record<string, unknown> {
  id: string
  name: string
  rank: string
  unitName: string
  dutyDate: string
  dutyPost: string
  dutyType: string
  startTime: string
  endTime: string
  status: string
  remarks: string
}

export interface DutyPost extends Record<string, unknown> {
  id: string
  postName: string
  postId: string
  location: string
  macAddress: string
  unitNames: string[]
  capacity: number
  isActive: boolean
  createdAt: string
}

export interface DutyPostChange extends Record<string, unknown> {
  id: string
  workerName: string
  workerRank: string
  unitName: string
  fromPost: string
  toPost: string
  changeDate: string
  reason: string
  status: string
  approvedBy?: string
  approvedAt?: string
  rejectReason?: string
}

export interface PersonalDutyPost extends Record<string, unknown> {
  id: string
  applicantName: string
  applicantRank: string
  unitName: string
  requestedPost: string
  currentPost: string
  reason: string
  evidenceFile: string
  status: string
  createdAt: string
  approvedAt?: string
  rejectReason?: string
}

export interface PersonalDept extends Record<string, unknown> {
  id: string
  applicantName: string
  applicantRank: string
  unitName: string
  fromDept: string
  toDept: string
  reason: string
  status: string
  createdAt: string
  approvedAt?: string
  rejectReason?: string
}

// 내부 DB
const UNITS = ['1함대', '2함대', '3함대', '해군사령부', '교육사령부', '군수사령부', '해병대사령부']
const RANKS = ['중위', '대위', '소령', '중령', '대령', '준위', '하사', '중사', '상사', '원사']
const POSITIONS = ['작전장교', '인사장교', '군수장교', '정보장교', '통신장교', '의무장교', '법무장교']
const DUTY_POSTS = ['제1당직실', '제2당직실', '제3당직실', '본부 당직실', '지휘통제실', '통신당직실', '함정당직실']
const DUTY_TYPES = ['당직', '비상당직', '경계당직', '통신당직', '함정당직']
const DEPTS = ['작전부서', '인사부서', '군수부서', '정보부서', '통신부서', '의무부서', '법무부서', '교육부서']
const DUTY_REASONS = [
  '근무지 변경 요청', '거리 이유로 이동 희망', '보직 변경에 따른 이동',
  '부대 이전으로 인한 변경', '건강상 사유', '업무 효율화',
  '교대 일정 조정', '개인 사정으로 인한 변경 요청',
]
const DEPT_REASONS = [
  '보직 변경', '업무 이관', '인사 발령', '부대 개편',
  '전문성 강화', '교육 파견 복귀', '조직 재편',
]

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

// ─── 당직근무자 mock 데이터 (18건) ───
let dutyWorkers: DutyWorker[] = Array.from({ length: 18 }, (_, i) => {
  const dutyPost = faker.helpers.arrayElement(DUTY_POSTS)
  const status = i < 6 ? '근무중' : faker.helpers.arrayElement(['근무중', '교대완료', '대기'])
  return {
    id: faker.string.uuid(),
    name: faker.person.lastName() + faker.person.firstName(),
    rank: faker.helpers.arrayElement(RANKS),
    unitName: faker.helpers.arrayElement(UNITS),
    dutyDate: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
    dutyPost,
    dutyType: faker.helpers.arrayElement(DUTY_TYPES),
    startTime: faker.helpers.arrayElement(['08:00', '18:00', '22:00']),
    endTime: faker.helpers.arrayElement(['09:00', '18:00', '08:00']),
    status,
    remarks: i % 3 === 0 ? faker.helpers.arrayElement(['정상 근무', '교대 예정', '긴급 배치', '']) : '',
  }
})

// ─── 당직개소 mock 데이터 (15건) ───
let dutyPosts: DutyPost[] = [
  { id: faker.string.uuid(), postName: '제1당직실', postId: 'DP0001', location: '본관 1층', macAddress: faker.internet.mac(), unitNames: ['1함대', '해군사령부'], capacity: 3, isActive: true, createdAt: '2026-01-01' },
  { id: faker.string.uuid(), postName: '제2당직실', postId: 'DP0002', location: '본관 2층', macAddress: faker.internet.mac(), unitNames: ['2함대'], capacity: 2, isActive: true, createdAt: '2026-01-01' },
  { id: faker.string.uuid(), postName: '제3당직실', postId: 'DP0003', location: '별관 1층', macAddress: faker.internet.mac(), unitNames: ['3함대'], capacity: 2, isActive: true, createdAt: '2026-01-01' },
  { id: faker.string.uuid(), postName: '본부 당직실', postId: 'DP0004', location: '사령부 본관 3층', macAddress: faker.internet.mac(), unitNames: ['해군사령부', '해병대사령부'], capacity: 4, isActive: true, createdAt: '2026-01-01' },
  { id: faker.string.uuid(), postName: '지휘통제실', postId: 'DP0005', location: '사령부 지하 1층', macAddress: faker.internet.mac(), unitNames: ['해군사령부'], capacity: 5, isActive: true, createdAt: '2026-01-01' },
  { id: faker.string.uuid(), postName: '통신당직실', postId: 'DP0006', location: '통신동 2층', macAddress: faker.internet.mac(), unitNames: ['교육사령부', '군수사령부'], capacity: 2, isActive: true, createdAt: '2026-01-15' },
  { id: faker.string.uuid(), postName: '함정당직실', postId: 'DP0007', location: '부두 관리동', macAddress: faker.internet.mac(), unitNames: ['1함대', '2함대', '3함대'], capacity: 3, isActive: true, createdAt: '2026-01-15' },
  ...Array.from({ length: 8 }, () => ({
    id: faker.string.uuid(),
    postName: faker.helpers.arrayElement(DUTY_POSTS),
    postId: faker.string.alphanumeric(6).toUpperCase(),
    location: faker.helpers.arrayElement(['본관 1층', '본관 2층', '별관 1층', '사령부동 3층', '통신동 1층']),
    macAddress: faker.internet.mac(),
    unitNames: faker.helpers.arrayElements(UNITS, faker.number.int({ min: 1, max: 3 })),
    capacity: faker.number.int({ min: 1, max: 5 }),
    isActive: faker.datatype.boolean(),
    createdAt: faker.date.recent({ days: 90 }).toISOString().split('T')[0],
  })),
]

// ─── 당직교대 mock 데이터 (17건) ───
let dutyPostChanges: DutyPostChange[] = Array.from({ length: 17 }, (_, i) => {
  const status = i < 5 ? 'pending' : faker.helpers.arrayElement(['pending', 'approved', 'rejected'])
  return {
    id: faker.string.uuid(),
    workerName: faker.person.lastName() + faker.person.firstName(),
    workerRank: faker.helpers.arrayElement(RANKS),
    unitName: faker.helpers.arrayElement(UNITS),
    fromPost: faker.helpers.arrayElement(DUTY_POSTS),
    toPost: faker.helpers.arrayElement(DUTY_POSTS),
    changeDate: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
    reason: faker.helpers.arrayElement(DUTY_REASONS),
    status,
    approvedBy: status === 'approved' ? faker.person.lastName() + faker.person.firstName() + ' ' + faker.helpers.arrayElement(['소령', '중령']) : undefined,
    approvedAt: status === 'approved' ? faker.date.recent({ days: 10 }).toISOString().split('T')[0] : undefined,
    rejectReason: status === 'rejected' ? faker.helpers.arrayElement(['교대 인원 부족', '일정 불가', '승인 불가 사유']) : undefined,
  }
})

// ─── 개인당직개소 신청 mock 데이터 (16건) ───
let personalDutyPosts: PersonalDutyPost[] = Array.from({ length: 16 }, (_, i) => {
  const status = i < 4 ? 'pending' : faker.helpers.arrayElement(['pending', 'approved', 'rejected'])
  const currentPost = faker.helpers.arrayElement(DUTY_POSTS)
  const requestedPost = faker.helpers.arrayElement(DUTY_POSTS.filter(p => p !== currentPost))
  return {
    id: faker.string.uuid(),
    applicantName: faker.person.lastName() + faker.person.firstName(),
    applicantRank: faker.helpers.arrayElement(RANKS),
    unitName: faker.helpers.arrayElement(UNITS),
    requestedPost,
    currentPost,
    reason: faker.helpers.arrayElement(DUTY_REASONS),
    evidenceFile: i % 4 === 0 ? `첨부파일_${i + 1}.pdf` : '',
    status,
    createdAt: faker.date.recent({ days: 60 }).toISOString().split('T')[0],
    approvedAt: status === 'approved' ? faker.date.recent({ days: 10 }).toISOString().split('T')[0] : undefined,
    rejectReason: status === 'rejected' ? faker.helpers.arrayElement(['사유 불충분', '교대 일정 조정 필요', '승인 불가']) : undefined,
  }
})

// ─── 개인부서 신청 mock 데이터 (15건) ───
let personalDepts: PersonalDept[] = Array.from({ length: 15 }, (_, i) => {
  const status = i < 4 ? 'pending' : faker.helpers.arrayElement(['pending', 'approved', 'rejected'])
  const fromDept = faker.helpers.arrayElement(DEPTS)
  const toDept = faker.helpers.arrayElement(DEPTS.filter(d => d !== fromDept))
  return {
    id: faker.string.uuid(),
    applicantName: faker.person.lastName() + faker.person.firstName(),
    applicantRank: faker.helpers.arrayElement(RANKS),
    unitName: faker.helpers.arrayElement(UNITS),
    fromDept,
    toDept,
    reason: faker.helpers.arrayElement(DEPT_REASONS),
    status,
    createdAt: faker.date.recent({ days: 60 }).toISOString().split('T')[0],
    approvedAt: status === 'approved' ? faker.date.recent({ days: 10 }).toISOString().split('T')[0] : undefined,
    rejectReason: status === 'rejected' ? faker.helpers.arrayElement(['인력 부족', '발령 시기 미도래', '불가 사유']) : undefined,
  }
})

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

  // ─── 당직근무자 (DutyWorker) CRUD ───
  http.get('/api/sys01/duty-workers', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    return ok(paged(dutyWorkers, page, size))
  }),
  http.get('/api/sys01/duty-workers/:id', ({ params }) => {
    const item = dutyWorkers.find(r => r.id === params.id)
    return item ? ok(item) : HttpResponse.json({ success: false, message: '미발견' }, { status: 404 })
  }),
  http.post('/api/sys01/duty-workers', async ({ request }) => {
    const body = await request.json() as Partial<DutyWorker>
    const item: DutyWorker = {
      id: faker.string.uuid(),
      name: body.name ?? '',
      rank: body.rank ?? '',
      unitName: body.unitName ?? '',
      dutyDate: body.dutyDate ?? '',
      dutyPost: body.dutyPost ?? '',
      dutyType: body.dutyType ?? '당직',
      startTime: body.startTime ?? '18:00',
      endTime: body.endTime ?? '09:00',
      status: '근무중',
      remarks: body.remarks ?? '',
    }
    dutyWorkers = [item, ...dutyWorkers]
    return ok(item)
  }),
  http.put('/api/sys01/duty-workers/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<DutyWorker>
    dutyWorkers = dutyWorkers.map(r => r.id === params.id ? { ...r, ...body } : r)
    return ok(dutyWorkers.find(r => r.id === params.id))
  }),
  http.delete('/api/sys01/duty-workers/:id', ({ params }) => {
    dutyWorkers = dutyWorkers.filter(r => r.id !== params.id)
    return ok({ id: params.id })
  }),

  // ─── 당직개소 (DutyPost) CRUD ───
  http.get('/api/sys01/duty-posts', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    return ok(paged(dutyPosts, page, size))
  }),
  http.get('/api/sys01/duty-posts/:id', ({ params }) => {
    const item = dutyPosts.find(r => r.id === params.id)
    return item ? ok(item) : HttpResponse.json({ success: false, message: '미발견' }, { status: 404 })
  }),
  http.post('/api/sys01/duty-posts', async ({ request }) => {
    const body = await request.json() as Partial<DutyPost>
    const item: DutyPost = {
      id: faker.string.uuid(),
      postName: body.postName ?? '',
      postId: body.postId ?? faker.string.alphanumeric(6).toUpperCase(),
      location: body.location ?? '',
      macAddress: body.macAddress ?? '',
      unitNames: body.unitNames ?? [],
      capacity: body.capacity ?? 2,
      isActive: body.isActive ?? true,
      createdAt: new Date().toISOString().split('T')[0],
    }
    dutyPosts = [item, ...dutyPosts]
    return ok(item)
  }),
  http.put('/api/sys01/duty-posts/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<DutyPost>
    dutyPosts = dutyPosts.map(r => r.id === params.id ? { ...r, ...body } : r)
    return ok(dutyPosts.find(r => r.id === params.id))
  }),
  http.delete('/api/sys01/duty-posts/:id', ({ params }) => {
    dutyPosts = dutyPosts.filter(r => r.id !== params.id)
    return ok({ id: params.id })
  }),

  // ─── 당직교대 (DutyPostChange) CRUD ───
  http.get('/api/sys01/duty-post-changes', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    return ok(paged(dutyPostChanges, page, size))
  }),
  http.post('/api/sys01/duty-post-changes', async ({ request }) => {
    const body = await request.json() as Partial<DutyPostChange>
    const item: DutyPostChange = {
      id: faker.string.uuid(),
      workerName: body.workerName ?? '',
      workerRank: body.workerRank ?? '',
      unitName: body.unitName ?? '',
      fromPost: body.fromPost ?? '',
      toPost: body.toPost ?? '',
      changeDate: body.changeDate ?? new Date().toISOString().split('T')[0],
      reason: body.reason ?? '',
      status: 'pending',
      approvedBy: undefined,
      approvedAt: undefined,
    }
    dutyPostChanges = [item, ...dutyPostChanges]
    return ok(item)
  }),
  http.put('/api/sys01/duty-post-changes/:id/approve', ({ params }) => {
    dutyPostChanges = dutyPostChanges.map(r =>
      r.id === params.id ? { ...r, status: 'approved', approvedBy: '김철수 소령', approvedAt: new Date().toISOString().split('T')[0] } : r
    )
    return ok({ id: params.id })
  }),
  http.put('/api/sys01/duty-post-changes/:id/reject', async ({ params, request }) => {
    const body = await request.json() as { reason: string }
    dutyPostChanges = dutyPostChanges.map(r =>
      r.id === params.id ? { ...r, status: 'rejected', rejectReason: body.reason } : r
    )
    return ok({ id: params.id })
  }),

  // ─── 개인당직개소 신청/승인 (PersonalDutyPost) CRUD ───
  http.get('/api/sys01/personal-duty-post', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    return ok(paged(personalDutyPosts, page, size))
  }),
  http.post('/api/sys01/personal-duty-post', async ({ request }) => {
    const body = await request.json() as Partial<PersonalDutyPost>
    const item: PersonalDutyPost = {
      id: faker.string.uuid(),
      applicantName: body.applicantName ?? '홍길동',
      applicantRank: body.applicantRank ?? '대위',
      unitName: body.unitName ?? '1함대',
      requestedPost: body.requestedPost ?? '',
      currentPost: body.currentPost ?? '',
      reason: body.reason ?? '',
      evidenceFile: body.evidenceFile ?? '',
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      approvedAt: undefined,
    }
    personalDutyPosts = [item, ...personalDutyPosts]
    return ok(item)
  }),
  http.put('/api/sys01/personal-duty-post/:id/approve', ({ params }) => {
    personalDutyPosts = personalDutyPosts.map(r =>
      r.id === params.id ? { ...r, status: 'approved', approvedAt: new Date().toISOString().split('T')[0] } : r
    )
    return ok({ id: params.id })
  }),
  http.put('/api/sys01/personal-duty-post/:id/reject', async ({ params, request }) => {
    const body = await request.json() as { reason: string }
    personalDutyPosts = personalDutyPosts.map(r =>
      r.id === params.id ? { ...r, status: 'rejected', rejectReason: body.reason } : r
    )
    return ok({ id: params.id })
  }),

  // ─── 개인부서 신청/승인 (PersonalDept) CRUD ───
  http.get('/api/sys01/personal-dept', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    return ok(paged(personalDepts, page, size))
  }),
  http.post('/api/sys01/personal-dept', async ({ request }) => {
    const body = await request.json() as Partial<PersonalDept>
    const item: PersonalDept = {
      id: faker.string.uuid(),
      applicantName: body.applicantName ?? '홍길동',
      applicantRank: body.applicantRank ?? '대위',
      unitName: body.unitName ?? '1함대',
      fromDept: body.fromDept ?? '',
      toDept: body.toDept ?? '',
      reason: body.reason ?? '',
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      approvedAt: undefined,
    }
    personalDepts = [item, ...personalDepts]
    return ok(item)
  }),
  http.put('/api/sys01/personal-dept/:id/approve', ({ params }) => {
    personalDepts = personalDepts.map(r =>
      r.id === params.id ? { ...r, status: 'approved', approvedAt: new Date().toISOString().split('T')[0] } : r
    )
    return ok({ id: params.id })
  }),
  http.put('/api/sys01/personal-dept/:id/reject', async ({ params, request }) => {
    const body = await request.json() as { reason: string }
    personalDepts = personalDepts.map(r =>
      r.id === params.id ? { ...r, status: 'rejected', rejectReason: body.reason } : r
    )
    return ok({ id: params.id })
  }),
  http.put('/api/sys01/personal-dept/:id/restore', ({ params }) => {
    personalDepts = personalDepts.map(r =>
      r.id === params.id ? { ...r, status: 'pending', toDept: r.fromDept, fromDept: r.toDept } : r
    )
    return ok({ id: params.id })
  }),

  // ─── 개인설정 ───
  http.get('/api/sys01/personal-settings', () => {
    return ok({
      approvalDept: '작전부서',
      approver: '김철수 소령',
      dutyPost: '제1당직실',
      unitName: '1함대',
      dutyType: '당직',
      phone: '010-1234-5678',
    })
  }),
  http.put('/api/sys01/personal-settings', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return ok(body)
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
]
