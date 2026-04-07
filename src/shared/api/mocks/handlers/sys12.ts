import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker/locale/ko'
import { randomServiceNumber } from '../mockServiceNumber'
import { MARINE_UNITS } from '../mockUnits'
import type { ApiResult, PageResponse } from '@/shared/api/types'

// 타입 정의
export type ProgressStatus = 'notStarted' | 'inProgress' | 'completed' | 'delayed'

export interface Directive extends Record<string, unknown> {
  id: string
  directiveNo: string
  // 지시자 (군번/계급/성명)
  directorServiceNumber: string
  directorRank: string
  directorName: string
  director: string
  directiveDate: string
  targetUnit: string
  content: string
  progressStatus: ProgressStatus
  category: string
  // 지시사항 종류 (문서/구두)
  directiveType: '문서' | '구두'
  attachments: string[]
  createdAt: string
}

export interface Proposal extends Record<string, unknown> {
  id: string
  proposalNo: string
  // 건의자 (군번/계급/성명)
  proposerServiceNumber: string
  proposerRank: string
  proposerName: string
  proposer: string
  proposalDate: string
  managingUnit: string
  content: string
  progressStatus: ProgressStatus
  category: string
  attachments: string[]
  createdAt: string
}

export interface ActionItem extends Record<string, unknown> {
  id: string
  parentId: string
  parentType: 'directive' | 'proposal'
  // 업무담당자 (군번/계급/성명)
  assigneeServiceNumber: string
  assigneeRank: string
  assigneeName: string
  assignee: string
  progressStatus: ProgressStatus
  plan: string
  result: string
  attachments: string[]
  createdAt: string
}

export interface ActionHistory extends Record<string, unknown> {
  id: string
  parentId: string
  date: string
  assignee: string
  status: string
  content: string
}

const UNITS = [...MARINE_UNITS]
const CATEGORIES = ['작전', '교육', '군수', '인사', '정보화']
const DIRECTORS = ['사령관', '참모장', '부사령관']
const STATUSES: ProgressStatus[] = ['notStarted', 'inProgress', 'completed', 'delayed']
const DIRECTIVE_TYPES: Array<'문서' | '구두'> = ['문서', '구두']
const RANKS = ['대령', '중령', '소령', '대위', '중위', '소위', '상사', '중사']

// 대통령 지시사항 내용 샘플
const PRESIDENTIAL_CONTENTS = [
  '국방개혁 2.0 추진 가속화 지시',
  '장병 복무여건 개선 대책 수립',
  '군 사이버 보안 강화 방안 마련',
  '방위산업 경쟁력 제고 방안 수립',
  '전시 작전계획 보완 지시',
  '군 의료체계 개선 추진',
  '예비전력 정예화 방안 수립',
  '국방 R&D 투자 확대 방안',
  '남북 군사합의 이행 점검',
  '군 인권 개선 종합대책 수립',
  '첨단 무기체계 전력화 가속',
  '장병 급식 질 향상 대책',
  '군 시설 현대화 추진 점검',
  '국방 예산 효율화 방안',
  '장병 정신전력 강화 지시',
]

// 국방부장관 지시사항 내용 샘플
const MINISTER_CONTENTS = [
  '해병대 상륙작전 능력 강화',
  '합동작전 수행체계 개선',
  '군수 물자 관리 효율화',
  '부대 안전관리 체계 점검',
  '군 간부 인사제도 개선',
  '전투준비태세 점검 강화',
  '군사보안 실태 점검',
  '방위력 개선사업 추진 현황 보고',
  '군 교육훈련 혁신 방안',
  '장병 사기 진작 방안 수립',
  '국방 정보화 추진 계획',
  '군 환경 보전 대책 수립',
  '예비군 훈련 체계 개선',
  '군 복지시설 확충 계획',
  '해외파병 부대 지원 강화',
]

