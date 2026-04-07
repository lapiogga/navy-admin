import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker/locale/ko'
import type { ApiResult, PageResponse } from '@/shared/api/types'

// ==================== 타입 정의 ====================

export interface BaseYear extends Record<string, unknown> {
  id: string
  year: string
  isActive: boolean
  createdAt: string
}

export interface EvalOrg extends Record<string, unknown> {
  id: string
  deptName: string
  deptCode: string
  isActive: boolean
}

export interface EvalGroup extends Record<string, unknown> {
  id: string
  groupName: string
  deptIds: string[]
  deptCount: number
  isActive: boolean
}

export interface IndividualTarget extends Record<string, unknown> {
  id: string
  name: string
  rank: string
  deptName: string
  year: string
}

export interface Policy extends Record<string, unknown> {
  id: string
  year: string
  title: string
  orderNo: number
}

export interface MainTask extends Record<string, unknown> {
  id: string
  policyId: string
  policyTitle: string
  title: string
  orderNo: number
}

export interface MidTask extends Record<string, unknown> {
  id: string
  mainTaskId: string
  mainTaskTitle: string
  title: string
  deptName: string
  weight: number
}

export interface SubTask extends Record<string, unknown> {
  id: string
  midTaskId: string
  midTaskTitle: string
  title: string
  deptName: string
  targetValue: string
}

export interface DetailTask extends Record<string, unknown> {
  id: string
  subTaskId: string
  subTaskTitle: string
  title: string
  deptName: string
  manager: string
  weight: number
}

export type TaskResultStatus = 'draft' | 'pending' | 'approved' | 'rejected'

export interface TaskResult extends Record<string, unknown> {
  id: string
  detailTaskId: string
  detailTaskTitle: string
  deptName: string
  content: string
  progressRate: number
  status: TaskResultStatus
  submittedAt?: string
  approvedAt?: string
  rejectedReason?: string
}

export type EvalGrade = 'S' | 'A' | 'B' | 'C' | 'D'

export interface TaskEval extends Record<string, unknown> {
  id: string
  detailTaskId: string
  taskTitle: string
  deptName: string
  manager: string
  status: 'pending' | 'evaluated'
  grade?: EvalGrade
  evalAt?: string
}

export interface IndividualResultEval extends Record<string, unknown> {
  id: string
  targetId: string
  name: string
  rank: string
  deptName: string
  status: 'pending' | 'evaluated'
  grade?: EvalGrade
  evalAt?: string
}

export interface EvalResult extends Record<string, unknown> {
  id: string
  deptName: string
  totalTasks: number
  evaluatedTasks: number
  avgGrade: string
  evalRate: number
}

export interface InputStatus extends Record<string, unknown> {
  id: string
  deptName: string
  totalTasks: number
  inputTasks: number
  inputRate: number
}

export interface ProgressRate extends Record<string, unknown> {
  id: string
  deptName: string
  unitName: string
  totalTasks: number
  progressRate: number
}

// ==================== Mock 데이터 ====================

const DEPT_NAMES = ['작전처', '정보처', '인사처', '군수처', '기획처', '교육훈련처', '통신처', '동원처']
const UNIT_NAMES = ['1사단', '2사단', '6여단', '9여단', '교육훈련단', '군수단', '사령부', '해병대학교']
const RANKS = ['대장', '중장', '소장', '준장', '대령', '중령', '소령', '대위', '중위', '소위']
const GRADES: EvalGrade[] = ['S', 'A', 'B', 'C', 'D']

const baseYears: BaseYear[] = ['2022', '2023', '2024', '2025', '2026'].map((year, i) => ({
  id: `by-${i + 1}`,
  year,
  isActive: year === '2025',
  createdAt: faker.date.past({ years: 3 }).toISOString().split('T')[0],
}))

const evalOrgs: EvalOrg[] = DEPT_NAMES.map((deptName, i) => ({
  id: `eo-${i + 1}`,
  deptName,
  deptCode: `DEPT-${String(i + 1).padStart(3, '0')}`,
  isActive: true,
}))

