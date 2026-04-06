import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker/locale/ko'
import type { ApiResult, PageResponse } from '@/shared/api/types'

// 타입 정의
export type JobDescType = 'personal' | 'position' | 'department'
export type JobDescStatus = 'draft' | 'submitted' | 'approved_1st' | 'completed' | 'rejected'
export type OrgDiagnosisProgressStatus = 'preparing' | 'inProgress' | 'completed'

export interface JobDescTask extends Record<string, unknown> {
  taskType: '정책' | '관리' | '지원' | '기타'
  taskName: string
  taskDetail: string
  ratio: number
}

export interface JobDescTimeAllocation extends Record<string, unknown> {
  taskName: string
  weeklyHours: number
  percentage: number
}

export interface JobDescCompetency extends Record<string, unknown> {
  requiredCompetency: string
  requiredQualification: string
  educationRequired: string
  experienceRequired: string
  specialNote: string
}

export interface JobDesc extends Record<string, unknown> {
  id: string
  type: JobDescType
  diagnosisId: string
  diagnosisName: string
  writerId: string
  writerName: string
  writerMilitaryId: string
  rank: string
  position: string
  department: string
  unit: string
  phone: string
  status: JobDescStatus
  tasks: JobDescTask[]
  timeAllocation: JobDescTimeAllocation[]
  competency: JobDescCompetency
  createdAt: string
  submittedAt?: string
}

export interface OrgDiagnosis extends Record<string, unknown> {
  id: string
  diagnosisName: string
  diagnosisUnit: string
  writePeriodStart: string
  writePeriodEnd: string
  diagnosisPeriodStart: string
  diagnosisPeriodEnd: string
  targetUsers: string[]
  targetCount: number
  progressStatus: OrgDiagnosisProgressStatus
}

export interface Approver extends Record<string, unknown> {
  id: string
  department: string
  firstApprover: string
  firstApproverId: string
  secondApprover: string
  secondApproverId: string
}

export interface ApprovalItem extends Record<string, unknown> {
  id: string
  jobDescId: string
  writerName: string
  department: string
  jobDescType: string
  submittedAt: string
  approvalStep: '1차' | '2차'
  status: JobDescStatus
  rejectReason?: string
}

// 상수
const RANKS = ['하사', '중사', '상사', '원사', '준위', '소위', '중위', '대위', '소령', '중령']
const DEPARTMENTS = ['인사처', '작전처', '군수처', '정보처', '교육처', '동원처']
const UNITS = ['해병대사령부', '1사단', '2사단', '교육훈련단', '상륙기동단']
const TASK_TYPES: JobDescTask['taskType'][] = ['정책', '관리', '지원', '기타']
const JD_STATUSES: JobDescStatus[] = ['draft', 'submitted', 'approved_1st', 'completed', 'rejected']
const JD_TYPES: JobDescType[] = ['personal', 'position', 'department']

function makeTasksWithRatio(): JobDescTask[] {
  const count = faker.number.int({ min: 2, max: 4 })
  const tasks: JobDescTask[] = []
  let remaining = 100
  for (let i = 0; i < count; i++) {
    const ratio = i === count - 1 ? remaining : faker.number.int({ min: 10, max: Math.min(remaining - 10 * (count - i - 1), 60) })
    remaining -= ratio
    tasks.push({
      taskType: TASK_TYPES[faker.number.int({ min: 0, max: 3 })],
      taskName: faker.company.buzzPhrase(),
      taskDetail: faker.lorem.sentence(),
      ratio,
    })
  }
  return tasks
}

