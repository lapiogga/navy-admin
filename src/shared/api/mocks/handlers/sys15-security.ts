import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker/locale/ko'
import type { ApiResult, PageResponse } from '@/shared/api/types'

// ──────────────────────────────────────────────────
// 타입 정의
// ──────────────────────────────────────────────────
export type SecretClassification = '1급' | '2급' | '3급' | 'II급' | 'III급'
export type SecretStatus = 'active' | 'expired' | 'transferred' | 'destroyed'
export type MediaType = 'USB' | 'HDD' | 'SSD' | 'CD/DVD' | '기타'
export type EquipmentType = '암호장비' | '보안카드단말기' | '보안USB관리기' | '지문인식기' | '기타'
export type TransferStatus = 'pending' | 'approved' | 'rejected'

export interface SecretItem extends Record<string, unknown> {
  id: string
  name: string
  classification: SecretClassification
  registrationNo: string
  registrant: string
  department: string
  registeredAt: string
  status: SecretStatus
  noticeDue?: string
  hasNoticeDoc?: boolean
}

export interface MediaItem extends Record<string, unknown> {
  id: string
  name: string
  classification: SecretClassification
  registrationNo: string
  registrant: string
  department: string
  registeredAt: string
  status: SecretStatus
  mediaType: MediaType
  serialNo: string
  capacity: string
}

export interface EquipmentItem extends Record<string, unknown> {
  id: string
  name: string
  classification: SecretClassification
  registrationNo: string
  registrant: string
  department: string
  registeredAt: string
  status: SecretStatus
  equipmentType: EquipmentType
  modelName: string
  installLocation: string
}

export interface NoticeDoc extends Record<string, unknown> {
  id: string
  secretId: string
  secretName: string
  title: string
  content: string
  notifyDate: string
  recipients: string
  status: string
  createdAt: string
}

export interface TransferRecord extends Record<string, unknown> {
  id: string
  items: string[]
  fromUser: string
  toUser: string
  fromDept: string
  toDept: string
  status: TransferStatus
  transferType: 'out' | 'in'
  createdAt: string
  confirmedAt?: string
}

// Wave 2 지원용 타입
export interface ChecklistItem extends Record<string, unknown> {
  id: string
  category: string
  question: string
  required: boolean
  order: number
}

export interface DailySettlement extends Record<string, unknown> {
  id: string
  userId: string
  userName: string
  department: string
  date: string
  status: 'pending' | 'completed' | 'approved'
  score: number
  completedAt?: string
}

// Wave 2 신규 타입
export type DayStatus = 'completed' | 'incomplete' | 'absence' | 'future' | 'none'

export interface DailyStatusItem extends Record<string, unknown> {
  date: string
  personalStatus: DayStatus
  officeStatus: DayStatus
}

export interface PersonalDailyRecord extends Record<string, unknown> {
  id: string
  date: string
  userName: string
  department: string
  checkedItems: string[]
  uncheckedReasons: Record<string, string>
  status: 'draft' | 'submitted' | 'approved'
  submittedAt?: string
}

export interface OfficeDailyRecord extends Record<string, unknown> {
  id: string
  date: string
  officeManager: string
  department: string
  checkedItems: string[]
  nonCompliantPersons: string
  nonCompliantReason: string
  absentPersons: string
  absentReason: string
  status: 'draft' | 'submitted' | 'approved'
  submittedAt?: string
}

export interface DutySchedule extends Record<string, unknown> {
  id: string
  date: string
  officerName: string
  rank: string
  department: string
  status: 'draft' | 'submitted' | 'approved'
}

export interface DutyInspection extends Record<string, unknown> {
  id: string
  date: string
  officerName: string
  inspectedUnit: string
  result: '이상없음' | '경미한이상' | '중대한이상'
  details: string
  status: 'draft' | 'submitted'
}

export interface SecurityLevelRecord extends Record<string, unknown> {
  id: string
  targetName: string
  department: string
  evalType: '수시' | '정기'
  evalDate: string
  score: number
  grade: 'A' | 'B' | 'C' | 'D'
  evaluator: string
  status: 'draft' | 'approved'
}

export interface SecurityLevelStats extends Record<string, unknown> {
  department: string
  avgScore: number
  gradeDistribution: { grade: string; count: number }[]
  trend: { month: string; avgScore: number }[]
}