const evalGroups: EvalGroup[] = [
  { id: 'eg-1', groupName: '주요직위자 그룹', deptIds: ['eo-1', 'eo-2', 'eo-3'], deptCount: 3, isActive: true },
  { id: 'eg-2', groupName: '참모 그룹', deptIds: ['eo-4', 'eo-5'], deptCount: 2, isActive: true },
  { id: 'eg-3', groupName: '지원 그룹', deptIds: ['eo-6', 'eo-7', 'eo-8'], deptCount: 3, isActive: true },
]

const individualTargets: IndividualTarget[] = Array.from({ length: 20 }, (_, i) => ({
  id: `it-${i + 1}`,
  name: faker.person.lastName() + faker.person.firstName(),
  rank: faker.helpers.arrayElement(RANKS),
  deptName: faker.helpers.arrayElement(DEPT_NAMES),
  year: '2025',
}))

const policies: Policy[] = [
  { id: 'pol-1', year: '2025', title: '전투준비태세 완비', orderNo: 1 },
  { id: 'pol-2', year: '2025', title: '전력증강 및 발전', orderNo: 2 },
  { id: 'pol-3', year: '2025', title: '장병 복지 향상', orderNo: 3 },
  { id: 'pol-4', year: '2025', title: '행정혁신 및 효율화', orderNo: 4 },
]

const mainTasks: MainTask[] = [
  { id: 'mt-1', policyId: 'pol-1', policyTitle: '전투준비태세 완비', title: '전투력 강화', orderNo: 1 },
  { id: 'mt-2', policyId: 'pol-1', policyTitle: '전투준비태세 완비', title: '훈련 내실화', orderNo: 2 },
  { id: 'mt-3', policyId: 'pol-2', policyTitle: '전력증강 및 발전', title: '장비 현대화', orderNo: 1 },
  { id: 'mt-4', policyId: 'pol-3', policyTitle: '장병 복지 향상', title: '생활환경 개선', orderNo: 1 },
  { id: 'mt-5', policyId: 'pol-4', policyTitle: '행정혁신 및 효율화', title: '업무 디지털화', orderNo: 1 },
]

const MID_TASK_TITLES: Record<string, string[]> = {
  'mt-1': ['전투 준비태세 점검 체계화', '전투기술 숙달 훈련 강화', '전투근무지원 체계 정비'],
  'mt-2': ['연합합동훈련 참가 확대', '실전적 부대훈련 강화', '교육훈련 평가체계 개선'],
  'mt-3': ['첨단 장비 도입 추진', '노후 장비 교체 사업', '정비능력 향상 교육'],
  'mt-4': ['병영생활 환경 개선', '급식 품질 향상', '복지시설 현대화'],
  'mt-5': ['행정업무 전산화', '문서관리 시스템 고도화', '데이터 기반 의사결정'],
}

const midTasks: MidTask[] = mainTasks.flatMap((mt) => {
  const titles = MID_TASK_TITLES[mt.id] ?? [`${mt.title} 세부과제 1`, `${mt.title} 세부과제 2`, `${mt.title} 세부과제 3`]
  return titles.map((title, j) => ({
    id: `mid-${mt.id.replace('mt-', '')}-${j + 1}`,
    mainTaskId: mt.id,
    mainTaskTitle: mt.title,
    title,
    deptName: DEPT_NAMES[j % DEPT_NAMES.length],
    weight: Math.round(100 / titles.length),
  }))
})

const SUB_TASK_SUFFIXES = ['기반 구축', '실행 계획']
let subIdCounter = 0
const subTasks: SubTask[] = midTasks.flatMap((mid) =>
  SUB_TASK_SUFFIXES.map((suffix) => {
    subIdCounter += 1
    return {
      id: `sub-${subIdCounter}`,
      midTaskId: mid.id,
      midTaskTitle: mid.title,
      title: `${mid.title} ${suffix}`,
      deptName: mid.deptName,
      targetValue: `${faker.number.int({ min: 50, max: 200 })}건`,
    }
  }),
)