// 지시사항 Mock 데이터 생성 공통 함수
function generateDirectives(prefix: string, count: number, contents: string[]): Directive[] {
  return Array.from({ length: count }, (_, i) => {
    const sn = randomServiceNumber()
    const rank = RANKS[i % RANKS.length]
    const name = faker.person.lastName() + faker.person.firstName()
    return {
      id: `${prefix}-${i + 1}`,
      directiveNo: `${prefix.toUpperCase()}-${2025}-${String(i + 1).padStart(3, '0')}`,
      directorServiceNumber: sn,
      directorRank: rank,
      directorName: name,
      director: `${sn} / ${rank} / ${name}`,
      directiveDate: faker.date.recent({ days: 180 }).toISOString().split('T')[0],
      targetUnit: UNITS[i % UNITS.length],
      content: contents[i % contents.length],
      progressStatus: STATUSES[i % STATUSES.length],
      category: CATEGORIES[i % CATEGORIES.length],
      directiveType: DIRECTIVE_TYPES[i % DIRECTIVE_TYPES.length],
      attachments: [],
      createdAt: faker.date.recent({ days: 180 }).toISOString(),
    }
  })
}

// 지시사항 Mock 데이터 20건
let directives: Directive[] = Array.from({ length: 20 }, (_, i) => {
  const sn = randomServiceNumber()
  const rank = RANKS[i % RANKS.length]
  const name = faker.person.lastName() + faker.person.firstName()
  return {
    id: `dir-${i + 1}`,
    directiveNo: `DIR-${2025}-${String(i + 1).padStart(3, '0')}`,
    directorServiceNumber: sn,
    directorRank: rank,
    directorName: name,
    director: `${sn} / ${rank} / ${name}`,
    directiveDate: faker.date.recent({ days: 180 }).toISOString().split('T')[0],
    targetUnit: UNITS[i % UNITS.length],
    content: faker.lorem.sentence(),
    progressStatus: STATUSES[i % STATUSES.length],
    category: CATEGORIES[i % CATEGORIES.length],
    directiveType: DIRECTIVE_TYPES[i % DIRECTIVE_TYPES.length],
    attachments: [],
    createdAt: faker.date.recent({ days: 180 }).toISOString(),
  }
})

// 건의사항 Mock 데이터 15건
let proposals: Proposal[] = Array.from({ length: 15 }, (_, i) => {
  const sn = randomServiceNumber()
  const rank = RANKS[i % RANKS.length]
  const name = faker.person.lastName() + faker.person.firstName()
  return {
    id: `prop-${i + 1}`,
    proposalNo: `PROP-${2025}-${String(i + 1).padStart(3, '0')}`,
    proposerServiceNumber: sn,
    proposerRank: rank,
    proposerName: name,
    proposer: `${sn} / ${rank} / ${name}`,
    proposalDate: faker.date.recent({ days: 180 }).toISOString().split('T')[0],
    managingUnit: UNITS[i % UNITS.length],
    content: faker.lorem.sentence(),
    progressStatus: STATUSES[i % STATUSES.length],
    category: CATEGORIES[i % CATEGORIES.length],
    attachments: [],
    createdAt: faker.date.recent({ days: 180 }).toISOString(),
  }
})

// 조치사항 Mock 데이터 30건
let actions: ActionItem[] = Array.from({ length: 30 }, (_, i) => {
  const sn = randomServiceNumber()
  const rank = RANKS[i % RANKS.length]
  const name = faker.person.lastName() + faker.person.firstName()
  return {
    id: `act-${i + 1}`,
    parentId: i < 20 ? `dir-${(i % 20) + 1}` : `prop-${(i % 15) + 1}`,
    parentType: (i < 20 ? 'directive' : 'proposal') as 'directive' | 'proposal',
    assigneeServiceNumber: sn,
    assigneeRank: rank,
    assigneeName: name,
    assignee: `${sn} / ${rank} / ${name}`,
    progressStatus: STATUSES[i % STATUSES.length],
    plan: faker.lorem.sentence(),
    result: faker.lorem.sentence(),
    attachments: [],
    createdAt: faker.date.recent({ days: 90 }).toISOString(),
  }
})

// 이력 Mock 데이터 60건
const histories: ActionHistory[] = Array.from({ length: 60 }, (_, i) => ({
  id: `hist-${i + 1}`,
  parentId: i < 30 ? `dir-${(i % 20) + 1}` : `prop-${(i % 15) + 1}`,
  date: faker.date.recent({ days: 90 }).toISOString().split('T')[0],
  assignee: faker.person.lastName() + faker.person.firstName(),
  status: ['미착수', '진행중', '완료', '지연'][i % 4],
  content: faker.lorem.sentence(),
}))