function makeJobDesc(i: number): JobDesc {
  const tasks = makeTasksWithRatio()
  const diagnosisId = `diag-${(i % 5) + 1}`
  const diagnosisName = `2024년도 직무기술서 조직진단 ${(i % 5) + 1}차`
  const type: JobDescType = JD_TYPES[i % 3]
  const deptIdx = i % DEPARTMENTS.length
  return {
    id: `jd-${i + 1}`,
    type,
    diagnosisId,
    diagnosisName,
    writerId: `user-${i + 1}`,
    writerName: faker.person.fullName(),
    writerMilitaryId: `22-${faker.number.int({ min: 10000, max: 99999 })}`,
    rank: RANKS[i % RANKS.length],
    position: `${faker.company.buzzNoun()} 담당`,
    department: DEPARTMENTS[deptIdx],
    unit: UNITS[i % UNITS.length],
    phone: `010-${faker.number.int({ min: 1000, max: 9999 })}-${faker.number.int({ min: 1000, max: 9999 })}`,
    status: JD_STATUSES[i % JD_STATUSES.length],
    tasks,
    timeAllocation: tasks.map((t) => ({
      taskName: t.taskName,
      weeklyHours: faker.number.int({ min: 2, max: 20 }),
      percentage: t.ratio,
    })),
    competency: {
      requiredCompetency: faker.lorem.sentence(),
      requiredQualification: faker.lorem.sentence(),
      educationRequired: faker.lorem.sentence(),
      experienceRequired: faker.lorem.sentence(),
      specialNote: faker.lorem.sentence(),
    },
    createdAt: faker.date.past({ years: 1 }).toISOString().split('T')[0],
    submittedAt:
      ['submitted', 'approved_1st', 'completed', 'rejected'].includes(JD_STATUSES[i % JD_STATUSES.length])
        ? faker.date.recent({ days: 30 }).toISOString().split('T')[0]
        : undefined,
  }
}

function makeOrgDiagnosis(i: number): OrgDiagnosis {
  const writeStart = faker.date.future({ years: 0.1 })
  const writeEnd = new Date(writeStart)
  writeEnd.setDate(writeEnd.getDate() + 14)
  const diagStart = new Date(writeEnd)
  diagStart.setDate(diagStart.getDate() + 7)
  const diagEnd = new Date(diagStart)
  diagEnd.setDate(diagEnd.getDate() + 30)
  const statuses: OrgDiagnosisProgressStatus[] = ['preparing', 'inProgress', 'completed']
  return {
    id: `diag-${i + 1}`,
    diagnosisName: `2024년도 직무기술서 조직진단 ${i + 1}차`,
    diagnosisUnit: UNITS[i % UNITS.length],
    writePeriodStart: writeStart.toISOString().split('T')[0],
    writePeriodEnd: writeEnd.toISOString().split('T')[0],
    diagnosisPeriodStart: diagStart.toISOString().split('T')[0],
    diagnosisPeriodEnd: diagEnd.toISOString().split('T')[0],
    targetUsers: Array.from({ length: faker.number.int({ min: 3, max: 10 }) }, () => `user-${faker.number.int({ min: 1, max: 20 })}`),
    targetCount: faker.number.int({ min: 10, max: 50 }),
    progressStatus: statuses[i % statuses.length],
  }
}

function makeApprover(i: number): Approver {
  return {
    id: `approver-${i + 1}`,
    department: DEPARTMENTS[i % DEPARTMENTS.length],
    firstApprover: faker.person.fullName(),
    firstApproverId: `user-${i * 2 + 1}`,
    secondApprover: faker.person.fullName(),
    secondApproverId: `user-${i * 2 + 2}`,
  }
}

function makeApprovalItem(i: number, jd: JobDesc): ApprovalItem {
  const approvalStatuses: JobDescStatus[] = ['submitted', 'submitted', 'submitted', 'approved_1st', 'approved_1st', 'completed', 'completed', 'rejected']
  const status = approvalStatuses[i % approvalStatuses.length]
  return {
    id: `approval-${i + 1}`,
    jobDescId: jd.id,
    writerName: jd.writerName,
    department: jd.department,
    jobDescType: jd.type === 'personal' ? '개인' : jd.type === 'position' ? '직책' : '부서',
    submittedAt: faker.date.recent({ days: 10 }).toISOString().split('T')[0],
    approvalStep: status === 'approved_1st' || status === 'completed' ? '2차' : '1차',
    status,
    rejectReason: status === 'rejected' ? faker.lorem.sentence() : undefined,
  }
}

