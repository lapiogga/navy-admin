import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker/locale/ko'
import type { ApiResult, PageResponse } from '@/shared/api/types'

// 타입 정의
export type SecurityLevel = 'secret' | 'confidential' | 'normal'
export type DocumentStatus = 'active' | 'on_loan' | 'evaluation' | 'disposed'
export type UsageType = 'loan' | 'view' | 'checkout'
export type UsageStatus = 'pending' | 'approved' | 'on_loan' | 'returned' | 'rejected'

export interface MilDocument extends Record<string, unknown> {
  id: string
  securityLevel: SecurityLevel
  storageType: string
  docNumber: string
  docType: string
  transferDate: string
  title: string
  author: string
  retentionPeriod: number
  retentionExpireDate: string
  pages: number
  status: DocumentStatus
  registeredAt: string
  attachFile: string
  remarks: string
  storageLocation: string
}

export interface MilDocUsage extends Record<string, unknown> {
  id: string
  usageType: UsageType
  docId: string
  docTitle: string
  securityLevel: SecurityLevel
  userName: string
  militaryId: string
  rank: string
  position: string
  unit: string
  phone: string
  usagePurpose: string
  usageDate: string
  returnDueDate: string
  returnDate?: string
  status: UsageStatus
  rejectReason?: string
}

export interface HaegidanDoc extends Record<string, unknown> {
  id: string
  department: string
  managerPosition: string
  fileFolder: string
  title: string
  dataType: string
  publisher: string
  securityLevel: SecurityLevel
  publishYear: string
  storageLocation: string
  pages: number
  registeredAt: string
  remarks: string
}

export interface EvaluationItem extends Record<string, unknown> {
  id: string
  securityLevel: SecurityLevel
  docNumber: string
  title: string
  retentionExpireDate: string
  status: DocumentStatus
  evaluationResult?: 'dispose' | 'extend'
  newRetentionDate?: string
}

const STORAGE_TYPES = ['금고보관', '서가보관', '전산보관']
const DOC_TYPES = ['훈령', '예규', '지시', '일반문서', '보고서']
const STORAGE_LOCATIONS = ['본부 비밀취급소', '1사단 보관소', '2사단 보관소', '교육훈련단']
const DEPARTMENTS = ['작전처', '정보처', '인사처', '군수처', '기획처']
const UNITS = ['해병대사령부', '1사단', '2사단', '교육훈련단', '상륙기동단']
const RANKS = ['대령', '중령', '소령', '대위', '중위', '소위', '원사', '상사']
const POSITIONS = ['참모장', '처장', '과장', '팀장', '실무자']
const DATA_TYPES = ['전술교범', '기술교범', '훈련교재', '연구자료', '참고자료']

// 오늘 기준 과거 2년 내 날짜
function pastDate(years = 2): string {
  return faker.date.past({ years }).toISOString().split('T')[0]
}

// 보존만료일: 일부는 과거(평가심의 대상)
function retentionExpireDate(isExpired = false): string {
  if (isExpired) {
    return faker.date.past({ years: 1 }).toISOString().split('T')[0]
  }
  return faker.date.future({ years: 3 }).toISOString().split('T')[0]
}

// Mock 데이터: 군사자료 30건
let milDocuments: MilDocument[] = Array.from({ length: 30 }, (_, i) => {
  const expired = i < 8 // 8건은 보존기간 만료
  return {
    id: `doc-${i + 1}`,
    securityLevel: (['secret', 'confidential', 'normal'] as SecurityLevel[])[i % 3],
    storageType: STORAGE_TYPES[i % STORAGE_TYPES.length],
    docNumber: `DOC-${String(2024 - Math.floor(i / 5)).padStart(4, '0')}-${String(i + 1).padStart(3, '0')}`,
    docType: DOC_TYPES[i % DOC_TYPES.length],
    transferDate: pastDate(3),
    title: `${DOC_TYPES[i % DOC_TYPES.length]} ${faker.lorem.words(3)}`,
    author: faker.person.fullName(),
    retentionPeriod: [5, 10, 15, 20, 30][i % 5],
    retentionExpireDate: retentionExpireDate(expired),
    pages: faker.number.int({ min: 10, max: 500 }),
    status: expired ? 'evaluation' : (['active', 'on_loan', 'active', 'active'] as DocumentStatus[])[i % 4],
    registeredAt: pastDate(),
    attachFile: `attachment_${i + 1}.pdf`,
    remarks: faker.lorem.sentence(),
    storageLocation: STORAGE_LOCATIONS[i % STORAGE_LOCATIONS.length],
  }
})