// 대통령 지시사항 Mock 데이터 15건
let presidentialDirectives: Directive[] = generateDirectives('pdir', 15, PRESIDENTIAL_CONTENTS)

// 국방부장관 지시사항 Mock 데이터 15건
let ministerDirectives: Directive[] = generateDirectives('mdir', 15, MINISTER_CONTENTS)

// 대통령 조치사항 Mock 데이터
let presidentialActions: ActionItem[] = Array.from({ length: 15 }, (_, i) => {
  const sn = randomServiceNumber()
  const rank = RANKS[i % RANKS.length]
  const name = faker.person.lastName() + faker.person.firstName()
  return {
    id: `pact-${i + 1}`,
    parentId: `pdir-${(i % 15) + 1}`,
    parentType: 'directive' as const,
    assigneeServiceNumber: sn,
    assigneeRank: rank,
    assigneeName: name,
    assignee: `${sn} / ${rank} / ${name}`,
    progressStatus: STATUSES[i % STATUSES.length],
    plan: faker.lorem.sentence(),
    result: faker.lorem.sentence(),
    attachments: [],
    createdAt: faker.date.recent({ days: 90 }).toISOString(),
  }
})

// 국방부장관 조치사항 Mock 데이터
let ministerActions: ActionItem[] = Array.from({ length: 15 }, (_, i) => {
  const sn = randomServiceNumber()
  const rank = RANKS[i % RANKS.length]
  const name = faker.person.lastName() + faker.person.firstName()
  return {
    id: `mact-${i + 1}`,
    parentId: `mdir-${(i % 15) + 1}`,
    parentType: 'directive' as const,
    assigneeServiceNumber: sn,
    assigneeRank: rank,
    assigneeName: name,
    assignee: `${sn} / ${rank} / ${name}`,
    progressStatus: STATUSES[i % STATUSES.length],
    plan: faker.lorem.sentence(),
    result: faker.lorem.sentence(),
    attachments: [],
    createdAt: faker.date.recent({ days: 90 }).toISOString(),
  }
})

// 대통령 이력 Mock 데이터
const presidentialHistories: ActionHistory[] = Array.from({ length: 30 }, (_, i) => ({
  id: `phist-${i + 1}`,
  parentId: `pdir-${(i % 15) + 1}`,
  date: faker.date.recent({ days: 90 }).toISOString().split('T')[0],
  assignee: faker.person.lastName() + faker.person.firstName(),
  status: ['미착수', '진행중', '완료', '지연'][i % 4],
  content: faker.lorem.sentence(),
}))