export type RankCategory = '장관' | '영관' | '부사관' | '원사' | '병'

export interface StandardWorkHour extends Record<string, unknown> {
  id: string
  rankCategory: RankCategory
  standardHours: number
  periodStart: string
  periodEnd: string
}

function makeStandardWorkHour(rankCategory: RankCategory, standardHours: number, periodStart: string, periodEnd: string): StandardWorkHour {
  return {
    id: `swh-${rankCategory}`,
    rankCategory,
    standardHours,
    periodStart,
    periodEnd,
  }
}

// 표준업무시간 Mock 5건 (만료1, 적용중3, 예정1)
let standardWorkHours: StandardWorkHour[] = [
  makeStandardWorkHour('장관', 40, '2023-01-01', '2023-12-31'), // 만료
  makeStandardWorkHour('영관', 42, '2024-01-01', '2026-12-31'), // 적용중
  makeStandardWorkHour('부사관', 44, '2024-01-01', '2026-12-31'), // 적용중
  makeStandardWorkHour('원사', 44, '2024-06-01', '2026-06-30'), // 적용중
  makeStandardWorkHour('병', 40, '2027-01-01', '2027-12-31'), // 예정
]

// Mock 데이터 초기화
let jobDescs: JobDesc[] = Array.from({ length: 20 }, (_, i) => makeJobDesc(i))
let orgDiagnoses: OrgDiagnosis[] = Array.from({ length: 5 }, (_, i) => makeOrgDiagnosis(i))
let approvers: Approver[] = Array.from({ length: 5 }, (_, i) => makeApprover(i))
let approvalItems: ApprovalItem[] = Array.from({ length: 8 }, (_, i) => makeApprovalItem(i, jobDescs[i]))

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