// Mock 데이터: 활용 20건
let milUsages: MilDocUsage[] = Array.from({ length: 20 }, (_, i) => {
  const doc = milDocuments[i % milDocuments.length]
  const statuses: UsageStatus[] = ['pending', 'approved', 'on_loan', 'returned', 'rejected']
  const status = statuses[i % statuses.length]
  return {
    id: `usage-${i + 1}`,
    usageType: (['loan', 'view', 'checkout'] as UsageType[])[i % 3],
    docId: doc.id,
    docTitle: doc.title,
    securityLevel: doc.securityLevel,
    userName: faker.person.fullName(),
    militaryId: faker.string.numeric(8),
    rank: RANKS[i % RANKS.length],
    position: POSITIONS[i % POSITIONS.length],
    unit: UNITS[i % UNITS.length],
    phone: `010-${faker.string.numeric(4)}-${faker.string.numeric(4)}`,
    usagePurpose: faker.lorem.sentence(),
    usageDate: pastDate(),
    returnDueDate: faker.date.future({ years: 0.1 }).toISOString().split('T')[0],
    returnDate: status === 'returned' ? pastDate() : undefined,
    status,
    rejectReason: status === 'rejected' ? faker.lorem.sentence() : undefined,
  }
})

// Mock 데이터: 해기단 자료 20건
let haegidanDocs: HaegidanDoc[] = Array.from({ length: 20 }, (_, i) => ({
  id: `haegi-${i + 1}`,
  department: DEPARTMENTS[i % DEPARTMENTS.length],
  managerPosition: POSITIONS[i % POSITIONS.length],
  fileFolder: `F${String(i + 1).padStart(3, '0')}`,
  title: `해기단 ${DATA_TYPES[i % DATA_TYPES.length]} ${faker.lorem.words(2)}`,
  dataType: DATA_TYPES[i % DATA_TYPES.length],
  publisher: faker.person.fullName(),
  securityLevel: (['secret', 'confidential', 'normal'] as SecurityLevel[])[i % 3],
  publishYear: String(2020 + (i % 5)),
  storageLocation: STORAGE_LOCATIONS[i % STORAGE_LOCATIONS.length],
  pages: faker.number.int({ min: 20, max: 300 }),
  registeredAt: pastDate(),
  remarks: faker.lorem.sentence(),
}))

// 변경이력 Mock
const CHANGE_HISTORY = Array.from({ length: 5 }, (_, i) => ({
  id: `hist-${i + 1}`,
  changedAt: pastDate(),
  changedBy: faker.person.fullName(),
  changedField: ['securityLevel', 'status', 'storageLocation', 'remarks', 'retentionPeriod'][i],
  before: faker.lorem.word(),
  after: faker.lorem.word(),
}))

// 페이지네이션 헬퍼
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