let dtIdCounter = 0
const detailTasks: DetailTask[] = subTasks.map((sub) => {
  dtIdCounter += 1
  return {
    id: `dt-${dtIdCounter}`,
    subTaskId: sub.id,
    subTaskTitle: sub.title,
    title: `${sub.title} 추진`,
    deptName: sub.deptName,
    manager: faker.person.lastName() + faker.person.firstName(),
    weight: faker.number.int({ min: 10, max: 40 }),
  }
})

const STATUS_LIST: TaskResultStatus[] = ['draft', 'pending', 'approved', 'rejected']

const taskResults: TaskResult[] = detailTasks.map((dt, i) => {
  const status = STATUS_LIST[i % 4]
  return {
    id: `tr-${i + 1}`,
    detailTaskId: dt.id,
    detailTaskTitle: dt.title,
    deptName: dt.deptName,
    content: faker.lorem.sentences(2),
    progressRate: faker.number.int({ min: 0, max: 100 }),
    status,
    submittedAt: status !== 'draft' ? faker.date.recent({ days: 30 }).toISOString().split('T')[0] : undefined,
    approvedAt: status === 'approved' ? faker.date.recent({ days: 20 }).toISOString().split('T')[0] : undefined,
    rejectedReason: status === 'rejected' ? '내용 보완 후 재상신 바람' : undefined,
  }
})

const taskEvals: TaskEval[] = detailTasks.map((dt, i) => ({
  id: `te-${i + 1}`,
  detailTaskId: dt.id,
  taskTitle: dt.title,
  deptName: dt.deptName,
  manager: dt.manager,
  status: i % 3 === 0 ? 'evaluated' : 'pending',
  grade: i % 3 === 0 ? GRADES[i % 5] : undefined,
  evalAt: i % 3 === 0 ? faker.date.recent({ days: 15 }).toISOString().split('T')[0] : undefined,
}))

const individualEvals: IndividualResultEval[] = individualTargets.map((it, i) => ({
  id: `ie-${i + 1}`,
  targetId: it.id,
  name: it.name,
  rank: it.rank,
  deptName: it.deptName,
  status: i % 3 === 0 ? 'evaluated' : 'pending',
  grade: i % 3 === 0 ? GRADES[i % 5] : undefined,
  evalAt: i % 3 === 0 ? faker.date.recent({ days: 15 }).toISOString().split('T')[0] : undefined,
}))

const evalResults: EvalResult[] = DEPT_NAMES.map((deptName, i) => ({
  id: `er-${i + 1}`,
  deptName,
  totalTasks: faker.number.int({ min: 5, max: 15 }),
  evaluatedTasks: faker.number.int({ min: 3, max: 12 }),
  avgGrade: GRADES[i % 5],
  evalRate: faker.number.int({ min: 60, max: 100 }),
}))

const inputStatuses: InputStatus[] = DEPT_NAMES.map((deptName, i) => ({
  id: `is-${i + 1}`,
  deptName,
  totalTasks: faker.number.int({ min: 5, max: 15 }),
  inputTasks: faker.number.int({ min: 3, max: 12 }),
  inputRate: faker.number.int({ min: 60, max: 100 }),
}))

let prIdCounter = 0
const progressRates: ProgressRate[] = UNIT_NAMES.flatMap((unitName) =>
  DEPT_NAMES.slice(0, 3).map((deptName) => {
    prIdCounter += 1
    return {
      id: `pr-${prIdCounter}`,
      deptName,
      unitName,
      totalTasks: faker.number.int({ min: 5, max: 20 }),
      progressRate: faker.number.int({ min: 30, max: 100 }),
    }
  }),
)

// ==================== 유틸리티 ====================

function paginate<T>(items: T[], page: number, pageSize: number): PageResponse<T> {
  const start = (page - 1) * pageSize
  return {
    content: items.slice(start, start + pageSize),
    totalElements: items.length,
    totalPages: Math.ceil(items.length / pageSize),
    size: pageSize,
    number: page - 1,
  }
}

function ok<T>(data: T): HttpResponse {
  return HttpResponse.json({ success: true, data } satisfies ApiResult<T>)
}

// ==================== 핸들러 ====================

