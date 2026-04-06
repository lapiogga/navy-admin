import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker/locale/ko'
import type { ApiResult, PageResponse } from '@/shared/api/types'

// ==================== 타입 정의 ====================

export interface UnitTreeNode {
  key: string
  title: string
  children?: UnitTreeNode[]
}

export interface UnitRecord extends Record<string, unknown> {
  id: string
  unitName: string
  unitCode: string
  establishDate: string
  dissolveDate?: string
  location: string
  remarks: string
}

export interface UnitLineage extends Record<string, unknown> {
  id: string
  unitId: string
  lineageNo: string
  unitName: string
  establishDate: string
  relatedOrg: string
}

export interface UnitKeyPerson extends Record<string, unknown> {
  id: string
  unitId: string
  category: string
  name: string
  rank: string
  termStart: string
  termEnd: string
  remarks: string
}

export interface UnitKeyPersonHistory extends Record<string, unknown> {
  id: string
  personId: string
  category: string
  name: string
  rank: string
  termStart: string
  termEnd: string
  changedAt: string
}

export interface UnitActivity extends Record<string, unknown> {
  id: string
  unitId: string
  activityName: string
  category: string
  activityDate: string
  location: string
  description: string
  approvalStatus: string
  attachFile?: string
}

export interface UnitFlag extends Record<string, unknown> {
  id: string
  unitId: string
  unitName: string
  flagType: string
  revisionDate: string
  imageBase64?: string
  remarks: string
}

export interface UnitAuthRequest extends Record<string, unknown> {
  id: string
  requestUnit: string
  requestRole: string
  reason: string
  status: string
  requestedAt: string
  processedAt?: string
  processedBy?: string
  rejectReason?: string
}

export interface UnitAuthView extends Record<string, unknown> {
  id: string
  userName: string
  rank: string
  unit: string
  role: string
  assignedAt: string
  assignedBy: string
}

export interface UnitStats extends Record<string, unknown> {
  id: string
  unitName: string
  unit: string
  count: number
  completionRate: number
  status: string
}

// ==================== 상수 ====================

const UNIT_CATEGORIES = ['지휘관', '부지휘관', '참모장', '주임원사', '작전처장', '정보처장', '군수처장']
const ACTIVITY_CATEGORIES = ['작전', '훈련', '행사', '기타']
const APPROVAL_STATUSES = ['작성중', '결재대기', '승인', '반려']
const FLAG_TYPES = ['부대기', '부대마크']
const AUTH_ROLES = ['계보담당', '중간결재자', '확인관', '부대관리자']
const RANKS = ['대령', '중령', '소령', '대위', '중위', '소위', '원사', '상사', '중사']
const UNITS = ['해군사령부', '1함대', '2함대', '3함대', '기뢰전전대', '잠수함전대', '항공전대', '해병대사령부']

const NAVY_UNITS = [
  { key: 'fleet-1', title: '제1함대', level: 1, parent: null },
  { key: 'fleet-2', title: '제2함대', level: 1, parent: null },
  { key: 'fleet-3', title: '제3함대', level: 1, parent: null },
]

// ==================== 트리 생성 ====================

let _nodeCounter = 0

export function buildTreeNode(title: string, depth: number, maxDepth: number): UnitTreeNode {
  const node: UnitTreeNode = {
    key: `unit-${++_nodeCounter}-${faker.string.alphanumeric(6)}`,
    title,
  }
  if (depth < maxDepth) {
    const childCount = depth === 0 ? 3 : faker.number.int({ min: 1, max: 3 })
    const childTitles =
      depth === 0
        ? ['제1전단', '제2전단', '제3전단']
        : depth === 1
          ? ['함정A', '함정B', '함정C'].slice(0, childCount)
          : [`${title}-분대${childCount}`]
    node.children = childTitles.slice(0, childCount).map((t) => buildTreeNode(t, depth + 1, maxDepth))
  }
  return node
}