export const sys07Handlers = [
  // ==================== 군사자료 ====================
  // 목록 조회
  http.get('/api/sys07/documents', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    const securityLevel = url.searchParams.get('securityLevel')
    const keyword = url.searchParams.get('keyword')
    const status = url.searchParams.get('status')

    let filtered = milDocuments
    if (securityLevel) filtered = filtered.filter((d) => d.securityLevel === securityLevel)
    if (keyword) filtered = filtered.filter((d) => d.title.includes(keyword) || d.author.includes(keyword))
    if (status) filtered = filtered.filter((d) => d.status === status)

    const result: ApiResult<PageResponse<MilDocument>> = {
      code: 'SUCCESS',
      message: '조회 성공',
      data: paginate(filtered, page, size),
    }
    return HttpResponse.json(result)
  }),

  // 단건 조회 + 변경이력
  http.get('/api/sys07/documents/:id', ({ params }) => {
    const doc = milDocuments.find((d) => d.id === params.id)
    if (!doc) return HttpResponse.json({ code: 'NOT_FOUND', message: '자료를 찾을 수 없습니다', data: null }, { status: 404 })
    const result: ApiResult<{ doc: MilDocument; history: typeof CHANGE_HISTORY }> = {
      code: 'SUCCESS',
      message: '조회 성공',
      data: { doc, history: CHANGE_HISTORY },
    }
    return HttpResponse.json(result)
  }),

  // 등록
  http.post('/api/sys07/documents', async ({ request }) => {
    const body = (await request.json()) as Partial<MilDocument>
    const newDoc: MilDocument = {
      id: `doc-${Date.now()}`,
      securityLevel: (body.securityLevel as SecurityLevel) ?? 'normal',
      storageType: (body.storageType as string) ?? '',
      docNumber: (body.docNumber as string) ?? `DOC-${Date.now()}`,
      docType: (body.docType as string) ?? '',
      transferDate: (body.transferDate as string) ?? new Date().toISOString().split('T')[0],
      title: (body.title as string) ?? '',
      author: (body.author as string) ?? '',
      retentionPeriod: (body.retentionPeriod as number) ?? 5,
      retentionExpireDate: (body.retentionExpireDate as string) ?? '',
      pages: (body.pages as number) ?? 0,
      status: 'active',
      registeredAt: new Date().toISOString().split('T')[0],
      attachFile: (body.attachFile as string) ?? '',
      remarks: (body.remarks as string) ?? '',
      storageLocation: (body.storageLocation as string) ?? '',
    }
    milDocuments = [...milDocuments, newDoc]
    return HttpResponse.json({ code: 'SUCCESS', message: '등록 성공', data: newDoc })
  }),

  // 수정
  http.put('/api/sys07/documents/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<MilDocument>
    milDocuments = milDocuments.map((d) => (d.id === params.id ? { ...d, ...body } : d))
    const updated = milDocuments.find((d) => d.id === params.id)
    return HttpResponse.json({ code: 'SUCCESS', message: '수정 성공', data: updated })
  }),

  // 삭제 (deleteReason 필수)
  http.delete('/api/sys07/documents/:id', async ({ params, request }) => {
    const body = (await request.json()) as { deleteReason?: string }
    if (!body.deleteReason) {
      return HttpResponse.json({ code: 'BAD_REQUEST', message: '삭제 사유를 입력하세요', data: null }, { status: 400 })
    }
    milDocuments = milDocuments.filter((d) => d.id !== params.id)
    return HttpResponse.json({ code: 'SUCCESS', message: '삭제 성공', data: null })
  }),

  // 일괄등록 검증
  http.post('/api/sys07/documents/bulk-validate', async () => {
    const valid = Array.from({ length: faker.number.int({ min: 5, max: 15 }) }, (_, i) => ({
      row: i + 2,
      data: { title: `자료 ${i + 1}`, docNumber: `BULK-${i + 1}` },
    }))
    const errors = faker.datatype.boolean()
      ? [
          { row: 3, column: 'securityLevel', errorMessage: '비밀등급 값이 올바르지 않습니다' },
          { row: 7, column: 'transferDate', errorMessage: '이관일자 형식이 잘못되었습니다' },
        ]
      : []
    return HttpResponse.json({ code: 'SUCCESS', message: '검증 완료', data: { valid, errors } })
  }),

  // 일괄 저장
  http.post('/api/sys07/documents/bulk-save', async ({ request }) => {
    const body = (await request.json()) as { items?: unknown[] }
    const count = body.items?.length ?? 0
    return HttpResponse.json({ code: 'SUCCESS', message: `${count}건 저장 성공`, data: { savedCount: count } })
  }),

  // ==================== 평가심의 ====================
  http.get('/api/sys07/evaluations', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    const securityLevel = url.searchParams.get('securityLevel')
    const keyword = url.searchParams.get('keyword')

    // 보존기간 만료 자료 필터
    const today = new Date().toISOString().split('T')[0]
    let expired = milDocuments
      .filter((d) => d.retentionExpireDate < today || d.status === 'evaluation')
      .map<EvaluationItem>((d) => ({
        id: d.id,
        securityLevel: d.securityLevel,
        docNumber: d.docNumber,
        title: d.title,
        retentionExpireDate: d.retentionExpireDate,
        status: d.status,
        evaluationResult: undefined,
        newRetentionDate: undefined,
      }))

    if (securityLevel) expired = expired.filter((d) => d.securityLevel === securityLevel)
    if (keyword) expired = expired.filter((d) => d.title.includes(keyword))

    const result: ApiResult<PageResponse<EvaluationItem>> = {
      code: 'SUCCESS',
      message: '조회 성공',
      data: paginate(expired, page, size),
    }
    return HttpResponse.json(result)
  }),

  // 평가심의 결과 일괄 업로드
  http.post('/api/sys07/evaluations/bulk-upload', async ({ request }) => {
    const body = (await request.json()) as { items?: Array<{ id: string; result: 'dispose' | 'extend'; newRetentionDate?: string }> }
    const items = body.items ?? []
    items.forEach(({ id, result }) => {
      milDocuments = milDocuments.map((d) =>
        d.id === id ? { ...d, status: result === 'dispose' ? 'disposed' : 'active' } : d,
      )
    })
    return HttpResponse.json({ code: 'SUCCESS', message: `${items.length}건 처리 완료`, data: { processedCount: items.length } })
  }),

  // ==================== 활용 (대출/열람) ====================
  http.get('/api/sys07/usages', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    const usageType = url.searchParams.get('usageType')
    const status = url.searchParams.get('status')
    const keyword = url.searchParams.get('keyword')

    let filtered = milUsages
    if (usageType) filtered = filtered.filter((u) => u.usageType === usageType)
    if (status) filtered = filtered.filter((u) => u.status === status)
    if (keyword) filtered = filtered.filter((u) => u.userName.includes(keyword) || u.militaryId.includes(keyword))

    const result: ApiResult<PageResponse<MilDocUsage>> = {
      code: 'SUCCESS',
      message: '조회 성공',
      data: paginate(filtered, page, size),
    }
    return HttpResponse.json(result)
  }),

  // 활용 신청
  http.post('/api/sys07/usages', async ({ request }) => {
    const body = (await request.json()) as Partial<MilDocUsage>
    const newUsage: MilDocUsage = {
      id: `usage-${Date.now()}`,
      usageType: (body.usageType as UsageType) ?? 'view',
      docId: (body.docId as string) ?? '',
      docTitle: (body.docTitle as string) ?? '',
      securityLevel: (body.securityLevel as SecurityLevel) ?? 'normal',
      userName: (body.userName as string) ?? '',
      militaryId: (body.militaryId as string) ?? '',
      rank: (body.rank as string) ?? '',
      position: (body.position as string) ?? '',
      unit: (body.unit as string) ?? '',
      phone: (body.phone as string) ?? '',
      usagePurpose: (body.usagePurpose as string) ?? '',
      usageDate: new Date().toISOString().split('T')[0],
      returnDueDate: (body.returnDueDate as string) ?? '',
      status: 'pending',
    }
    milUsages = [...milUsages, newUsage]
    return HttpResponse.json({ code: 'SUCCESS', message: '신청 완료', data: newUsage })
  }),

  // 승인
  http.put('/api/sys07/usages/:id/approve', ({ params }) => {
    milUsages = milUsages.map((u) => (u.id === params.id ? { ...u, status: 'approved' as UsageStatus } : u))
    return HttpResponse.json({ code: 'SUCCESS', message: '승인 완료', data: null })
  }),

  // 반려
  http.put('/api/sys07/usages/:id/reject', async ({ params, request }) => {
    const body = (await request.json()) as { rejectReason?: string }
    milUsages = milUsages.map((u) =>
      u.id === params.id ? { ...u, status: 'rejected' as UsageStatus, rejectReason: body.rejectReason } : u,
    )
    return HttpResponse.json({ code: 'SUCCESS', message: '반려 완료', data: null })
  }),

  // 대출처리
  http.put('/api/sys07/usages/:id/loan', ({ params }) => {
    milUsages = milUsages.map((u) => (u.id === params.id ? { ...u, status: 'on_loan' as UsageStatus } : u))
    return HttpResponse.json({ code: 'SUCCESS', message: '대출처리 완료', data: null })
  }),

  // 반납처리
  http.put('/api/sys07/usages/:id/return', ({ params }) => {
    milUsages = milUsages.map((u) =>
      u.id === params.id
        ? { ...u, status: 'returned' as UsageStatus, returnDate: new Date().toISOString().split('T')[0] }
        : u,
    )
    return HttpResponse.json({ code: 'SUCCESS', message: '반납처리 완료', data: null })
  }),

  // ==================== 통계 ====================
  http.get('/api/sys07/stats/by-doc-type', () => {
    const data = DOC_TYPES.map((type) => ({
      docType: type,
      count: faker.number.int({ min: 10, max: 100 }),
    }))
    return HttpResponse.json({ code: 'SUCCESS', message: '조회 성공', data })
  }),

  http.get('/api/sys07/stats/by-security-level', () => {
    const data = [
      { securityLevel: 'secret', label: '비밀', count: faker.number.int({ min: 20, max: 50 }) },
      { securityLevel: 'confidential', label: '대외비', count: faker.number.int({ min: 30, max: 80 }) },
      { securityLevel: 'normal', label: '일반', count: faker.number.int({ min: 50, max: 150 }) },
    ]
    return HttpResponse.json({ code: 'SUCCESS', message: '조회 성공', data })
  }),

  http.get('/api/sys07/stats/usage-trend', ({ request }) => {
    const url = new URL(request.url)
    const year = url.searchParams.get('year') ?? '2024'
    const data = Array.from({ length: 12 }, (_, m) => ({
      month: `${year}-${String(m + 1).padStart(2, '0')}`,
      loan: faker.number.int({ min: 5, max: 30 }),
      view: faker.number.int({ min: 10, max: 50 }),
      checkout: faker.number.int({ min: 2, max: 15 }),
    }))
    return HttpResponse.json({ code: 'SUCCESS', message: '조회 성공', data })
  }),

  http.get('/api/sys07/stats/cross-tab', ({ request }) => {
    const url = new URL(request.url)
    const year = url.searchParams.get('year') ?? '2024'
    const data = (['secret', 'confidential', 'normal'] as SecurityLevel[]).map((level) => ({
      securityLevel: level,
      label: level === 'secret' ? '비밀' : level === 'confidential' ? '대외비' : '일반',
      year,
      active: faker.number.int({ min: 10, max: 50 }),
      on_loan: faker.number.int({ min: 1, max: 10 }),
      evaluation: faker.number.int({ min: 0, max: 5 }),
      disposed: faker.number.int({ min: 0, max: 20 }),
    }))
    return HttpResponse.json({ code: 'SUCCESS', message: '조회 성공', data })
  }),

  http.get('/api/sys07/stats/receipt-records', ({ request }) => {
    const url = new URL(request.url)
    const year = url.searchParams.get('baseYear') ?? '2024'
    const data = (['secret', 'confidential', 'normal'] as SecurityLevel[]).map((level) => ({
      id: `rec-${level}-${year}`,
      securityLevel: level,
      docStatus: '관리중',
      baseYear: year,
      totalCount: faker.number.int({ min: 20, max: 100 }),
      newCount: faker.number.int({ min: 5, max: 20 }),
      disposedCount: faker.number.int({ min: 0, max: 10 }),
      remainCount: faker.number.int({ min: 15, max: 90 }),
    }))
    return HttpResponse.json({ code: 'SUCCESS', message: '조회 성공', data })
  }),

  http.get('/api/sys07/stats/usage-records', ({ request }) => {
    const url = new URL(request.url)
    const year = url.searchParams.get('baseYear') ?? '2024'
    const data = (['loan', 'view', 'checkout'] as UsageType[]).flatMap((type) =>
      (['secret', 'confidential', 'normal'] as SecurityLevel[]).map((level) => ({
        id: `urec-${type}-${level}-${year}`,
        baseYear: year,
        securityLevel: level,
        usageType: type,
        totalCount: faker.number.int({ min: 10, max: 60 }),
        unitCount: faker.number.int({ min: 1, max: 10 }),
      })),
    )
    return HttpResponse.json({ code: 'SUCCESS', message: '조회 성공', data })
  }),

  // ==================== 해기단자료 ====================
  http.get('/api/sys07/haegidan', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    const department = url.searchParams.get('department')
    const keyword = url.searchParams.get('keyword')

    let filtered = haegidanDocs
    if (department) filtered = filtered.filter((d) => d.department === department)
    if (keyword) filtered = filtered.filter((d) => d.title.includes(keyword))

    const result: ApiResult<PageResponse<HaegidanDoc>> = {
      code: 'SUCCESS',
      message: '조회 성공',
      data: paginate(filtered, page, size),
    }
    return HttpResponse.json(result)
  }),

  http.get('/api/sys07/haegidan/:id', ({ params }) => {
    const doc = haegidanDocs.find((d) => d.id === params.id)
    if (!doc) return HttpResponse.json({ code: 'NOT_FOUND', message: '자료를 찾을 수 없습니다', data: null }, { status: 404 })
    return HttpResponse.json({ code: 'SUCCESS', message: '조회 성공', data: doc })
  }),

  http.post('/api/sys07/haegidan', async ({ request }) => {
    const body = (await request.json()) as Partial<HaegidanDoc>
    const newDoc: HaegidanDoc = {
      id: `haegi-${Date.now()}`,
      department: (body.department as string) ?? '',
      managerPosition: (body.managerPosition as string) ?? '',
      fileFolder: (body.fileFolder as string) ?? '',
      title: (body.title as string) ?? '',
      dataType: (body.dataType as string) ?? '',
      publisher: (body.publisher as string) ?? '',
      securityLevel: (body.securityLevel as SecurityLevel) ?? 'normal',
      publishYear: (body.publishYear as string) ?? String(new Date().getFullYear()),
      storageLocation: (body.storageLocation as string) ?? '',
      pages: (body.pages as number) ?? 0,
      registeredAt: new Date().toISOString().split('T')[0],
      remarks: (body.remarks as string) ?? '',
    }
    haegidanDocs = [...haegidanDocs, newDoc]
    return HttpResponse.json({ code: 'SUCCESS', message: '등록 성공', data: newDoc })
  }),

  http.put('/api/sys07/haegidan/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<HaegidanDoc>
    haegidanDocs = haegidanDocs.map((d) => (d.id === params.id ? { ...d, ...body } : d))
    const updated = haegidanDocs.find((d) => d.id === params.id)
    return HttpResponse.json({ code: 'SUCCESS', message: '수정 성공', data: updated })
  }),

  http.delete('/api/sys07/haegidan/:id', async ({ params, request }) => {
    const body = (await request.json()) as { deleteReason?: string }
    if (!body.deleteReason) {
      return HttpResponse.json({ code: 'BAD_REQUEST', message: '삭제 사유를 입력하세요', data: null }, { status: 400 })
    }
    haegidanDocs = haegidanDocs.filter((d) => d.id !== params.id)
    return HttpResponse.json({ code: 'SUCCESS', message: '삭제 성공', data: null })
  }),
]