export interface AbsenceRecord extends Record<string, unknown> {
  id: string
  personnelName: string
  department: string
  absenceStart: string
  absenceEnd: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export interface SecurityEduRecord extends Record<string, unknown> {
  id: string
  eduType: '정기교육' | '특별교육' | '직무교육' | '기타'
  eduDate: string
  duration: number
  instructor: string
  participants: number
  content: string
  department: string
  status: 'draft' | 'completed'
}

export interface ApprovalRecord extends Record<string, unknown> {
  id: string
  docType: '개인일일결산' | '사무실결산' | '당직표' | '보안교육' | '부재'
  title: string
  submitter: string
  department: string
  submittedAt: string
  status: 'submitted' | 'approved' | 'rejected'
  approvedAt?: string
  rejectReason?: string
}

// ──────────────────────────────────────────────────
// 내부 상수
// ──────────────────────────────────────────────────
const UNITS = ['1함대', '2함대', '3함대', '해군사령부', '교육사령부', '군수사령부', '해병대사령부']
const RANKS = ['중위', '대위', '소령', '중령', '대령', '하사', '중사', '상사']
const CLASSIFICATIONS: SecretClassification[] = ['1급', '2급', '3급', 'II급', 'III급']
const STATUSES: SecretStatus[] = ['active', 'expired', 'transferred', 'destroyed']

function randomName() {
  return faker.person.lastName() + faker.person.firstName()
}

// ──────────────────────────────────────────────────
// 초기 Mock 데이터
// ──────────────────────────────────────────────────
let secrets: SecretItem[] = Array.from({ length: 20 }, () => ({
  id: faker.string.uuid(),
  name: faker.helpers.arrayElement(['작전계획', '훈련지침', '부대편성안', '보안규정', '암호통신안']) + faker.string.numeric(3),
  classification: faker.helpers.arrayElement(CLASSIFICATIONS),
  registrationNo: `비-${faker.string.numeric(6)}`,
  registrant: randomName(),
  department: faker.helpers.arrayElement(UNITS),
  registeredAt: faker.date.recent({ days: 180 }).toISOString().split('T')[0],
  status: faker.helpers.arrayElement(STATUSES),
  noticeDue: faker.date.future({ years: 1 }).toISOString().split('T')[0],
  hasNoticeDoc: faker.datatype.boolean(),
}))

let media: MediaItem[] = Array.from({ length: 20 }, () => ({
  id: faker.string.uuid(),
  name: `저장매체-${faker.string.numeric(4)}`,
  classification: faker.helpers.arrayElement(CLASSIFICATIONS),
  registrationNo: `매-${faker.string.numeric(6)}`,
  registrant: randomName(),
  department: faker.helpers.arrayElement(UNITS),
  registeredAt: faker.date.recent({ days: 180 }).toISOString().split('T')[0],
  status: faker.helpers.arrayElement(STATUSES),
  mediaType: faker.helpers.arrayElement(['USB', 'HDD', 'SSD', 'CD/DVD', '기타'] as MediaType[]),
  serialNo: faker.string.alphanumeric(12).toUpperCase(),
  capacity: faker.helpers.arrayElement(['4GB', '8GB', '16GB', '32GB', '64GB', '128GB', '1TB', '2TB']),
}))

let equipment: EquipmentItem[] = Array.from({ length: 20 }, () => ({
  id: faker.string.uuid(),
  name: faker.helpers.arrayElement(['KY-58', 'KY-99', 'VINSON', 'ANDVT', '보안카드']) + faker.string.numeric(3),
  classification: faker.helpers.arrayElement(CLASSIFICATIONS),
  registrationNo: `장-${faker.string.numeric(6)}`,
  registrant: randomName(),
  department: faker.helpers.arrayElement(UNITS),
  registeredAt: faker.date.recent({ days: 180 }).toISOString().split('T')[0],
  status: faker.helpers.arrayElement(STATUSES),
  equipmentType: faker.helpers.arrayElement(['암호장비', '보안카드단말기', '보안USB관리기', '지문인식기', '기타'] as EquipmentType[]),
  modelName: faker.helpers.arrayElement(['KY-Series', 'HX-320', 'AN/PYQ-10', 'SAVILLE', 'KG-84']),
  installLocation: faker.helpers.arrayElement(['지휘통제실', '통신실', '작전실', '본부동', '별관']),
}))

let noticeDocs: NoticeDoc[] = Array.from({ length: 20 }, () => {
  const secret = faker.helpers.arrayElement(secrets)
  return {
    id: faker.string.uuid(),
    secretId: secret.id,
    secretName: secret.name,
    title: `예고문-${faker.string.numeric(4)}`,
    content: faker.lorem.sentences(2),
    notifyDate: faker.date.future({ years: 1 }).toISOString().split('T')[0],
    recipients: faker.helpers.arrayElement(UNITS),
    status: faker.helpers.arrayElement(['draft', 'sent', 'confirmed']),
    createdAt: faker.date.recent({ days: 90 }).toISOString().split('T')[0],
  }
})

let transfers: TransferRecord[] = Array.from({ length: 20 }, () => ({
  id: faker.string.uuid(),
  items: [faker.string.uuid(), faker.string.uuid()],
  fromUser: randomName(),
  toUser: randomName(),
  fromDept: faker.helpers.arrayElement(UNITS),
  toDept: faker.helpers.arrayElement(UNITS),
  status: faker.helpers.arrayElement(['pending', 'approved', 'rejected'] as TransferStatus[]),
  transferType: faker.helpers.arrayElement(['out', 'in'] as ('out' | 'in')[]),
  createdAt: faker.date.recent({ days: 60 }).toISOString().split('T')[0],
  confirmedAt: faker.datatype.boolean() ? faker.date.recent({ days: 30 }).toISOString().split('T')[0] : undefined,
}))

// Wave 2 상세 데이터
let personalDailyRecords: PersonalDailyRecord[] = Array.from({ length: 20 }, () => ({
  id: faker.string.uuid(),
  date: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
  userName: randomName(),
  department: faker.helpers.arrayElement(UNITS),
  checkedItems: ['r1', 'r2', 'r3'],
  uncheckedReasons: { r4: '점검 실시 불가' },
  status: faker.helpers.arrayElement(['draft', 'submitted', 'approved'] as ('draft' | 'submitted' | 'approved')[]),
  submittedAt: faker.date.recent({ days: 5 }).toISOString().split('T')[0],
}))

let officeDailyRecords: OfficeDailyRecord[] = Array.from({ length: 20 }, () => ({
  id: faker.string.uuid(),
  date: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
  officeManager: randomName(),
  department: faker.helpers.arrayElement(UNITS),
  checkedItems: ['or1', 'or2', 'or3'],
  nonCompliantPersons: '없음',
  nonCompliantReason: '',
  absentPersons: faker.helpers.arrayElement(['없음', randomName()]),
  absentReason: '',
  status: faker.helpers.arrayElement(['draft', 'submitted', 'approved'] as ('draft' | 'submitted' | 'approved')[]),
  submittedAt: faker.date.recent({ days: 5 }).toISOString().split('T')[0],
}))

let dutySchedules: DutySchedule[] = Array.from({ length: 15 }, () => ({
  id: faker.string.uuid(),
  date: faker.date.soon({ days: 30 }).toISOString().split('T')[0],
  officerName: randomName(),
  rank: faker.helpers.arrayElement(RANKS),
  department: faker.helpers.arrayElement(UNITS),
  status: faker.helpers.arrayElement(['draft', 'submitted', 'approved'] as ('draft' | 'submitted' | 'approved')[]),
}))

let dutyInspections: DutyInspection[] = Array.from({ length: 15 }, () => ({
  id: faker.string.uuid(),
  date: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
  officerName: randomName(),
  inspectedUnit: faker.helpers.arrayElement(UNITS),
  result: faker.helpers.arrayElement(['이상없음', '경미한이상', '중대한이상'] as ('이상없음' | '경미한이상' | '중대한이상')[]),
  details: faker.lorem.sentence(),
  status: faker.helpers.arrayElement(['draft', 'submitted'] as ('draft' | 'submitted')[]),
}))

let securityLevels: SecurityLevelRecord[] = Array.from({ length: 20 }, () => ({
  id: faker.string.uuid(),
  targetName: randomName(),
  department: faker.helpers.arrayElement(UNITS),
  evalType: faker.helpers.arrayElement(['수시', '정기'] as ('수시' | '정기')[]),
  evalDate: faker.date.recent({ days: 90 }).toISOString().split('T')[0],
  score: faker.number.int({ min: 60, max: 100 }),
  grade: faker.helpers.arrayElement(['A', 'B', 'C', 'D'] as ('A' | 'B' | 'C' | 'D')[]),
  evaluator: randomName(),
  status: faker.helpers.arrayElement(['draft', 'approved'] as ('draft' | 'approved')[]),
}))

let absenceRecords: AbsenceRecord[] = Array.from({ length: 15 }, () => ({
  id: faker.string.uuid(),
  personnelName: randomName(),
  department: faker.helpers.arrayElement(UNITS),
  absenceStart: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
  absenceEnd: faker.date.soon({ days: 5 }).toISOString().split('T')[0],
  reason: faker.helpers.arrayElement(['휴가', '출장', '파견', '교육', '기타']),
  status: faker.helpers.arrayElement(['pending', 'approved', 'rejected'] as ('pending' | 'approved' | 'rejected')[]),
  createdAt: faker.date.recent({ days: 10 }).toISOString().split('T')[0],
}))

let securityEduRecords: SecurityEduRecord[] = Array.from({ length: 15 }, () => ({
  id: faker.string.uuid(),
  eduType: faker.helpers.arrayElement(['정기교육', '특별교육', '직무교육', '기타'] as ('정기교육' | '특별교육' | '직무교육' | '기타')[]),
  eduDate: faker.date.recent({ days: 90 }).toISOString().split('T')[0],
  duration: faker.number.int({ min: 1, max: 8 }),
  instructor: randomName(),
  participants: faker.number.int({ min: 5, max: 50 }),
  content: faker.lorem.sentence(),
  department: faker.helpers.arrayElement(UNITS),
  status: faker.helpers.arrayElement(['draft', 'completed'] as ('draft' | 'completed')[]),
}))

let approvalRecords: ApprovalRecord[] = Array.from({ length: 20 }, () => ({
  id: faker.string.uuid(),
  docType: faker.helpers.arrayElement(['개인일일결산', '사무실결산', '당직표', '보안교육', '부재'] as ('개인일일결산' | '사무실결산' | '당직표' | '보안교육' | '부재')[]),
  title: `보안결산-${faker.string.numeric(4)}`,
  submitter: randomName(),
  department: faker.helpers.arrayElement(UNITS),
  submittedAt: faker.date.recent({ days: 10 }).toISOString().split('T')[0],
  status: faker.helpers.arrayElement(['submitted', 'approved', 'rejected'] as ('submitted' | 'approved' | 'rejected')[]),
  approvedAt: faker.datatype.boolean() ? faker.date.recent({ days: 3 }).toISOString().split('T')[0] : undefined,
  rejectReason: undefined,
}))

// Wave 2 스텁 데이터
const checklistItems: ChecklistItem[] = Array.from({ length: 10 }, (_, i) => ({
  id: faker.string.uuid(),
  category: faker.helpers.arrayElement(['비밀관리', '매체관리', '보안장비', '시설보안']),
  question: `보안점검 항목 ${i + 1}`,
  required: i < 5,
  order: i + 1,
}))

let dailySettlements: DailySettlement[] = Array.from({ length: 20 }, () => ({
  id: faker.string.uuid(),
  userId: faker.string.uuid(),
  userName: randomName(),
  department: faker.helpers.arrayElement(UNITS),
  date: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
  status: faker.helpers.arrayElement(['pending', 'completed', 'approved'] as ('pending' | 'completed' | 'approved')[]),
  score: faker.number.int({ min: 70, max: 100 }),
  completedAt: faker.date.recent({ days: 15 }).toISOString().split('T')[0],
}))

// ──────────────────────────────────────────────────
// 유틸리티
// ──────────────────────────────────────────────────
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

// ──────────────────────────────────────────────────
// MSW Handlers
// ──────────────────────────────────────────────────
export const sys15Handlers = [
  // ── 비밀 관리 ──
  http.get('/api/sys15/secrets', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    return ok(paged(secrets, page, size))
  }),
  http.post('/api/sys15/secrets', async ({ request }) => {
    const body = await request.json() as Partial<SecretItem>
    const item: SecretItem = {
      id: faker.string.uuid(),
      name: body.name ?? '',
      classification: body.classification ?? '3급',
      registrationNo: `비-${faker.string.numeric(6)}`,
      registrant: body.registrant ?? '홍길동',
      department: body.department ?? '해군사령부',
      registeredAt: new Date().toISOString().split('T')[0],
      status: 'active',
      hasNoticeDoc: false,
    }
    secrets = [item, ...secrets]
    return ok(item)
  }),
  http.put('/api/sys15/secrets/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<SecretItem>
    secrets = secrets.map((s) => s.id === params.id ? { ...s, ...body } : s)
    const updated = secrets.find((s) => s.id === params.id)
    return ok(updated)
  }),
  http.delete('/api/sys15/secrets/:id', ({ params }) => {
    secrets = secrets.filter((s) => s.id !== params.id)
    return ok({ id: params.id })
  }),

  // ── 저장매체 관리 ──
  http.get('/api/sys15/media', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    return ok(paged(media, page, size))
  }),
  http.post('/api/sys15/media', async ({ request }) => {
    const body = await request.json() as Partial<MediaItem>
    const item: MediaItem = {
      id: faker.string.uuid(),
      name: body.name ?? '',
      classification: body.classification ?? '3급',
      registrationNo: `매-${faker.string.numeric(6)}`,
      registrant: body.registrant ?? '홍길동',
      department: body.department ?? '해군사령부',
      registeredAt: new Date().toISOString().split('T')[0],
      status: 'active',
      mediaType: body.mediaType ?? 'USB',
      serialNo: body.serialNo ?? faker.string.alphanumeric(12).toUpperCase(),
      capacity: body.capacity ?? '16GB',
    }
    media = [item, ...media]
    return ok(item)
  }),
  http.put('/api/sys15/media/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<MediaItem>
    media = media.map((m) => m.id === params.id ? { ...m, ...body } : m)
    const updated = media.find((m) => m.id === params.id)
    return ok(updated)
  }),
  http.delete('/api/sys15/media/:id', ({ params }) => {
    media = media.filter((m) => m.id !== params.id)
    return ok({ id: params.id })
  }),

  // ── 보안자재/암호장비 관리 ──
  http.get('/api/sys15/equipment', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    return ok(paged(equipment, page, size))
  }),
  http.post('/api/sys15/equipment', async ({ request }) => {
    const body = await request.json() as Partial<EquipmentItem>
    const item: EquipmentItem = {
      id: faker.string.uuid(),
      name: body.name ?? '',
      classification: body.classification ?? '3급',
      registrationNo: `장-${faker.string.numeric(6)}`,
      registrant: body.registrant ?? '홍길동',
      department: body.department ?? '해군사령부',
      registeredAt: new Date().toISOString().split('T')[0],
      status: 'active',
      equipmentType: body.equipmentType ?? '암호장비',
      modelName: body.modelName ?? '',
      installLocation: body.installLocation ?? '',
    }
    equipment = [item, ...equipment]
    return ok(item)
  }),
  http.put('/api/sys15/equipment/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<EquipmentItem>
    equipment = equipment.map((e) => e.id === params.id ? { ...e, ...body } : e)
    const updated = equipment.find((e) => e.id === params.id)
    return ok(updated)
  }),
  http.delete('/api/sys15/equipment/:id', ({ params }) => {
    equipment = equipment.filter((e) => e.id !== params.id)
    return ok({ id: params.id })
  }),

  // ── 예고문 관리 ──
  http.get('/api/sys15/notice-docs', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    return ok(paged(noticeDocs, page, size))
  }),
  http.post('/api/sys15/notice-docs', async ({ request }) => {
    const body = await request.json() as Partial<NoticeDoc>
    const item: NoticeDoc = {
      id: faker.string.uuid(),
      secretId: body.secretId ?? '',
      secretName: body.secretName ?? '',
      title: body.title ?? '',
      content: body.content ?? '',
      notifyDate: body.notifyDate ?? '',
      recipients: body.recipients ?? '',
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
    }
    noticeDocs = [item, ...noticeDocs]
    return ok(item)
  }),
  http.put('/api/sys15/notice-docs/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<NoticeDoc>
    noticeDocs = noticeDocs.map((n) => n.id === params.id ? { ...n, ...body } : n)
    const updated = noticeDocs.find((n) => n.id === params.id)
    return ok(updated)
  }),
  http.delete('/api/sys15/notice-docs/:id', ({ params }) => {
    noticeDocs = noticeDocs.filter((n) => n.id !== params.id)
    return ok({ id: params.id })
  }),

  // ── 인계/인수 ──
  http.get('/api/sys15/transfers', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    const transferType = url.searchParams.get('transferType')
    const filtered = transferType ? transfers.filter((t) => t.transferType === transferType) : transfers
    return ok(paged(filtered, page, size))
  }),
  http.post('/api/sys15/transfers', async ({ request }) => {
    const body = await request.json() as Partial<TransferRecord>
    const item: TransferRecord = {
      id: faker.string.uuid(),
      items: body.items ?? [],
      fromUser: body.fromUser ?? '홍길동',
      toUser: body.toUser ?? '',
      fromDept: body.fromDept ?? '해군사령부',
      toDept: body.toDept ?? '',
      status: 'pending',
      transferType: body.transferType ?? 'out',
      createdAt: new Date().toISOString().split('T')[0],
    }
    transfers = [item, ...transfers]
    return ok(item)
  }),
  http.put('/api/sys15/transfers/:id/confirm', ({ params }) => {
    transfers = transfers.map((t) =>
      t.id === params.id
        ? { ...t, status: 'approved' as TransferStatus, confirmedAt: new Date().toISOString().split('T')[0] }
        : t,
    )
    const updated = transfers.find((t) => t.id === params.id)
    return ok(updated)
  }),
  http.put('/api/sys15/transfers/:id/reject', ({ params }) => {
    transfers = transfers.map((t) =>
      t.id === params.id ? { ...t, status: 'rejected' as TransferStatus } : t,
    )
    const updated = transfers.find((t) => t.id === params.id)
    return ok(updated)
  }),

  // ── Wave 2 스텁 ──
  http.get('/api/sys15/checklist', () => {
    return ok(checklistItems)
  }),
  http.get('/api/sys15/daily-settlement', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    return ok(paged(dailySettlements, page, size))
  }),
  http.post('/api/sys15/daily-settlement', async ({ request }) => {
    const body = await request.json() as Partial<DailySettlement>
    const item: DailySettlement = {
      id: faker.string.uuid(),
      userId: body.userId ?? faker.string.uuid(),
      userName: body.userName ?? '홍길동',
      department: body.department ?? '해군사령부',
      date: body.date ?? new Date().toISOString().split('T')[0],
      status: 'pending',
      score: 0,
    }
    dailySettlements = [item, ...dailySettlements]
    return ok(item)
  }),
  http.put('/api/sys15/daily-settlement/:id/complete', ({ params }) => {
    dailySettlements = dailySettlements.map((d) =>
      d.id === params.id
        ? { ...d, status: 'completed' as const, score: faker.number.int({ min: 70, max: 100 }), completedAt: new Date().toISOString().split('T')[0] }
        : d,
    )
    const updated = dailySettlements.find((d) => d.id === params.id)
    return ok(updated)
  }),
  http.get('/api/sys15/approval', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    const pending = dailySettlements.filter((d) => d.status === 'completed')
    return ok(paged(pending, page, size))
  }),

  // ── 보안인원 목록 (인계인수 인수자 검색용) ──
  http.get('/api/sys15/users', () => {
    const users = Array.from({ length: 15 }, () => ({
      id: faker.string.uuid(),
      name: randomName(),
      rank: faker.helpers.arrayElement(RANKS),
      department: faker.helpers.arrayElement(UNITS),
    }))
    return ok(users)
  }),

  // ── 일일결산 현황 (캘린더 메인화면) ──
  http.get('/api/sys15/daily-status', ({ request }) => {
    const url = new URL(request.url)
    const year = Number(url.searchParams.get('year') ?? new Date().getFullYear())
    const month = Number(url.searchParams.get('month') ?? new Date().getMonth() + 1)
    const days = new Date(year, month, 0).getDate()
    const today = new Date().toISOString().split('T')[0]
    const statuses: DailyStatusItem[] = Array.from({ length: days }, (_, i) => {
      const d = String(i + 1).padStart(2, '0')
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${d}`
      const isFuture = dateStr > today
      const personalStatus: DayStatus = isFuture ? 'future' : faker.helpers.arrayElement(['completed', 'incomplete', 'absence'] as DayStatus[])
      const officeStatus: DayStatus = isFuture ? 'future' : faker.helpers.arrayElement(['completed', 'incomplete', 'absence'] as DayStatus[])
      return { date: dateStr, personalStatus, officeStatus }
    })
    return ok(statuses)
  }),

  // ── 개인 보안일일결산 ──
  http.get('/api/sys15/personal-daily', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    return ok(paged(personalDailyRecords, page, size))
  }),
  http.post('/api/sys15/personal-daily', async ({ request }) => {
    const body = await request.json() as Partial<PersonalDailyRecord>
    const item: PersonalDailyRecord = {
      id: faker.string.uuid(),
      date: new Date().toISOString().split('T')[0],
      userName: '현재사용자',
      department: '해군사령부',
      checkedItems: body.checkedItems ?? [],
      uncheckedReasons: body.uncheckedReasons ?? {},
      status: (body.status as 'draft' | 'submitted' | 'approved') ?? 'draft',
      submittedAt: body.status === 'submitted' ? new Date().toISOString().split('T')[0] : undefined,
    }
    personalDailyRecords = [item, ...personalDailyRecords]
    return ok(item)
  }),

  // ── 사무실 보안일일결산 ──
  http.get('/api/sys15/office-daily', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    return ok(paged(officeDailyRecords, page, size))
  }),
  http.post('/api/sys15/office-daily', async ({ request }) => {
    const body = await request.json() as Partial<OfficeDailyRecord>
    const item: OfficeDailyRecord = {
      id: faker.string.uuid(),
      date: new Date().toISOString().split('T')[0],
      officeManager: '현재사용자',
      department: '해군사령부',
      checkedItems: body.checkedItems ?? [],
      nonCompliantPersons: body.nonCompliantPersons ?? '없음',
      nonCompliantReason: body.nonCompliantReason ?? '',
      absentPersons: body.absentPersons ?? '없음',
      absentReason: body.absentReason ?? '',
      status: (body.status as 'draft' | 'submitted' | 'approved') ?? 'draft',
      submittedAt: body.status === 'submitted' ? new Date().toISOString().split('T')[0] : undefined,
    }
    officeDailyRecords = [item, ...officeDailyRecords]
    return ok(item)
  }),

  // ── 당직관 관리 ──
  http.get('/api/sys15/duty-officer', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    const type = url.searchParams.get('type')
    if (type === 'inspection') {
      return ok(paged(dutyInspections, page, size))
    }
    return ok(paged(dutySchedules, page, size))
  }),
  http.post('/api/sys15/duty-officer', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    if (body.type === 'inspection') {
      const item: DutyInspection = {
        id: faker.string.uuid(),
        date: String(body.date ?? new Date().toISOString().split('T')[0]),
        officerName: randomName(),
        inspectedUnit: String(body.inspectedUnit ?? ''),
        result: (body.result as '이상없음' | '경미한이상' | '중대한이상') ?? '이상없음',
        details: String(body.details ?? ''),
        status: 'draft',
      }
      dutyInspections = [item, ...dutyInspections]
      return ok(item)
    }
    const item: DutySchedule = {
      id: faker.string.uuid(),
      date: String(body.date ?? ''),
      officerName: String(body.officerName ?? ''),
      rank: String(body.rank ?? ''),
      department: String(body.department ?? ''),
      status: 'draft',
    }
    dutySchedules = [item, ...dutySchedules]
    return ok(item)
  }),
  http.put('/api/sys15/duty-officer/:id', async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>
    dutySchedules = dutySchedules.map((d) => d.id === params.id ? { ...d, ...body } : d)
    dutyInspections = dutyInspections.map((d) => d.id === params.id ? { ...d, ...body } : d)
    const updated = dutySchedules.find((d) => d.id === params.id) ?? dutyInspections.find((d) => d.id === params.id)
    return ok(updated)
  }),

  // ── 보안수준평가 ──
  http.get('/api/sys15/security-level', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    const evalType = url.searchParams.get('evalType')
    const filtered = evalType ? securityLevels.filter((s) => s.evalType === evalType) : securityLevels
    return ok(paged(filtered, page, size))
  }),
  http.post('/api/sys15/security-level', async ({ request }) => {
    const body = await request.json() as Partial<SecurityLevelRecord>
    const item: SecurityLevelRecord = {
      id: faker.string.uuid(),
      targetName: body.targetName ?? '',
      department: body.department ?? '해군사령부',
      evalType: body.evalType ?? '수시',
      evalDate: body.evalDate ?? new Date().toISOString().split('T')[0],
      score: body.score ?? 0,
      grade: body.grade ?? 'B',
      evaluator: body.evaluator ?? '현재사용자',
      status: 'draft',
    }
    securityLevels = [item, ...securityLevels]
    return ok(item)
  }),
  http.put('/api/sys15/security-level/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<SecurityLevelRecord>
    securityLevels = securityLevels.map((s) => s.id === params.id ? { ...s, ...body } : s)
    const updated = securityLevels.find((s) => s.id === params.id)
    return ok(updated)
  }),
  http.delete('/api/sys15/security-level/:id', ({ params }) => {
    securityLevels = securityLevels.filter((s) => s.id !== params.id)
    return ok({ id: params.id })
  }),
  http.get('/api/sys15/security-level/stats', () => {
    const stats: SecurityLevelStats = {
      department: '전체',
      avgScore: faker.number.int({ min: 75, max: 95 }),
      gradeDistribution: [
        { grade: 'A', count: faker.number.int({ min: 3, max: 8 }) },
        { grade: 'B', count: faker.number.int({ min: 5, max: 10 }) },
        { grade: 'C', count: faker.number.int({ min: 2, max: 5 }) },
        { grade: 'D', count: faker.number.int({ min: 0, max: 2 }) },
      ],
      trend: Array.from({ length: 6 }, (_, i) => ({
        month: `${new Date().getMonth() - 5 + i + 1}월`,
        avgScore: faker.number.int({ min: 70, max: 100 }),
      })),
    }
    return ok(stats)
  }),

  // ── 부재 관리 ──
  http.get('/api/sys15/absences', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    return ok(paged(absenceRecords, page, size))
  }),
  http.post('/api/sys15/absences', async ({ request }) => {
    const body = await request.json() as Partial<AbsenceRecord>
    const item: AbsenceRecord = {
      id: faker.string.uuid(),
      personnelName: body.personnelName ?? '현재사용자',
      department: body.department ?? '해군사령부',
      absenceStart: body.absenceStart ?? '',
      absenceEnd: body.absenceEnd ?? '',
      reason: body.reason ?? '',
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    }
    absenceRecords = [item, ...absenceRecords]
    return ok(item)
  }),
  http.put('/api/sys15/absences/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<AbsenceRecord>
    absenceRecords = absenceRecords.map((a) => a.id === params.id ? { ...a, ...body } : a)
    const updated = absenceRecords.find((a) => a.id === params.id)
    return ok(updated)
  }),
  http.delete('/api/sys15/absences/:id', ({ params }) => {
    absenceRecords = absenceRecords.filter((a) => a.id !== params.id)
    return ok({ id: params.id })
  }),

  // ── 보안교육 관리 ──
  http.get('/api/sys15/security-edu', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    return ok(paged(securityEduRecords, page, size))
  }),
  http.post('/api/sys15/security-edu', async ({ request }) => {
    const body = await request.json() as Partial<SecurityEduRecord>
    const item: SecurityEduRecord = {
      id: faker.string.uuid(),
      eduType: body.eduType ?? '정기교육',
      eduDate: body.eduDate ?? new Date().toISOString().split('T')[0],
      duration: body.duration ?? 1,
      instructor: body.instructor ?? '',
      participants: body.participants ?? 0,
      content: body.content ?? '',
      department: body.department ?? '해군사령부',
      status: 'draft',
    }
    securityEduRecords = [item, ...securityEduRecords]
    return ok(item)
  }),
  http.put('/api/sys15/security-edu/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<SecurityEduRecord>
    securityEduRecords = securityEduRecords.map((e) => e.id === params.id ? { ...e, ...body } : e)
    const updated = securityEduRecords.find((e) => e.id === params.id)
    return ok(updated)
  }),
  http.delete('/api/sys15/security-edu/:id', ({ params }) => {
    securityEduRecords = securityEduRecords.filter((e) => e.id !== params.id)
    return ok({ id: params.id })
  }),

  // ── 결재 관리 ──
  http.get('/api/sys15/approvals/pending', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    const pending = approvalRecords.filter((a) => a.status === 'submitted')
    return ok(paged(pending, page, size))
  }),
  http.get('/api/sys15/approvals/completed', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    const completed = approvalRecords.filter((a) => a.status === 'approved' || a.status === 'rejected')
    return ok(paged(completed, page, size))
  }),
  http.put('/api/sys15/approvals/:id/approve', ({ params }) => {
    approvalRecords = approvalRecords.map((a) =>
      a.id === params.id
        ? { ...a, status: 'approved' as const, approvedAt: new Date().toISOString().split('T')[0] }
        : a,
    )
    const updated = approvalRecords.find((a) => a.id === params.id)
    return ok(updated)
  }),
  http.put('/api/sys15/approvals/:id/reject', async ({ params, request }) => {
    const body = await request.json() as { reason: string }
    approvalRecords = approvalRecords.map((a) =>
      a.id === params.id
        ? { ...a, status: 'rejected' as const, rejectReason: body.reason }
        : a,
    )
    const updated = approvalRecords.find((a) => a.id === params.id)
    return ok(updated)
  }),
]