// 트리 데이터 생성 (3~4단 계층)
const unitTree: UnitTreeNode[] = NAVY_UNITS.map((u) => buildTreeNode(u.title, 0, 2))

// ==================== Mock 데이터 ====================

let unitRecords: UnitRecord[] = Array.from({ length: 20 }, (_, i) => ({
  id: `rec-${i + 1}`,
  unitName: `${UNITS[i % UNITS.length]}`,
  unitCode: `UNIT-${String(i + 1).padStart(4, '0')}`,
  establishDate: faker.date.past({ years: 30 }).toISOString().split('T')[0],
  dissolveDate: i % 5 === 0 ? faker.date.past({ years: 5 }).toISOString().split('T')[0] : undefined,
  location: `${faker.location.city()} ${faker.location.streetAddress()}`,
  remarks: faker.lorem.sentence(),
}))

let unitLineages: UnitLineage[] = Array.from({ length: 30 }, (_, i) => ({
  id: `lineage-${i + 1}`,
  unitId: `unit-${(i % 8) + 1}`,
  lineageNo: `LIN-${String(i + 1).padStart(3, '0')}`,
  unitName: `${UNITS[i % UNITS.length]}`,
  establishDate: faker.date.past({ years: 20 }).toISOString().split('T')[0],
  relatedOrg: faker.company.name(),
}))

let unitKeyPersons: UnitKeyPerson[] = Array.from({ length: 25 }, (_, i) => ({
  id: `person-${i + 1}`,
  unitId: `unit-${(i % 8) + 1}`,
  category: UNIT_CATEGORIES[i % UNIT_CATEGORIES.length],
  name: faker.person.fullName(),
  rank: RANKS[i % RANKS.length],
  termStart: faker.date.past({ years: 3 }).toISOString().split('T')[0],
  termEnd: faker.date.future({ years: 1 }).toISOString().split('T')[0],
  remarks: faker.lorem.sentence(),
}))

let unitActivities: UnitActivity[] = Array.from({ length: 30 }, (_, i) => ({
  id: `act-${i + 1}`,
  unitId: `unit-${(i % 8) + 1}`,
  activityName: `${ACTIVITY_CATEGORIES[i % ACTIVITY_CATEGORIES.length]} ${faker.lorem.words(2)}`,
  category: ACTIVITY_CATEGORIES[i % ACTIVITY_CATEGORIES.length],
  activityDate: faker.date.past({ years: 2 }).toISOString().split('T')[0],
  location: faker.location.city(),
  description: faker.lorem.paragraph(),
  approvalStatus: APPROVAL_STATUSES[i % APPROVAL_STATUSES.length],
  attachFile: i % 3 === 0 ? `attachment_${i + 1}.pdf` : undefined,
}))

let unitFlags: UnitFlag[] = Array.from({ length: 16 }, (_, i) => ({
  id: `flag-${i + 1}`,
  unitId: `unit-${(i % 8) + 1}`,
  unitName: UNITS[i % UNITS.length],
  flagType: FLAG_TYPES[i % FLAG_TYPES.length],
  revisionDate: faker.date.past({ years: 5 }).toISOString().split('T')[0],
  imageBase64: undefined,
  remarks: faker.lorem.sentence(),
}))

let authRequests: UnitAuthRequest[] = Array.from({ length: 15 }, (_, i) => ({
  id: `auth-req-${i + 1}`,
  requestUnit: UNITS[i % UNITS.length],
  requestRole: AUTH_ROLES[i % AUTH_ROLES.length],
  reason: faker.lorem.sentence(),
  status: ['신청', '승인', '반려'][i % 3],
  requestedAt: faker.date.past({ years: 1 }).toISOString().split('T')[0],
  processedAt: i % 3 !== 0 ? faker.date.past({ years: 0.5 }).toISOString().split('T')[0] : undefined,
  processedBy: i % 3 !== 0 ? faker.person.fullName() : undefined,
  rejectReason: i % 3 === 2 ? faker.lorem.sentence() : undefined,
}))