export const sys03Handlers = [
  // 메인 대시보드 통계
  http.get('/api/sys03/stats', () => {
    return ok({
      myDeptRate: faker.number.int({ min: 50, max: 95 }),
      policyRates: policies.map((p) => ({
        policyTitle: p.title,
        rate: faker.number.int({ min: 40, max: 100 }),
      })),
      deptRates: DEPT_NAMES.map((deptName) => ({
        deptName,
        rate: faker.number.int({ min: 40, max: 100 }),
      })),
      totalTasks: 76,
      completedTasks: faker.number.int({ min: 40, max: 70 }),
      avgProgressRate: faker.number.int({ min: 60, max: 90 }),
    })
  }),

  // 기준년도
  http.get('/api/sys03/base-years', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('current') ?? '1')
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10')
    return ok(paginate(baseYears, page, pageSize))
  }),
  http.post('/api/sys03/base-years', async ({ request }) => {
    const body = (await request.json()) as Partial<BaseYear>
    const newItem: BaseYear = {
      id: `by-${Date.now()}`,
      year: body.year ?? '',
      isActive: body.isActive ?? false,
      createdAt: new Date().toISOString().split('T')[0],
    }
    baseYears.push(newItem)
    return ok(newItem)
  }),
  http.put('/api/sys03/base-years/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<BaseYear>
    const idx = baseYears.findIndex((x) => x.id === params.id)
    if (idx !== -1) baseYears[idx] = { ...baseYears[idx], ...body }
    return ok(baseYears[idx])
  }),
  http.delete('/api/sys03/base-years/:id', ({ params }) => {
    const idx = baseYears.findIndex((x) => x.id === params.id)
    if (idx !== -1) baseYears.splice(idx, 1)
    return ok({ id: params.id })
  }),

  // 평가 대상 부서
  http.get('/api/sys03/eval-orgs', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('current') ?? '1')
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10')
    return ok(paginate(evalOrgs, page, pageSize))
  }),
  http.post('/api/sys03/eval-orgs', async ({ request }) => {
    const body = (await request.json()) as Partial<EvalOrg>
    const newItem: EvalOrg = {
      id: `eo-${Date.now()}`,
      deptName: body.deptName ?? '',
      deptCode: body.deptCode ?? '',
      isActive: body.isActive ?? true,
    }
    evalOrgs.push(newItem)
    return ok(newItem)
  }),
  http.put('/api/sys03/eval-orgs/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<EvalOrg>
    const idx = evalOrgs.findIndex((x) => x.id === params.id)
    if (idx !== -1) evalOrgs[idx] = { ...evalOrgs[idx], ...body }
    return ok(evalOrgs[idx])
  }),
  http.delete('/api/sys03/eval-orgs/:id', ({ params }) => {
    const idx = evalOrgs.findIndex((x) => x.id === params.id)
    if (idx !== -1) evalOrgs.splice(idx, 1)
    return ok({ id: params.id })
  }),

  // 평가그룹
  http.get('/api/sys03/eval-groups', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('current') ?? '1')
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10')
    return ok(paginate(evalGroups, page, pageSize))
  }),
  http.post('/api/sys03/eval-groups', async ({ request }) => {
    const body = (await request.json()) as Partial<EvalGroup>
    const newItem: EvalGroup = {
      id: `eg-${Date.now()}`,
      groupName: body.groupName ?? '',
      deptIds: body.deptIds ?? [],
      deptCount: (body.deptIds ?? []).length,
      isActive: body.isActive ?? true,
    }
    evalGroups.push(newItem)
    return ok(newItem)
  }),
  http.put('/api/sys03/eval-groups/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<EvalGroup>
    const idx = evalGroups.findIndex((x) => x.id === params.id)
    if (idx !== -1) evalGroups[idx] = { ...evalGroups[idx], ...body }
    return ok(evalGroups[idx])
  }),
  http.delete('/api/sys03/eval-groups/:id', ({ params }) => {
    const idx = evalGroups.findIndex((x) => x.id === params.id)
    if (idx !== -1) evalGroups.splice(idx, 1)
    return ok({ id: params.id })
  }),

  // 개인 업무실적 대상자
  http.get('/api/sys03/individual-targets', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('current') ?? '1')
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10')
    return ok(paginate(individualTargets, page, pageSize))
  }),
  http.post('/api/sys03/individual-targets', async ({ request }) => {
    const body = (await request.json()) as Partial<IndividualTarget>
    const newItem: IndividualTarget = {
      id: `it-${Date.now()}`,
      name: body.name ?? '',
      rank: body.rank ?? '',
      deptName: body.deptName ?? '',
      year: body.year ?? '2025',
    }
    individualTargets.push(newItem)
    return ok(newItem)
  }),
  http.put('/api/sys03/individual-targets/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<IndividualTarget>
    const idx = individualTargets.findIndex((x) => x.id === params.id)
    if (idx !== -1) individualTargets[idx] = { ...individualTargets[idx], ...body }
    return ok(individualTargets[idx])
  }),
  http.delete('/api/sys03/individual-targets/:id', ({ params }) => {
    const idx = individualTargets.findIndex((x) => x.id === params.id)
    if (idx !== -1) individualTargets.splice(idx, 1)
    return ok({ id: params.id })
  }),

  // 지휘방침
  http.get('/api/sys03/policies', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('current') ?? '1')
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10')
    return ok(paginate(policies, page, pageSize))
  }),
  http.post('/api/sys03/policies', async ({ request }) => {
    const body = (await request.json()) as Partial<Policy>
    const newItem: Policy = {
      id: `pol-${Date.now()}`,
      year: body.year ?? '2025',
      title: body.title ?? '',
      orderNo: body.orderNo ?? policies.length + 1,
    }
    policies.push(newItem)
    return ok(newItem)
  }),
  http.put('/api/sys03/policies/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<Policy>
    const idx = policies.findIndex((x) => x.id === params.id)
    if (idx !== -1) policies[idx] = { ...policies[idx], ...body }
    return ok(policies[idx])
  }),
  http.delete('/api/sys03/policies/:id', ({ params }) => {
    const idx = policies.findIndex((x) => x.id === params.id)
    if (idx !== -1) policies.splice(idx, 1)
    return ok({ id: params.id })
  }),

  // 추진중점과제
  http.get('/api/sys03/main-tasks', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('current') ?? '1')
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10')
    return ok(paginate(mainTasks, page, pageSize))
  }),
  http.post('/api/sys03/main-tasks', async ({ request }) => {
    const body = (await request.json()) as Partial<MainTask>
    const pol = policies.find((p) => p.id === body.policyId)
    const newItem: MainTask = {
      id: `mt-${Date.now()}`,
      policyId: body.policyId ?? '',
      policyTitle: pol?.title ?? '',
      title: body.title ?? '',
      orderNo: body.orderNo ?? mainTasks.length + 1,
    }
    mainTasks.push(newItem)
    return ok(newItem)
  }),
  http.put('/api/sys03/main-tasks/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<MainTask>
    const idx = mainTasks.findIndex((x) => x.id === params.id)
    if (idx !== -1) mainTasks[idx] = { ...mainTasks[idx], ...body }
    return ok(mainTasks[idx])
  }),
  http.delete('/api/sys03/main-tasks/:id', ({ params }) => {
    const idx = mainTasks.findIndex((x) => x.id === params.id)
    if (idx !== -1) mainTasks.splice(idx, 1)
    return ok({ id: params.id })
  }),

  // 중과제
  http.get('/api/sys03/mid-tasks', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('current') ?? '1')
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10')
    return ok(paginate(midTasks, page, pageSize))
  }),
  http.post('/api/sys03/mid-tasks', async ({ request }) => {
    const body = (await request.json()) as Partial<MidTask>
    const mt = mainTasks.find((m) => m.id === body.mainTaskId)
    const newItem: MidTask = {
      id: `mid-${Date.now()}`,
      mainTaskId: body.mainTaskId ?? '',
      mainTaskTitle: mt?.title ?? '',
      title: body.title ?? '',
      deptName: body.deptName ?? '',
      weight: body.weight ?? 0,
    }
    midTasks.push(newItem)
    return ok(newItem)
  }),
  http.put('/api/sys03/mid-tasks/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<MidTask>
    const idx = midTasks.findIndex((x) => x.id === params.id)
    if (idx !== -1) midTasks[idx] = { ...midTasks[idx], ...body }
    return ok(midTasks[idx])
  }),
  http.delete('/api/sys03/mid-tasks/:id', ({ params }) => {
    const idx = midTasks.findIndex((x) => x.id === params.id)
    if (idx !== -1) midTasks.splice(idx, 1)
    return ok({ id: params.id })
  }),
  http.post('/api/sys03/mid-tasks/export', () => {
    return ok({ message: '엑셀 다운로드가 준비되었습니다.' })
  }),

  // 소과제
  http.get('/api/sys03/sub-tasks', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('current') ?? '1')
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10')
    return ok(paginate(subTasks, page, pageSize))
  }),
  http.post('/api/sys03/sub-tasks', async ({ request }) => {
    const body = (await request.json()) as Partial<SubTask>
    const mid = midTasks.find((m) => m.id === body.midTaskId)
    const newItem: SubTask = {
      id: `sub-${Date.now()}`,
      midTaskId: body.midTaskId ?? '',
      midTaskTitle: mid?.title ?? '',
      title: body.title ?? '',
      deptName: body.deptName ?? '',
      targetValue: body.targetValue ?? '',
    }
    subTasks.push(newItem)
    return ok(newItem)
  }),
  http.put('/api/sys03/sub-tasks/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<SubTask>
    const idx = subTasks.findIndex((x) => x.id === params.id)
    if (idx !== -1) subTasks[idx] = { ...subTasks[idx], ...body }
    return ok(subTasks[idx])
  }),
  http.delete('/api/sys03/sub-tasks/:id', ({ params }) => {
    const idx = subTasks.findIndex((x) => x.id === params.id)
    if (idx !== -1) subTasks.splice(idx, 1)
    return ok({ id: params.id })
  }),
  http.post('/api/sys03/sub-tasks/export', () => {
    return ok({ message: '소과제 엑셀 다운로드가 준비되었습니다.' })
  }),

  // 상세과제
  http.get('/api/sys03/detail-tasks', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('current') ?? '1')
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10')
    return ok(paginate(detailTasks, page, pageSize))
  }),
  http.post('/api/sys03/detail-tasks', async ({ request }) => {
    const body = (await request.json()) as Partial<DetailTask>
    const sub = subTasks.find((s) => s.id === body.subTaskId)
    const newItem: DetailTask = {
      id: `dt-${Date.now()}`,
      subTaskId: body.subTaskId ?? '',
      subTaskTitle: sub?.title ?? '',
      title: body.title ?? '',
      deptName: body.deptName ?? '',
      manager: body.manager ?? '',
      weight: body.weight ?? 0,
    }
    detailTasks.push(newItem)
    return ok(newItem)
  }),
  http.put('/api/sys03/detail-tasks/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<DetailTask>
    const idx = detailTasks.findIndex((x) => x.id === params.id)
    if (idx !== -1) detailTasks[idx] = { ...detailTasks[idx], ...body }
    return ok(detailTasks[idx])
  }),
  http.delete('/api/sys03/detail-tasks/:id', ({ params }) => {
    const idx = detailTasks.findIndex((x) => x.id === params.id)
    if (idx !== -1) detailTasks.splice(idx, 1)
    return ok({ id: params.id })
  }),

  // 업무실적
  http.get('/api/sys03/task-results', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('current') ?? '1')
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10')
    const status = url.searchParams.get('status')
    const filtered = status ? taskResults.filter((r) => r.status === status) : taskResults
    return ok(paginate(filtered, page, pageSize))
  }),
  http.post('/api/sys03/task-results', async ({ request }) => {
    const body = (await request.json()) as Partial<TaskResult>
    const dt = detailTasks.find((d) => d.id === body.detailTaskId)
    const newItem: TaskResult = {
      id: `tr-${Date.now()}`,
      detailTaskId: body.detailTaskId ?? '',
      detailTaskTitle: dt?.title ?? '',
      deptName: dt?.deptName ?? '',
      content: body.content ?? '',
      progressRate: body.progressRate ?? 0,
      status: 'draft',
    }
    taskResults.push(newItem)
    return ok(newItem)
  }),
  http.put('/api/sys03/task-results/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<TaskResult>
    const idx = taskResults.findIndex((x) => x.id === params.id)
    if (idx !== -1) taskResults[idx] = { ...taskResults[idx], ...body }
    return ok(taskResults[idx])
  }),
  http.delete('/api/sys03/task-results/:id', ({ params }) => {
    const idx = taskResults.findIndex((x) => x.id === params.id)
    if (idx !== -1) taskResults.splice(idx, 1)
    return ok({ id: params.id })
  }),
  http.post('/api/sys03/task-results/:id/submit', ({ params }) => {
    const idx = taskResults.findIndex((x) => x.id === params.id)
    if (idx !== -1) {
      taskResults[idx] = {
        ...taskResults[idx],
        status: 'pending',
        submittedAt: new Date().toISOString().split('T')[0],
      }
    }
    return ok(taskResults[idx])
  }),
  http.post('/api/sys03/task-results/:id/approve', ({ params }) => {
    const idx = taskResults.findIndex((x) => x.id === params.id)
    if (idx !== -1) {
      taskResults[idx] = {
        ...taskResults[idx],
        status: 'approved',
        approvedAt: new Date().toISOString().split('T')[0],
      }
    }
    return ok(taskResults[idx])
  }),
  http.post('/api/sys03/task-results/:id/reject', async ({ params, request }) => {
    const body = (await request.json()) as { reason?: string }
    const idx = taskResults.findIndex((x) => x.id === params.id)
    if (idx !== -1) {
      taskResults[idx] = {
        ...taskResults[idx],
        status: 'rejected',
        rejectedReason: body.reason ?? '내용 보완 후 재상신 바람',
      }
    }
    return ok(taskResults[idx])
  }),

  // 과제실적 평가
  http.get('/api/sys03/task-evals', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('current') ?? '1')
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10')
    return ok(paginate(taskEvals, page, pageSize))
  }),
  http.post('/api/sys03/task-evals', async ({ request }) => {
    const body = (await request.json()) as { id: string; grade: EvalGrade }
    const idx = taskEvals.findIndex((x) => x.id === body.id)
    if (idx !== -1) {
      taskEvals[idx] = {
        ...taskEvals[idx],
        grade: body.grade,
        status: 'evaluated',
        evalAt: new Date().toISOString().split('T')[0],
      }
    }
    return ok(taskEvals[idx])
  }),

  // 개인 업무실적 평가
  http.get('/api/sys03/individual-evals', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('current') ?? '1')
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10')
    return ok(paginate(individualEvals, page, pageSize))
  }),
  http.post('/api/sys03/individual-evals', async ({ request }) => {
    const body = (await request.json()) as { id: string; grade: EvalGrade }
    const idx = individualEvals.findIndex((x) => x.id === body.id)
    if (idx !== -1) {
      individualEvals[idx] = {
        ...individualEvals[idx],
        grade: body.grade,
        status: 'evaluated',
        evalAt: new Date().toISOString().split('T')[0],
      }
    }
    return ok(individualEvals[idx])
  }),

  // 평가결과
  http.get('/api/sys03/eval-results', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('current') ?? '1')
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10')
    return ok(paginate(evalResults, page, pageSize))
  }),

  // 업무실적 입력현황
  http.get('/api/sys03/input-status', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('current') ?? '1')
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10')
    return ok(paginate(inputStatuses, page, pageSize))
  }),

  // 추진진도율
  http.get('/api/sys03/progress-rates', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('current') ?? '1')
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10')
    return ok(paginate(progressRates, page, pageSize))
  }),
  http.post('/api/sys03/progress-rates/export', () => {
    return ok({ message: '추진진도율 엑셀 다운로드가 준비되었습니다.' })
  }),

  // 과제검색
  http.get('/api/sys03/task-search', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('current') ?? '1')
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10')
    const keyword = url.searchParams.get('keyword') ?? ''
    const filtered = detailTasks.filter(
      (dt) => !keyword || dt.title.includes(keyword) || dt.deptName.includes(keyword),
    )
    return ok(paginate(filtered, page, pageSize))
  }),
]
