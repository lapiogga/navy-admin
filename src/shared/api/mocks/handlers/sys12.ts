import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker/locale/ko'
import type { ApiResult, PageResponse } from '@/shared/api/types'

// 타입 정의
export type ProgressStatus = 'notStarted' | 'inProgress' | 'completed' | 'delayed'

export interface Directive extends Record<string, unknown> {
  id: string
  directiveNo: string
  director: string
  directiveDate: string
  targetUnit: string
  content: string
  progressStatus: ProgressStatus
  category: string
  attachments: string[]
  createdAt: string
}

export interface Proposal extends Record<string, unknown> {
  id: string
  proposalNo: string
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

const UNITS = ['1사단', '2사단', '해병대사령부', '교육훈련단', '상륙기동단']
const CATEGORIES = ['작전', '교육', '군수', '인사', '정보화']
const DIRECTORS = ['사령관', '참모장', '부사령관']
const STATUSES: ProgressStatus[] = ['notStarted', 'inProgress', 'completed', 'delayed']

// 지시사항 Mock 데이터 20건
let directives: Directive[] = Array.from({ length: 20 }, (_, i) => ({
  id: `dir-${i + 1}`,
  directiveNo: `DIR-${2025}-${String(i + 1).padStart(3, '0')}`,
  director: DIRECTORS[i % DIRECTORS.length],
  directiveDate: faker.date.recent({ days: 180 }).toISOString().split('T')[0],
  targetUnit: UNITS[i % UNITS.length],
  content: faker.lorem.sentence(),
  progressStatus: STATUSES[i % STATUSES.length],
  category: CATEGORIES[i % CATEGORIES.length],
  attachments: [],
  createdAt: faker.date.recent({ days: 180 }).toISOString(),
}))

// 건의사항 Mock 데이터 15건
let proposals: Proposal[] = Array.from({ length: 15 }, (_, i) => ({
  id: `prop-${i + 1}`,
  proposalNo: `PROP-${2025}-${String(i + 1).padStart(3, '0')}`,
  proposer: faker.helpers.arrayElement(DIRECTORS),
  proposalDate: faker.date.recent({ days: 180 }).toISOString().split('T')[0],
  managingUnit: UNITS[i % UNITS.length],
  content: faker.lorem.sentence(),
  progressStatus: STATUSES[i % STATUSES.length],
  category: CATEGORIES[i % CATEGORIES.length],
  attachments: [],
  createdAt: faker.date.recent({ days: 180 }).toISOString(),
}))

// 조치사항 Mock 데이터 30건
let actions: ActionItem[] = Array.from({ length: 30 }, (_, i) => ({
  id: `act-${i + 1}`,
  parentId: i < 20 ? `dir-${(i % 20) + 1}` : `prop-${(i % 15) + 1}`,
  parentType: (i < 20 ? 'directive' : 'proposal') as 'directive' | 'proposal',
  assignee: faker.person.lastName() + faker.person.firstName(),
  progressStatus: STATUSES[i % STATUSES.length],
  plan: faker.lorem.sentence(),
  result: faker.lorem.sentence(),
  attachments: [],
  createdAt: faker.date.recent({ days: 90 }).toISOString(),
}))

// 이력 Mock 데이터 60건
const histories: ActionHistory[] = Array.from({ length: 60 }, (_, i) => ({
  id: `hist-${i + 1}`,
  parentId: i < 30 ? `dir-${(i % 20) + 1}` : `prop-${(i % 15) + 1}`,
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

    let filtered = [...directives]
    if (progressStatus) filtered = filtered.filter((d) => d.progressStatus === progressStatus)
    if (director) filtered = filtered.filter((d) => d.director === director)
    if (keyword) filtered = filtered.filter((d) => d.content.includes(keyword))

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
      director: body.director || '사령관',
      directiveDate: body.directiveDate || new Date().toISOString().split('T')[0],
      targetUnit: body.targetUnit || '해병대사령부',
      content: body.content || '',
      progressStatus: (body.progressStatus as ProgressStatus) || 'notStarted',
      category: body.category || '작전',
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
      assignee: body.assignee || '',
      progressStatus: (body.progressStatus as ProgressStatus) || 'notStarted',
      plan: body.plan || '',
      result: body.result || '',
      attachments: [],
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

    let filtered = [...proposals]
    if (progressStatus) filtered = filtered.filter((p) => p.progressStatus === progressStatus)
    if (keyword) filtered = filtered.filter((p) => p.content.includes(keyword))

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
      proposer: body.proposer || '사령관',
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
      assignee: body.assignee || '',
      progressStatus: (body.progressStatus as ProgressStatus) || 'notStarted',
      plan: body.plan || '',
      result: body.result || '',
      attachments: [],
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
]