const authViews: UnitAuthView[] = Array.from({ length: 20 }, (_, i) => ({
  id: `auth-view-${i + 1}`,
  userName: faker.person.fullName(),
  rank: RANKS[i % RANKS.length],
  unit: UNITS[i % UNITS.length],
  role: AUTH_ROLES[i % AUTH_ROLES.length],
  assignedAt: faker.date.past({ years: 1 }).toISOString().split('T')[0],
  assignedBy: faker.person.fullName(),
}))

// ==================== 헬퍼 ====================

function paginate<T>(items: T[], page: number, size: number): PageResponse<T> {
  const start = page * size
  return {
    content: items.slice(start, start + size),
    totalElements: items.length,
    totalPages: Math.ceil(items.length / size),
    size,
    number: page,
  }
}

function ok<T>(data: T): ApiResult<T> {
  return { code: 'SUCCESS', message: '조회 성공', data }
}

// ==================== 핸들러 ====================

export const sys08Handlers = [
  // ==================== 부대 트리 ====================
  http.get('/api/sys08/unit-tree', () => {
    return HttpResponse.json(ok(unitTree))
  }),

  // ==================== 부대기록부 ====================
  http.get('/api/sys08/unit-records', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    const keyword = url.searchParams.get('keyword')

    let filtered = unitRecords
    if (keyword) filtered = filtered.filter((r) => r.unitName.includes(keyword))

    return HttpResponse.json(ok(paginate(filtered, page, size)))
  }),

  http.post('/api/sys08/unit-records', async ({ request }) => {
    const body = (await request.json()) as Partial<UnitRecord>
    const newRec: UnitRecord = {
      id: `rec-${Date.now()}`,
      unitName: (body.unitName as string) ?? '',
      unitCode: (body.unitCode as string) ?? `UNIT-${Date.now()}`,
      establishDate: (body.establishDate as string) ?? new Date().toISOString().split('T')[0],
      dissolveDate: body.dissolveDate as string | undefined,
      location: (body.location as string) ?? '',
      remarks: (body.remarks as string) ?? '',
    }
    unitRecords = [...unitRecords, newRec]
    return HttpResponse.json({ code: 'SUCCESS', message: '등록 성공', data: newRec })
  }),

  http.put('/api/sys08/unit-records/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<UnitRecord>
    unitRecords = unitRecords.map((r) => (r.id === params.id ? { ...r, ...body } : r))
    const updated = unitRecords.find((r) => r.id === params.id)
    return HttpResponse.json({ code: 'SUCCESS', message: '수정 성공', data: updated })
  }),

  http.delete('/api/sys08/unit-records/:id', ({ params }) => {
    unitRecords = unitRecords.filter((r) => r.id !== params.id)
    return HttpResponse.json({ code: 'SUCCESS', message: '삭제 성공', data: null })
  }),

  // ==================== 제원/계승부대 ====================
  http.get('/api/sys08/lineage', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    const unitId = url.searchParams.get('unitId')

    let filtered = unitLineages
    if (unitId) filtered = filtered.filter((l) => l.unitId === unitId)

    return HttpResponse.json(ok(paginate(filtered, page, size)))
  }),

  http.post('/api/sys08/lineage', async ({ request }) => {
    const body = (await request.json()) as Partial<UnitLineage>
    const newLineage: UnitLineage = {
      id: `lineage-${Date.now()}`,
      unitId: (body.unitId as string) ?? '',
      lineageNo: (body.lineageNo as string) ?? `LIN-${Date.now()}`,
      unitName: (body.unitName as string) ?? '',
      establishDate: (body.establishDate as string) ?? new Date().toISOString().split('T')[0],
      relatedOrg: (body.relatedOrg as string) ?? '',
    }
    unitLineages = [...unitLineages, newLineage]
    return HttpResponse.json({ code: 'SUCCESS', message: '등록 성공', data: newLineage })
  }),

  http.put('/api/sys08/lineage/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<UnitLineage>
    unitLineages = unitLineages.map((l) => (l.id === params.id ? { ...l, ...body } : l))
    const updated = unitLineages.find((l) => l.id === params.id)
    return HttpResponse.json({ code: 'SUCCESS', message: '수정 성공', data: updated })
  }),

  http.delete('/api/sys08/lineage/:id', ({ params }) => {
    unitLineages = unitLineages.filter((l) => l.id !== params.id)
    return HttpResponse.json({ code: 'SUCCESS', message: '삭제 성공', data: null })
  }),

  // ==================== 주요직위자 ====================
  http.get('/api/sys08/key-persons', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    const keyword = url.searchParams.get('keyword')
    const category = url.searchParams.get('category')

    let filtered = unitKeyPersons
    if (keyword) filtered = filtered.filter((p) => p.name.includes(keyword) || p.rank.includes(keyword))
    if (category) filtered = filtered.filter((p) => p.category === category)

    return HttpResponse.json(ok(paginate(filtered, page, size)))
  }),

  http.get('/api/sys08/key-persons/:id/history', ({ params }) => {
    const history: UnitKeyPersonHistory[] = Array.from({ length: 5 }, (_, i) => ({
      id: `hist-${i + 1}`,
      personId: params.id as string,
      category: UNIT_CATEGORIES[i % UNIT_CATEGORIES.length],
      name: faker.person.fullName(),
      rank: RANKS[i % RANKS.length],
      termStart: faker.date.past({ years: 5 }).toISOString().split('T')[0],
      termEnd: faker.date.past({ years: 1 }).toISOString().split('T')[0],
      changedAt: faker.date.past({ years: 1 }).toISOString().split('T')[0],
    }))
    return HttpResponse.json(ok(history))
  }),

  http.post('/api/sys08/key-persons', async ({ request }) => {
    const body = (await request.json()) as Partial<UnitKeyPerson>
    const newPerson: UnitKeyPerson = {
      id: `person-${Date.now()}`,
      unitId: (body.unitId as string) ?? '',
      category: (body.category as string) ?? '',
      name: (body.name as string) ?? '',
      rank: (body.rank as string) ?? '',
      termStart: (body.termStart as string) ?? new Date().toISOString().split('T')[0],
      termEnd: (body.termEnd as string) ?? '',
      remarks: (body.remarks as string) ?? '',
    }
    unitKeyPersons = [...unitKeyPersons, newPerson]
    return HttpResponse.json({ code: 'SUCCESS', message: '등록 성공', data: newPerson })
  }),

  http.put('/api/sys08/key-persons/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<UnitKeyPerson>
    unitKeyPersons = unitKeyPersons.map((p) => (p.id === params.id ? { ...p, ...body } : p))
    const updated = unitKeyPersons.find((p) => p.id === params.id)
    return HttpResponse.json({ code: 'SUCCESS', message: '수정 성공', data: updated })
  }),

  http.delete('/api/sys08/key-persons/:id', ({ params }) => {
    unitKeyPersons = unitKeyPersons.filter((p) => p.id !== params.id)
    return HttpResponse.json({ code: 'SUCCESS', message: '삭제 성공', data: null })
  }),

  // ==================== 주요활동 ====================
  http.get('/api/sys08/activities', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    const category = url.searchParams.get('category')
    const keyword = url.searchParams.get('keyword')

    let filtered = unitActivities
    if (category) filtered = filtered.filter((a) => a.category === category)
    if (keyword) filtered = filtered.filter((a) => a.activityName.includes(keyword))

    return HttpResponse.json(ok(paginate(filtered, page, size)))
  }),

  http.post('/api/sys08/activities', async ({ request }) => {
    const body = (await request.json()) as Partial<UnitActivity>
    const newAct: UnitActivity = {
      id: `act-${Date.now()}`,
      unitId: (body.unitId as string) ?? '',
      activityName: (body.activityName as string) ?? '',
      category: (body.category as string) ?? '',
      activityDate: (body.activityDate as string) ?? new Date().toISOString().split('T')[0],
      location: (body.location as string) ?? '',
      description: (body.description as string) ?? '',
      approvalStatus: '작성중',
      attachFile: body.attachFile as string | undefined,
    }
    unitActivities = [...unitActivities, newAct]
    return HttpResponse.json({ code: 'SUCCESS', message: '등록 성공', data: newAct })
  }),

  http.put('/api/sys08/activities/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<UnitActivity>
    unitActivities = unitActivities.map((a) => (a.id === params.id ? { ...a, ...body } : a))
    const updated = unitActivities.find((a) => a.id === params.id)
    return HttpResponse.json({ code: 'SUCCESS', message: '수정 성공', data: updated })
  }),

  http.delete('/api/sys08/activities/:id', ({ params }) => {
    unitActivities = unitActivities.filter((a) => a.id !== params.id)
    return HttpResponse.json({ code: 'SUCCESS', message: '삭제 성공', data: null })
  }),

  // 일괄등록 검증
  http.post('/api/sys08/activities/bulk-validate', async () => {
    const valid = Array.from({ length: faker.number.int({ min: 3, max: 10 }) }, (_, i) => ({
      row: i + 2,
      data: { activityName: `활동 ${i + 1}`, category: ACTIVITY_CATEGORIES[i % ACTIVITY_CATEGORIES.length] },
    }))
    const errors = faker.datatype.boolean()
      ? [{ row: 3, column: 'activityDate', errorMessage: '활동일자 형식이 잘못되었습니다' }]
      : []
    return HttpResponse.json({ code: 'SUCCESS', message: '검증 완료', data: { valid, errors } })
  }),

  http.post('/api/sys08/activities/bulk-save', async ({ request }) => {
    const body = (await request.json()) as { items?: unknown[] }
    const count = body.items?.length ?? 0
    return HttpResponse.json({ code: 'SUCCESS', message: `${count}건 저장 성공`, data: { savedCount: count } })
  }),

  // ==================== 주요활동 결재 ====================
  http.get('/api/sys08/activity-approvals', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    const statusFilter = url.searchParams.get('approvalStatus')

    let filtered = unitActivities.filter((a) => a.approvalStatus !== '작성중')
    if (statusFilter) filtered = filtered.filter((a) => a.approvalStatus === statusFilter)

    return HttpResponse.json(ok(paginate(filtered, page, size)))
  }),

  http.put('/api/sys08/activity-approvals/:id/approve', ({ params }) => {
    unitActivities = unitActivities.map((a) =>
      a.id === params.id ? { ...a, approvalStatus: '승인' } : a,
    )
    return HttpResponse.json({ code: 'SUCCESS', message: '승인 처리되었습니다', data: null })
  }),

  http.put('/api/sys08/activity-approvals/:id/reject', async ({ params, request }) => {
    const body = (await request.json()) as { reason?: string }
    unitActivities = unitActivities.map((a) =>
      a.id === params.id ? { ...a, approvalStatus: '반려', rejectReason: body.reason } : a,
    )
    return HttpResponse.json({ code: 'SUCCESS', message: '반려 처리되었습니다', data: null })
  }),

  // ==================== 부대기/부대마크 ====================
  http.get('/api/sys08/flags', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    const flagType = url.searchParams.get('flagType')

    let filtered = unitFlags
    if (flagType) filtered = filtered.filter((f) => f.flagType === flagType)

    return HttpResponse.json(ok(paginate(filtered, page, size)))
  }),

  http.post('/api/sys08/flags', async ({ request }) => {
    const body = (await request.json()) as Partial<UnitFlag>
    const newFlag: UnitFlag = {
      id: `flag-${Date.now()}`,
      unitId: (body.unitId as string) ?? '',
      unitName: (body.unitName as string) ?? '',
      flagType: (body.flagType as string) ?? '부대기',
      revisionDate: (body.revisionDate as string) ?? new Date().toISOString().split('T')[0],
      imageBase64: body.imageBase64 as string | undefined,
      remarks: (body.remarks as string) ?? '',
    }
    unitFlags = [...unitFlags, newFlag]
    return HttpResponse.json({ code: 'SUCCESS', message: '등록 성공', data: newFlag })
  }),

  http.put('/api/sys08/flags/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<UnitFlag>
    unitFlags = unitFlags.map((f) => (f.id === params.id ? { ...f, ...body } : f))
    const updated = unitFlags.find((f) => f.id === params.id)
    return HttpResponse.json({ code: 'SUCCESS', message: '수정 성공', data: updated })
  }),

  http.delete('/api/sys08/flags/:id', ({ params }) => {
    unitFlags = unitFlags.filter((f) => f.id !== params.id)
    return HttpResponse.json({ code: 'SUCCESS', message: '삭제 성공', data: null })
  }),

  // ==================== 권한신청 ====================
  http.post('/api/sys08/auth-request', async ({ request }) => {
    const body = (await request.json()) as Partial<UnitAuthRequest>
    const newReq: UnitAuthRequest = {
      id: `auth-req-${Date.now()}`,
      requestUnit: (body.requestUnit as string) ?? '',
      requestRole: (body.requestRole as string) ?? '',
      reason: (body.reason as string) ?? '',
      status: '신청',
      requestedAt: new Date().toISOString().split('T')[0],
    }
    authRequests = [...authRequests, newReq]
    return HttpResponse.json({ code: 'SUCCESS', message: '권한신청이 완료되었습니다', data: newReq })
  }),

  http.get('/api/sys08/auth-requests', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)

    return HttpResponse.json(ok(paginate(authRequests, page, size)))
  }),

  // ==================== 권한관리 (관리자) ====================
  http.get('/api/sys08/auth-mgmt', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)

    return HttpResponse.json(ok(paginate(authRequests, page, size)))
  }),

  http.put('/api/sys08/auth-mgmt/:id/approve', ({ params }) => {
    authRequests = authRequests.map((r) =>
      r.id === params.id
        ? { ...r, status: '승인', processedAt: new Date().toISOString().split('T')[0], processedBy: '관리자' }
        : r,
    )
    return HttpResponse.json({ code: 'SUCCESS', message: '승인 처리되었습니다', data: null })
  }),

  http.put('/api/sys08/auth-mgmt/:id/reject', async ({ params, request }) => {
    const body = (await request.json()) as { rejectReason?: string }
    authRequests = authRequests.map((r) =>
      r.id === params.id
        ? {
            ...r,
            status: '반려',
            processedAt: new Date().toISOString().split('T')[0],
            processedBy: '관리자',
            rejectReason: body.rejectReason,
          }
        : r,
    )
    return HttpResponse.json({ code: 'SUCCESS', message: '반려 처리되었습니다', data: null })
  }),

  // ==================== 권한조회 ====================
  http.get('/api/sys08/auth-view', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    const unit = url.searchParams.get('unit')

    let filtered = authViews
    if (unit) filtered = filtered.filter((v) => v.unit === unit)

    return HttpResponse.json(ok(paginate(filtered, page, size)))
  }),

  // ==================== 통계 ====================
  http.get('/api/sys08/stats', ({ request }) => {
    const url = new URL(request.url)
    const type = url.searchParams.get('type') ?? '주요직위자입력현황'

    const statsData: UnitStats[] = UNITS.map((unit, i) => ({
      id: `stat-${i + 1}`,
      unitName: unit,
      unit,
      count: faker.number.int({ min: 0, max: 50 }),
      completionRate: faker.number.int({ min: 10, max: 100 }),
      status: faker.datatype.boolean() ? '완료' : '미완료',
    }))

    const chartData = UNITS.map((unit, i) => ({
      unit,
      value: faker.number.int({ min: 5, max: 100 }),
      type,
      index: i,
    }))

    return HttpResponse.json(ok({ type, table: statsData, chart: chartData }))
  }),
]
