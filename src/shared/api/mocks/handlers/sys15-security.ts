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
]