export const sys18Handlers = [
  // 직무기술서 목록 (페이지네이션 + 필터)
  http.get('/api/sys18/job-descs', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') ?? '0')
    const size = parseInt(url.searchParams.get('size') ?? '10')
    const type = url.searchParams.get('type')
    const status = url.searchParams.get('status')
    const diagnosisId = url.searchParams.get('diagnosisId')
    let filtered = [...jobDescs]
    if (type) filtered = filtered.filter((j) => j.type === type)
    if (status) filtered = filtered.filter((j) => j.status === status)
    if (diagnosisId) filtered = filtered.filter((j) => j.diagnosisId === diagnosisId)
    const result: ApiResult<PageResponse<JobDesc>> = { success: true, data: paginate(filtered, page, size) }
    return HttpResponse.json(result)
  }),

  // 직무기술서 상세
  http.get('/api/sys18/job-descs/:id', ({ params }) => {
    const jd = jobDescs.find((j) => j.id === params.id)
    if (!jd) return HttpResponse.json({ success: false, message: '직무기술서를 찾을 수 없습니다.' }, { status: 404 })
    return HttpResponse.json({ success: true, data: jd } as ApiResult<JobDesc>)
  }),

  // 직무기술서 등록
  http.post('/api/sys18/job-descs', async ({ request }) => {
    const body = await request.json() as Partial<JobDesc>
    const newJd: JobDesc = {
      ...makeJobDesc(jobDescs.length),
      ...body,
      id: `jd-${Date.now()}`,
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
    } as JobDesc
    jobDescs = [newJd, ...jobDescs]
    return HttpResponse.json({ success: true, data: newJd } as ApiResult<JobDesc>)
  }),

  // 직무기술서 수정
  http.put('/api/sys18/job-descs/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<JobDesc>
    jobDescs = jobDescs.map((j) => j.id === params.id ? { ...j, ...body } : j)
    const updated = jobDescs.find((j) => j.id === params.id)
    return HttpResponse.json({ success: true, data: updated } as ApiResult<JobDesc>)
  }),

  // 직무기술서 삭제
  http.delete('/api/sys18/job-descs/:id', ({ params }) => {
    jobDescs = jobDescs.filter((j) => j.id !== params.id)
    return HttpResponse.json({ success: true } as ApiResult<null>)
  }),

  // 임시저장
  http.put('/api/sys18/job-descs/:id/draft', async ({ params, request }) => {
    const body = await request.json() as Partial<JobDesc>
    jobDescs = jobDescs.map((j) =>
      j.id === params.id ? { ...j, ...body, status: 'draft' } : j,
    )
    return HttpResponse.json({ success: true } as ApiResult<null>)
  }),

  // 결재 요청 (제출)
  http.put('/api/sys18/job-descs/:id/submit', ({ params }) => {
    jobDescs = jobDescs.map((j) =>
      j.id === params.id ? { ...j, status: 'submitted', submittedAt: new Date().toISOString().split('T')[0] } : j,
    )
    return HttpResponse.json({ success: true } as ApiResult<null>)
  }),

  // 직무기술서 복사
  http.post('/api/sys18/job-descs/:id/copy', ({ params }) => {
    const original = jobDescs.find((j) => j.id === params.id)
    if (!original) return HttpResponse.json({ success: false }, { status: 404 })
    const copied: JobDesc = { ...original, id: `jd-${Date.now()}`, status: 'draft', createdAt: new Date().toISOString().split('T')[0] }
    jobDescs = [copied, ...jobDescs]
    return HttpResponse.json({ success: true, data: copied } as ApiResult<JobDesc>)
  }),

  // 조직진단 목록
  http.get('/api/sys18/org-diagnosis', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') ?? '0')
    const size = parseInt(url.searchParams.get('size') ?? '10')
    const result: ApiResult<PageResponse<OrgDiagnosis>> = { success: true, data: paginate(orgDiagnoses, page, size) }
    return HttpResponse.json(result)
  }),

  // 조직진단 등록
  http.post('/api/sys18/org-diagnosis', async ({ request }) => {
    const body = await request.json() as Partial<OrgDiagnosis>
    const newItem: OrgDiagnosis = { ...makeOrgDiagnosis(orgDiagnoses.length), ...body, id: `diag-${Date.now()}` } as OrgDiagnosis
    orgDiagnoses = [newItem, ...orgDiagnoses]
    return HttpResponse.json({ success: true, data: newItem } as ApiResult<OrgDiagnosis>)
  }),

  // 조직진단 수정
  http.put('/api/sys18/org-diagnosis/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<OrgDiagnosis>
    orgDiagnoses = orgDiagnoses.map((d) => d.id === params.id ? { ...d, ...body } : d)
    const updated = orgDiagnoses.find((d) => d.id === params.id)
    return HttpResponse.json({ success: true, data: updated } as ApiResult<OrgDiagnosis>)
  }),

  // 조직진단 삭제
  http.delete('/api/sys18/org-diagnosis/:id', ({ params }) => {
    orgDiagnoses = orgDiagnoses.filter((d) => d.id !== params.id)
    return HttpResponse.json({ success: true } as ApiResult<null>)
  }),

  // 표준업무시간 조회
  http.get('/api/sys18/standard-hours', () => {
    return HttpResponse.json({ success: true, data: { standardHours: 40 } } as ApiResult<{ standardHours: number }>)
  }),

  // 결재대기 목록
  http.get('/api/sys18/approvals', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') ?? '0')
    const size = parseInt(url.searchParams.get('size') ?? '10')
    const status = url.searchParams.get('status')
    let filtered = [...approvalItems]
    if (status) filtered = filtered.filter((a) => a.status === status)
    const result: ApiResult<PageResponse<ApprovalItem>> = { success: true, data: paginate(filtered, page, size) }
    return HttpResponse.json(result)
  }),

  // 결재 승인
  http.put('/api/sys18/approvals/:id/approve', ({ params }) => {
    approvalItems = approvalItems.map((a) => {
      if (a.id !== params.id) return a
      const nextStatus: JobDescStatus = a.status === 'submitted' ? 'approved_1st' : 'completed'
      return { ...a, status: nextStatus }
    })
    return HttpResponse.json({ success: true } as ApiResult<null>)
  }),

  // 결재 반려
  http.put('/api/sys18/approvals/:id/reject', async ({ params, request }) => {
    const body = await request.json() as { rejectReason: string }
    approvalItems = approvalItems.map((a) =>
      a.id === params.id ? { ...a, status: 'rejected' as JobDescStatus, rejectReason: body.rejectReason } : a,
    )
    return HttpResponse.json({ success: true } as ApiResult<null>)
  }),

  // 재결재 요청
  http.put('/api/sys18/approvals/:id/resubmit', ({ params }) => {
    approvalItems = approvalItems.map((a) =>
      a.id === params.id ? { ...a, status: 'submitted' as JobDescStatus, rejectReason: undefined } : a,
    )
    return HttpResponse.json({ success: true } as ApiResult<null>)
  }),

  // 결재자 목록
  http.get('/api/sys18/approvers', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') ?? '0')
    const size = parseInt(url.searchParams.get('size') ?? '10')
    const department = url.searchParams.get('department')
    let filtered = [...approvers]
    if (department) filtered = filtered.filter((a) => a.department === department)
    const result: ApiResult<PageResponse<Approver>> = { success: true, data: paginate(filtered, page, size) }
    return HttpResponse.json(result)
  }),

  // 결재자 등록
  http.post('/api/sys18/approvers', async ({ request }) => {
    const body = await request.json() as Partial<Approver>
    const newApprover: Approver = { ...makeApprover(approvers.length), ...body, id: `approver-${Date.now()}` } as Approver
    approvers = [...approvers, newApprover]
    return HttpResponse.json({ success: true, data: newApprover } as ApiResult<Approver>)
  }),

  // 결재자 수정
  http.put('/api/sys18/approvers/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<Approver>
    approvers = approvers.map((a) => a.id === params.id ? { ...a, ...body } : a)
    const updated = approvers.find((a) => a.id === params.id)
    return HttpResponse.json({ success: true, data: updated } as ApiResult<Approver>)
  }),

  // 결재자 삭제
  http.delete('/api/sys18/approvers/:id', ({ params }) => {
    approvers = approvers.filter((a) => a.id !== params.id)
    return HttpResponse.json({ success: true } as ApiResult<null>)
  }),

  // 관리자용 직무기술서 목록
  http.get('/api/sys18/job-descs/admin', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') ?? '0')
    const size = parseInt(url.searchParams.get('size') ?? '10')
    const type = url.searchParams.get('type')
    const status = url.searchParams.get('status')
    const keyword = url.searchParams.get('keyword')
    const unit = url.searchParams.get('unit')
    let filtered = [...jobDescs]
    if (type) filtered = filtered.filter((j) => j.type === type)
    if (status) filtered = filtered.filter((j) => j.status === status)
    if (keyword) filtered = filtered.filter((j) => j.writerName.includes(keyword) || j.diagnosisName.includes(keyword))
    if (unit) filtered = filtered.filter((j) => j.unit.includes(unit) || j.department.includes(unit))
    const result: ApiResult<PageResponse<JobDesc>> = { success: true, data: paginate(filtered, page, size) }
    return HttpResponse.json(result)
  }),

  // 검토결과 입력
  http.put('/api/sys18/job-descs/:id/review', async ({ params, request }) => {
    const body = await request.json() as { reviewResult: string; reviewComment: string }
    jobDescs = jobDescs.map((j) =>
      j.id === params.id ? { ...j, ...body } : j,
    )
    return HttpResponse.json({ success: true } as ApiResult<null>)
  }),

  // 의견보내기
  http.post('/api/sys18/job-descs/:id/opinion', async ({ params, request }) => {
    await request.json()
    const exists = jobDescs.find((j) => j.id === params.id)
    if (!exists) return HttpResponse.json({ success: false }, { status: 404 })
    return HttpResponse.json({ success: true } as ApiResult<null>)
  }),

  // 반송
  http.put('/api/sys18/job-descs/:id/return', async ({ params, request }) => {
    const body = await request.json() as { returnReason: string }
    jobDescs = jobDescs.map((j) =>
      j.id === params.id ? { ...j, status: 'rejected' as const, returnReason: body.returnReason } : j,
    )
    return HttpResponse.json({ success: true } as ApiResult<null>)
  }),

  // 통계: 부대별 작성현황
  http.get('/api/sys18/stats/by-unit', () => {
    const unitStats = UNITS.map((unit) => {
      const unitJds = jobDescs.filter((j) => j.unit === unit)
      return {
        unit,
        completed: unitJds.filter((j) => j.status === 'completed').length,
        inProgress: unitJds.filter((j) => ['submitted', 'approved_1st', 'draft'].includes(j.status)).length,
        notStarted: faker.number.int({ min: 0, max: 5 }),
      }
    })
    return HttpResponse.json({ success: true, data: unitStats } as ApiResult<typeof unitStats>)
  }),

  // 통계: 직급별 현황
  http.get('/api/sys18/stats/by-rank', () => {
    const rankStats = RANKS.map((rank) => ({
      rank,
      count: jobDescs.filter((j) => j.rank === rank).length,
    }))
    return HttpResponse.json({ success: true, data: rankStats } as ApiResult<typeof rankStats>)
  }),

  // 통계: 업무분류별 분포
  http.get('/api/sys18/stats/by-task-type', () => {
    const taskTypeMap: Record<string, number> = { '정책': 0, '관리': 0, '지원': 0, '기타': 0 }
    jobDescs.forEach((jd) => {
      jd.tasks.forEach((task) => {
        if (taskTypeMap[task.taskType] !== undefined) {
          taskTypeMap[task.taskType] = (taskTypeMap[task.taskType] ?? 0) + 1
        }
      })
    })
    const data = Object.entries(taskTypeMap).map(([taskType, count]) => ({ taskType, count }))
    return HttpResponse.json({ success: true, data } as ApiResult<typeof data>)
  }),

  // 표준업무시간 목록 (CRUD용)
  http.get('/api/sys18/standard-work-hours', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') ?? '0')
    const size = parseInt(url.searchParams.get('size') ?? '10')
    const result: ApiResult<PageResponse<StandardWorkHour>> = { success: true, data: paginate(standardWorkHours, page, size) }
    return HttpResponse.json(result)
  }),

  // 표준업무시간 등록
  http.post('/api/sys18/standard-work-hours', async ({ request }) => {
    const body = await request.json() as Partial<StandardWorkHour>
    const newItem: StandardWorkHour = {
      id: `swh-${Date.now()}`,
      rankCategory: body.rankCategory ?? '병',
      standardHours: body.standardHours ?? 40,
      periodStart: body.periodStart ?? new Date().toISOString().split('T')[0],
      periodEnd: body.periodEnd ?? new Date().toISOString().split('T')[0],
    }
    standardWorkHours = [newItem, ...standardWorkHours]
    return HttpResponse.json({ success: true, data: newItem } as ApiResult<StandardWorkHour>)
  }),

  // 표준업무시간 수정
  http.put('/api/sys18/standard-work-hours/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<StandardWorkHour>
    standardWorkHours = standardWorkHours.map((s) => s.id === params.id ? { ...s, ...body } : s)
    const updated = standardWorkHours.find((s) => s.id === params.id)
    return HttpResponse.json({ success: true, data: updated } as ApiResult<StandardWorkHour>)
  }),

  // 표준업무시간 삭제
  http.delete('/api/sys18/standard-work-hours/:id', ({ params }) => {
    standardWorkHours = standardWorkHours.filter((s) => s.id !== params.id)
    return HttpResponse.json({ success: true } as ApiResult<null>)
  }),
]