// 국방부장관 이력 Mock 데이터
const ministerHistories: ActionHistory[] = Array.from({ length: 30 }, (_, i) => ({
  id: `mhist-${i + 1}`,
  parentId: `mdir-${(i % 15) + 1}`,
  date: faker.date.recent({ days: 90 }).toISOString().split('T')[0],
  assignee: faker.person.lastName() + faker.person.firstName(),
  status: ['미착수', '진행중', '완료', '지연'][i % 4],
  content: faker.lorem.sentence(),
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

// 추진현황 통계 계산
function calcProgress(items: Array<{ progressStatus: ProgressStatus; category: string }>) {
  const total = items.length
  const completed = items.filter((i) => i.progressStatus === 'completed').length
  const inProgress = items.filter((i) => i.progressStatus === 'inProgress').length
  const notStarted = items.filter((i) => i.progressStatus === 'notStarted').length
  const delayed = items.filter((i) => i.progressStatus === 'delayed').length
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  const categoryStats = CATEGORIES.map((category) => {
    const catItems = items.filter((i) => i.category === category)
    const catTotal = catItems.length
    const catCompleted = catItems.filter((i) => i.progressStatus === 'completed').length
    const catInProgress = catItems.filter((i) => i.progressStatus === 'inProgress').length
    const catNotStarted = catItems.filter((i) => i.progressStatus === 'notStarted').length
    const catDelayed = catItems.filter((i) => i.progressStatus === 'delayed').length
    return {
      category,
      totalCount: catTotal,
      completedCount: catCompleted,
      inProgressCount: catInProgress,
      notStartedCount: catNotStarted,
      delayedCount: catDelayed,
      completionRate: catTotal > 0 ? Math.round((catCompleted / catTotal) * 100) : 0,
    }
  })

  return { total, completed, inProgress, notStarted, delayed, completionRate, categoryStats }
}

export const sys12Handlers = [
  // === 지시사항 목록 ===
  http.get('/api/sys12/directives', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    const progressStatus = url.searchParams.get('progressStatus') || ''
    const director = url.searchParams.get('director') || ''
    const keyword = url.searchParams.get('keyword') || ''
    const targetUnit = url.searchParams.get('targetUnit') || ''
    const directiveDateFrom = url.searchParams.get('directiveDateFrom') || ''
    const directiveDateTo = url.searchParams.get('directiveDateTo') || ''

    let filtered = [...directives]
    if (progressStatus) filtered = filtered.filter((d) => d.progressStatus === progressStatus)
    if (director) filtered = filtered.filter((d) => d.directorName.includes(director) || d.director.includes(director))
    if (keyword) filtered = filtered.filter((d) => d.content.includes(keyword))
    if (targetUnit) filtered = filtered.filter((d) => d.targetUnit === targetUnit)
    if (directiveDateFrom) filtered = filtered.filter((d) => d.directiveDate >= directiveDateFrom)
    if (directiveDateTo) filtered = filtered.filter((d) => d.directiveDate <= directiveDateTo)

    const result: ApiResult<PageResponse<Directive>> = {
      success: true,
      data: paginate(filtered, page, size),
    }
    return HttpResponse.json(result)
  }),

  // 지시사항 추진현황 통계
  http.get('/api/sys12/directives/progress', () => {
    const result: ApiResult<ReturnType<typeof calcProgress>> = {
      success: true,
      data: calcProgress(directives),
    }
    return HttpResponse.json(result)
  }),

  // 지시사항 상세
  http.get('/api/sys12/directives/:id', ({ params }) => {
    const item = directives.find((d) => d.id === params.id)
    if (!item) {
      return HttpResponse.json({ success: false, message: '지시사항을 찾을 수 없습니다' }, { status: 404 })
    }
    const result: ApiResult<Directive> = { success: true, data: item }
    return HttpResponse.json(result)
  }),

  // 지시사항 등록
  http.post('/api/sys12/directives', async ({ request }) => {
    const body = (await request.json()) as Partial<Directive>
    const newItem: Directive = {
      id: `dir-${Date.now()}`,
      directiveNo: `DIR-${Date.now()}`,
      directorServiceNumber: (body.directorServiceNumber as string) || '',
      directorRank: (body.directorRank as string) || '',
      directorName: (body.directorName as string) || '',
      director: body.director || '',
      directiveDate: body.directiveDate || new Date().toISOString().split('T')[0],
      targetUnit: body.targetUnit || '해병대사령부',
      content: body.content || '',
      progressStatus: (body.progressStatus as ProgressStatus) || 'notStarted',
      category: body.category || '작전',
      directiveType: (body.directiveType as '문서' | '구두') || '문서',
      attachments: [],
      createdAt: new Date().toISOString(),
    }
    directives = [newItem, ...directives]
    const result: ApiResult<Directive> = { success: true, data: newItem }
    return HttpResponse.json(result)
  }),

  // 지시사항 수정
  http.put('/api/sys12/directives/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<Directive>
    const index = directives.findIndex((d) => d.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ success: false, message: '지시사항을 찾을 수 없습니다' }, { status: 404 })
    }
    directives[index] = { ...directives[index], ...body }
    const result: ApiResult<Directive> = { success: true, data: directives[index] }
    return HttpResponse.json(result)
  }),

  // 지시사항 삭제
  http.delete('/api/sys12/directives/:id', ({ params }) => {
    const index = directives.findIndex((d) => d.id === params.id)
    if (index !== -1) directives.splice(index, 1)
    const result: ApiResult<null> = { success: true, data: null }
    return HttpResponse.json(result)
  }),

  // 지시사항 조치사항 목록
  http.get('/api/sys12/directives/:id/actions', ({ params }) => {
    const filtered = actions.filter((a) => a.parentId === params.id && a.parentType === 'directive')
    const result: ApiResult<ActionItem[]> = { success: true, data: filtered }
    return HttpResponse.json(result)
  }),

  // 지시사항 조치사항 등록
  http.post('/api/sys12/directives/:id/actions', async ({ params, request }) => {
    const body = (await request.json()) as Partial<ActionItem>
    const newItem: ActionItem = {
      id: `act-${Date.now()}`,
      parentId: params.id as string,
      parentType: 'directive',
      assigneeServiceNumber: (body.assigneeServiceNumber as string) || '',
      assigneeRank: (body.assigneeRank as string) || '',
      assigneeName: (body.assigneeName as string) || '',
      assignee: body.assignee || '',
      progressStatus: (body.progressStatus as ProgressStatus) || 'notStarted',
      plan: body.plan || '',
      result: body.result || '',
      attachments: (body.attachments as string[]) || [],
      createdAt: new Date().toISOString(),
    }
    actions = [newItem, ...actions]
    const result: ApiResult<ActionItem> = { success: true, data: newItem }
    return HttpResponse.json(result)
  }),

  // 지시사항 이행 이력 (Timeline)
  http.get('/api/sys12/directives/:id/history', ({ params }) => {
    const filtered = histories
      .filter((h) => h.parentId === params.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const result: ApiResult<ActionHistory[]> = { success: true, data: filtered }
    return HttpResponse.json(result)
  }),

  // === 건의사항 목록 ===
  http.get('/api/sys12/proposals', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    const progressStatus = url.searchParams.get('progressStatus') || ''
    const keyword = url.searchParams.get('keyword') || ''
    const proposer = url.searchParams.get('proposer') || ''
    const managingUnit = url.searchParams.get('managingUnit') || ''
    const proposalDateFrom = url.searchParams.get('proposalDateFrom') || ''
    const proposalDateTo = url.searchParams.get('proposalDateTo') || ''

    let filtered = [...proposals]
    if (progressStatus) filtered = filtered.filter((p) => p.progressStatus === progressStatus)
    if (keyword) filtered = filtered.filter((p) => p.content.includes(keyword))
    if (proposer) filtered = filtered.filter((p) => p.proposerName.includes(proposer) || p.proposer.includes(proposer))
    if (managingUnit) filtered = filtered.filter((p) => p.managingUnit === managingUnit)
    if (proposalDateFrom) filtered = filtered.filter((p) => p.proposalDate >= proposalDateFrom)
    if (proposalDateTo) filtered = filtered.filter((p) => p.proposalDate <= proposalDateTo)

    const result: ApiResult<PageResponse<Proposal>> = {
      success: true,
      data: paginate(filtered, page, size),
    }
    return HttpResponse.json(result)
  }),

  // 건의사항 처리현황 통계
  http.get('/api/sys12/proposals/progress', () => {
    const result: ApiResult<ReturnType<typeof calcProgress>> = {
      success: true,
      data: calcProgress(proposals),
    }
    return HttpResponse.json(result)
  }),

  // 건의사항 상세
  http.get('/api/sys12/proposals/:id', ({ params }) => {
    const item = proposals.find((p) => p.id === params.id)
    if (!item) {
      return HttpResponse.json({ success: false, message: '건의사항을 찾을 수 없습니다' }, { status: 404 })
    }
    const result: ApiResult<Proposal> = { success: true, data: item }
    return HttpResponse.json(result)
  }),

  // 건의사항 등록
  http.post('/api/sys12/proposals', async ({ request }) => {
    const body = (await request.json()) as Partial<Proposal>
    const newItem: Proposal = {
      id: `prop-${Date.now()}`,
      proposalNo: `PROP-${Date.now()}`,
      proposerServiceNumber: (body.proposerServiceNumber as string) || '',
      proposerRank: (body.proposerRank as string) || '',
      proposerName: (body.proposerName as string) || '',
      proposer: body.proposer || '',
      proposalDate: body.proposalDate || new Date().toISOString().split('T')[0],
      managingUnit: body.managingUnit || '해병대사령부',
      content: body.content || '',
      progressStatus: (body.progressStatus as ProgressStatus) || 'notStarted',
      category: body.category || '작전',
      attachments: [],
      createdAt: new Date().toISOString(),
    }
    proposals = [newItem, ...proposals]
    const result: ApiResult<Proposal> = { success: true, data: newItem }
    return HttpResponse.json(result)
  }),

  // 건의사항 수정
  http.put('/api/sys12/proposals/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<Proposal>
    const index = proposals.findIndex((p) => p.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ success: false, message: '건의사항을 찾을 수 없습니다' }, { status: 404 })
    }
    proposals[index] = { ...proposals[index], ...body }
    const result: ApiResult<Proposal> = { success: true, data: proposals[index] }
    return HttpResponse.json(result)
  }),

  // 건의사항 삭제
  http.delete('/api/sys12/proposals/:id', ({ params }) => {
    const index = proposals.findIndex((p) => p.id === params.id)
    if (index !== -1) proposals.splice(index, 1)
    const result: ApiResult<null> = { success: true, data: null }
    return HttpResponse.json(result)
  }),

  // 건의사항 조치사항 목록
  http.get('/api/sys12/proposals/:id/actions', ({ params }) => {
    const filtered = actions.filter((a) => a.parentId === params.id && a.parentType === 'proposal')
    const result: ApiResult<ActionItem[]> = { success: true, data: filtered }
    return HttpResponse.json(result)
  }),

  // 건의사항 조치사항 등록
  http.post('/api/sys12/proposals/:id/actions', async ({ params, request }) => {
    const body = (await request.json()) as Partial<ActionItem>
    const newItem: ActionItem = {
      id: `act-${Date.now()}`,
      parentId: params.id as string,
      parentType: 'proposal',
      assigneeServiceNumber: (body.assigneeServiceNumber as string) || '',
      assigneeRank: (body.assigneeRank as string) || '',
      assigneeName: (body.assigneeName as string) || '',
      assignee: body.assignee || '',
      progressStatus: (body.progressStatus as ProgressStatus) || 'notStarted',
      plan: body.plan || '',
      result: body.result || '',
      attachments: (body.attachments as string[]) || [],
      createdAt: new Date().toISOString(),
    }
    actions = [newItem, ...actions]
    const result: ApiResult<ActionItem> = { success: true, data: newItem }
    return HttpResponse.json(result)
  }),

  // 건의사항 처리 이력
  http.get('/api/sys12/proposals/:id/history', ({ params }) => {
    const filtered = histories
      .filter((h) => h.parentId === params.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const result: ApiResult<ActionHistory[]> = { success: true, data: filtered }
    return HttpResponse.json(result)
  }),

  // 관리자 통계 (차트용)
  http.get('/api/sys12/admin/stats', () => {
    const chartData = CATEGORIES.flatMap((category) => [
      { category, count: directives.filter((d) => d.category === category).length, status: '지시사항', type: '지시' },
      { category, count: proposals.filter((p) => p.category === category).length, status: '건의사항', type: '건의' },
    ])
    const result: ApiResult<typeof chartData> = { success: true, data: chartData }
    return HttpResponse.json(result)
  }),

  // === 대통령 지시사항 ===
  http.get('/api/sys12/presidential-directives', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    const progressStatus = url.searchParams.get('progressStatus') || ''
    const director = url.searchParams.get('director') || ''
    const keyword = url.searchParams.get('keyword') || ''
    const targetUnit = url.searchParams.get('targetUnit') || ''
    const directiveDateFrom = url.searchParams.get('directiveDateFrom') || ''
    const directiveDateTo = url.searchParams.get('directiveDateTo') || ''

    let filtered = [...presidentialDirectives]
    if (progressStatus) filtered = filtered.filter((d) => d.progressStatus === progressStatus)
    if (director) filtered = filtered.filter((d) => d.directorName.includes(director) || d.director.includes(director))
    if (keyword) filtered = filtered.filter((d) => d.content.includes(keyword))
    if (targetUnit) filtered = filtered.filter((d) => d.targetUnit === targetUnit)
    if (directiveDateFrom) filtered = filtered.filter((d) => d.directiveDate >= directiveDateFrom)
    if (directiveDateTo) filtered = filtered.filter((d) => d.directiveDate <= directiveDateTo)

    const result: ApiResult<PageResponse<Directive>> = { success: true, data: paginate(filtered, page, size) }
    return HttpResponse.json(result)
  }),

  http.get('/api/sys12/presidential-directives/progress', () => {
    const result: ApiResult<ReturnType<typeof calcProgress>> = { success: true, data: calcProgress(presidentialDirectives) }
    return HttpResponse.json(result)
  }),

  http.get('/api/sys12/presidential-directives/:id', ({ params }) => {
    const item = presidentialDirectives.find((d) => d.id === params.id)
    if (!item) return HttpResponse.json({ success: false, message: '지시사항을 찾을 수 없습니다' }, { status: 404 })
    return HttpResponse.json({ success: true, data: item } as ApiResult<Directive>)
  }),

  http.post('/api/sys12/presidential-directives', async ({ request }) => {
    const body = (await request.json()) as Partial<Directive>
    const newItem: Directive = {
      id: `pdir-${Date.now()}`, directiveNo: `PDIR-${Date.now()}`,
      directorServiceNumber: (body.directorServiceNumber as string) || '', directorRank: (body.directorRank as string) || '',
      directorName: (body.directorName as string) || '', director: body.director || '',
      directiveDate: body.directiveDate || new Date().toISOString().split('T')[0],
      targetUnit: body.targetUnit || '해병대사령부', content: body.content || '',
      progressStatus: (body.progressStatus as ProgressStatus) || 'notStarted',
      category: body.category || '작전', directiveType: (body.directiveType as '문서' | '구두') || '문서',
      attachments: [], createdAt: new Date().toISOString(),
    }
    presidentialDirectives = [newItem, ...presidentialDirectives]
    return HttpResponse.json({ success: true, data: newItem } as ApiResult<Directive>)
  }),

  http.put('/api/sys12/presidential-directives/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<Directive>
    const index = presidentialDirectives.findIndex((d) => d.id === params.id)
    if (index === -1) return HttpResponse.json({ success: false, message: '지시사항을 찾을 수 없습니다' }, { status: 404 })
    presidentialDirectives[index] = { ...presidentialDirectives[index], ...body }
    return HttpResponse.json({ success: true, data: presidentialDirectives[index] } as ApiResult<Directive>)
  }),

  http.delete('/api/sys12/presidential-directives/:id', ({ params }) => {
    const index = presidentialDirectives.findIndex((d) => d.id === params.id)
    if (index !== -1) presidentialDirectives.splice(index, 1)
    return HttpResponse.json({ success: true, data: null } as ApiResult<null>)
  }),

  http.get('/api/sys12/presidential-directives/:id/actions', ({ params }) => {
    const filtered = presidentialActions.filter((a) => a.parentId === params.id)
    return HttpResponse.json({ success: true, data: filtered } as ApiResult<ActionItem[]>)
  }),

  http.post('/api/sys12/presidential-directives/:id/actions', async ({ params, request }) => {
    const body = (await request.json()) as Partial<ActionItem>
    const newItem: ActionItem = {
      id: `pact-${Date.now()}`, parentId: params.id as string, parentType: 'directive',
      assigneeServiceNumber: (body.assigneeServiceNumber as string) || '', assigneeRank: (body.assigneeRank as string) || '',
      assigneeName: (body.assigneeName as string) || '', assignee: body.assignee || '',
      progressStatus: (body.progressStatus as ProgressStatus) || 'notStarted',
      plan: body.plan || '', result: body.result || '', attachments: (body.attachments as string[]) || [],
      createdAt: new Date().toISOString(),
    }
    presidentialActions = [newItem, ...presidentialActions]
    return HttpResponse.json({ success: true, data: newItem } as ApiResult<ActionItem>)
  }),

  http.get('/api/sys12/presidential-directives/:id/history', ({ params }) => {
    const filtered = presidentialHistories.filter((h) => h.parentId === params.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return HttpResponse.json({ success: true, data: filtered } as ApiResult<ActionHistory[]>)
  }),

  // === 국방부장관 지시사항 ===
  http.get('/api/sys12/minister-directives', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    const progressStatus = url.searchParams.get('progressStatus') || ''
    const director = url.searchParams.get('director') || ''
    const keyword = url.searchParams.get('keyword') || ''
    const targetUnit = url.searchParams.get('targetUnit') || ''
    const directiveDateFrom = url.searchParams.get('directiveDateFrom') || ''
    const directiveDateTo = url.searchParams.get('directiveDateTo') || ''

    let filtered = [...ministerDirectives]
    if (progressStatus) filtered = filtered.filter((d) => d.progressStatus === progressStatus)
    if (director) filtered = filtered.filter((d) => d.directorName.includes(director) || d.director.includes(director))
    if (keyword) filtered = filtered.filter((d) => d.content.includes(keyword))
    if (targetUnit) filtered = filtered.filter((d) => d.targetUnit === targetUnit)
    if (directiveDateFrom) filtered = filtered.filter((d) => d.directiveDate >= directiveDateFrom)
    if (directiveDateTo) filtered = filtered.filter((d) => d.directiveDate <= directiveDateTo)

    const result: ApiResult<PageResponse<Directive>> = { success: true, data: paginate(filtered, page, size) }
    return HttpResponse.json(result)
  }),

  http.get('/api/sys12/minister-directives/progress', () => {
    const result: ApiResult<ReturnType<typeof calcProgress>> = { success: true, data: calcProgress(ministerDirectives) }
    return HttpResponse.json(result)
  }),

  http.get('/api/sys12/minister-directives/:id', ({ params }) => {
    const item = ministerDirectives.find((d) => d.id === params.id)
    if (!item) return HttpResponse.json({ success: false, message: '지시사항을 찾을 수 없습니다' }, { status: 404 })
    return HttpResponse.json({ success: true, data: item } as ApiResult<Directive>)
  }),

  http.post('/api/sys12/minister-directives', async ({ request }) => {
    const body = (await request.json()) as Partial<Directive>
    const newItem: Directive = {
      id: `mdir-${Date.now()}`, directiveNo: `MDIR-${Date.now()}`,
      directorServiceNumber: (body.directorServiceNumber as string) || '', directorRank: (body.directorRank as string) || '',
      directorName: (body.directorName as string) || '', director: body.director || '',
      directiveDate: body.directiveDate || new Date().toISOString().split('T')[0],
      targetUnit: body.targetUnit || '해병대사령부', content: body.content || '',
      progressStatus: (body.progressStatus as ProgressStatus) || 'notStarted',
      category: body.category || '작전', directiveType: (body.directiveType as '문서' | '구두') || '문서',
      attachments: [], createdAt: new Date().toISOString(),
    }
    ministerDirectives = [newItem, ...ministerDirectives]
    return HttpResponse.json({ success: true, data: newItem } as ApiResult<Directive>)
  }),

  http.put('/api/sys12/minister-directives/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<Directive>
    const index = ministerDirectives.findIndex((d) => d.id === params.id)
    if (index === -1) return HttpResponse.json({ success: false, message: '지시사항을 찾을 수 없습니다' }, { status: 404 })
    ministerDirectives[index] = { ...ministerDirectives[index], ...body }
    return HttpResponse.json({ success: true, data: ministerDirectives[index] } as ApiResult<Directive>)
  }),

  http.delete('/api/sys12/minister-directives/:id', ({ params }) => {
    const index = ministerDirectives.findIndex((d) => d.id === params.id)
    if (index !== -1) ministerDirectives.splice(index, 1)
    return HttpResponse.json({ success: true, data: null } as ApiResult<null>)
  }),

  http.get('/api/sys12/minister-directives/:id/actions', ({ params }) => {
    const filtered = ministerActions.filter((a) => a.parentId === params.id)
    return HttpResponse.json({ success: true, data: filtered } as ApiResult<ActionItem[]>)
  }),

  http.post('/api/sys12/minister-directives/:id/actions', async ({ params, request }) => {
    const body = (await request.json()) as Partial<ActionItem>
    const newItem: ActionItem = {
      id: `mact-${Date.now()}`, parentId: params.id as string, parentType: 'directive',
      assigneeServiceNumber: (body.assigneeServiceNumber as string) || '', assigneeRank: (body.assigneeRank as string) || '',
      assigneeName: (body.assigneeName as string) || '', assignee: body.assignee || '',
      progressStatus: (body.progressStatus as ProgressStatus) || 'notStarted',
      plan: body.plan || '', result: body.result || '', attachments: (body.attachments as string[]) || [],
      createdAt: new Date().toISOString(),
    }
    ministerActions = [newItem, ...ministerActions]
    return HttpResponse.json({ success: true, data: newItem } as ApiResult<ActionItem>)
  }),

  http.get('/api/sys12/minister-directives/:id/history', ({ params }) => {
    const filtered = ministerHistories.filter((h) => h.parentId === params.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return HttpResponse.json({ success: true, data: filtered } as ApiResult<ActionHistory[]>)
  }),
]
