import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker/locale/ko'
import type { ApiResult, PageResponse } from '@/shared/api/types'
import { randomServiceNumber } from '../mockServiceNumber'
import { MARINE_UNITS } from '../mockUnits'

// 타입 정의
export type InspProgressStatus = 'notStarted' | 'inProgress' | 'completed' | 'received'
export type ApprovalStatus = 'pending' | 'inReview' | 'approved' | 'rejected'

export interface InspectionPlan extends Record<string, unknown> {
  id: string
  inspYear: string
  planName: string
  startDate: string
  endDate: string
  targetUnit: string
  taskCount: number
  fileCount: number
  remarks: string
}

export interface InspectionTask extends Record<string, unknown> {
  id: string
  taskNo: string
  taskName: string
  planId: string
  planName: string
  targetUnit: string
  managingDept: string
  /** 담당검열관 군번 */
  inspectorServiceNumber: string
  /** 담당검열관 계급 */
  inspectorRank: string
  /** 담당검열관 성명 */
  inspectorName: string
  /** 공개여부 */
  isPublic: boolean
  inspField: string
  /** 처분종류 */
  dispositionType: string
  /** 주요내용 */
  taskContent: string
  dueDate: string
  progressStatus: InspProgressStatus
  approvalStatus: ApprovalStatus
  submittedAt?: string
  lastUpdated: string
  issues: string
  actionResult: string
}

export interface InspActionHistory extends Record<string, unknown> {
  id: string
  taskId: string
  date: string
  assignee: string
  status: string
  content: string
}

const UNITS = [...MARINE_UNITS]
const INSP_FIELDS = ['전투준비태세', '교육훈련', '군수', '인사', '정보화']
const DISPOSITION_TYPES = ['시정', '주의', '경고', '개선', '보완']
const RANKS = ['대위', '소령', '중령', '대령', '상사', '중사']
const PROGRESS_STATUSES: InspProgressStatus[] = ['notStarted', 'inProgress', 'completed', 'received']
const APPROVAL_STATUSES: ApprovalStatus[] = ['pending', 'inReview', 'approved', 'rejected']

// 부대 트리 데이터 (조직도)
const UNIT_TREE = [
  {
    key: 'hq',
    title: '해병대사령부',
    children: [
      { key: '1div', title: '1사단', children: [] },
      { key: '2div', title: '2사단', children: [] },
      { key: 'edu', title: '교육훈련단', children: [] },
      { key: 'amph', title: '상륙기동단', children: [] },
    ],
  },
]

// 선택된 검열부대 저장
let selectedUnitIds: string[] = ['1div', '2div']

// Mock 데이터: 검열계획 10건
let plans: InspectionPlan[] = Array.from({ length: 10 }, (_, i) => {
  const year = (2022 + Math.floor(i / 2)).toString()
  const start = faker.date.past({ years: 2 })
  const end = new Date(start)
  end.setDate(end.getDate() + faker.number.int({ min: 3, max: 14 }))
  return {
    id: `plan-${i + 1}`,
    inspYear: year,
    planName: `${year}년도 ${UNITS[i % UNITS.length]} 종합 검열 계획`,
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
    targetUnit: UNITS[i % UNITS.length],
    taskCount: faker.number.int({ min: 5, max: 20 }),
    fileCount: faker.number.int({ min: 0, max: 5 }),
    remarks: faker.lorem.sentence(),
  }
})

// Mock 데이터: 조치과제 30건
let tasks: InspectionTask[] = Array.from({ length: 30 }, (_, i) => {
  const planIndex = i % plans.length
  const progressStatus = PROGRESS_STATUSES[i % PROGRESS_STATUSES.length]
  return {
    id: `task-${i + 1}`,
    taskNo: `TASK-${String(i + 1).padStart(3, '0')}`,
    taskName: `${INSP_FIELDS[i % INSP_FIELDS.length]} 분야 ${i + 1}번 조치과제`,
    planId: plans[planIndex].id,
    planName: plans[planIndex].planName,
    targetUnit: UNITS[i % UNITS.length],
    managingDept: faker.helpers.arrayElement(['작전처', '군수처', '인사처', '정보처', '교육처']),
    inspectorServiceNumber: randomServiceNumber(),
    inspectorRank: faker.helpers.arrayElement(RANKS),
    inspectorName: faker.person.lastName() + faker.person.firstName(),
    isPublic: faker.datatype.boolean(),
    inspField: INSP_FIELDS[i % INSP_FIELDS.length],
    dispositionType: faker.helpers.arrayElement(DISPOSITION_TYPES),
    taskContent: faker.lorem.sentences(2),
    dueDate: faker.date.future({ years: 1 }).toISOString().split('T')[0],
    progressStatus,
    approvalStatus: APPROVAL_STATUSES[i % APPROVAL_STATUSES.length],
    submittedAt:
      progressStatus === 'received' || progressStatus === 'completed'
        ? faker.date.recent({ days: 30 }).toISOString().split('T')[0]
        : undefined,
    lastUpdated: faker.date.recent({ days: 7 }).toISOString().split('T')[0],
    issues: faker.lorem.sentence(),
    actionResult: faker.lorem.sentences(2),
  }
})

// Mock 데이터: 이력 50건
const histories: InspActionHistory[] = Array.from({ length: 50 }, (_, i) => ({
  id: `hist-${i + 1}`,
  taskId: `task-${(i % 30) + 1}`,
  date: faker.date.recent({ days: 60 }).toISOString().split('T')[0],
  assignee: faker.person.lastName() + faker.person.firstName(),
  status: PROGRESS_STATUSES[i % PROGRESS_STATUSES.length],
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

export const sys17Handlers = [
  // 검열부대 목록 (트리 구조)
  http.get('/api/sys17/units', () => {
    const result: ApiResult<{ tree: typeof UNIT_TREE; selectedIds: string[] }> = {
      success: true,
      data: { tree: UNIT_TREE, selectedIds: selectedUnitIds },
    }
    return HttpResponse.json(result)
  }),

  // 검열부대 저장
  http.put('/api/sys17/units', async ({ request }) => {
    const body = (await request.json()) as { unitIds: string[] }
    selectedUnitIds = body.unitIds
    const result: ApiResult<null> = { success: true, data: null }
    return HttpResponse.json(result)
  }),

  // 검열계획 목록
  http.get('/api/sys17/plans', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    const inspYear = url.searchParams.get('inspYear') || ''
    const planName = url.searchParams.get('planName') || ''
    const targetUnit = url.searchParams.get('targetUnit') || ''

    let filtered = [...plans]
    if (inspYear) filtered = filtered.filter((p) => p.inspYear === inspYear)
    if (planName) filtered = filtered.filter((p) => p.planName.includes(planName))
    if (targetUnit) filtered = filtered.filter((p) => p.targetUnit === targetUnit)

    const result: ApiResult<PageResponse<InspectionPlan>> = {
      success: true,
      data: paginate(filtered, page, size),
    }
    return HttpResponse.json(result)
  }),

  // 검열계획 상세
  http.get('/api/sys17/plans/:id', ({ params }) => {
    const plan = plans.find((p) => p.id === params.id)
    if (!plan) {
      return HttpResponse.json({ success: false, message: '검열계획을 찾을 수 없습니다' }, { status: 404 })
    }
    const result: ApiResult<InspectionPlan> = { success: true, data: plan }
    return HttpResponse.json(result)
  }),

  // 검열계획 등록
  http.post('/api/sys17/plans', async ({ request }) => {
    const body = (await request.json()) as Partial<InspectionPlan>
    const newPlan: InspectionPlan = {
      id: `plan-${Date.now()}`,
      inspYear: body.inspYear || new Date().getFullYear().toString(),
      planName: body.planName || '신규 검열계획',
      startDate: body.startDate || '',
      endDate: body.endDate || '',
      targetUnit: body.targetUnit || '',
      taskCount: 0,
      fileCount: 0,
      remarks: body.remarks || '',
    }
    plans = [newPlan, ...plans]
    const result: ApiResult<InspectionPlan> = { success: true, data: newPlan }
    return HttpResponse.json(result)
  }),

  // 검열계획 수정
  http.put('/api/sys17/plans/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<InspectionPlan>
    const index = plans.findIndex((p) => p.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ success: false, message: '검열계획을 찾을 수 없습니다' }, { status: 404 })
    }
    plans[index] = { ...plans[index], ...body }
    const result: ApiResult<InspectionPlan> = { success: true, data: plans[index] }
    return HttpResponse.json(result)
  }),

  // 검열계획 삭제
  http.delete('/api/sys17/plans/:id', ({ params }) => {
    const index = plans.findIndex((p) => p.id === params.id)
    if (index !== -1) plans.splice(index, 1)
    const result: ApiResult<null> = { success: true, data: null }
    return HttpResponse.json(result)
  }),

  // 조치과제 목록
  http.get('/api/sys17/tasks', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    const inspYear = url.searchParams.get('inspYear') || ''
    const targetUnit = url.searchParams.get('targetUnit') || ''
    const taskName = url.searchParams.get('taskName') || ''
    const taskNo = url.searchParams.get('taskNo') || ''
    const progressStatus = url.searchParams.get('progressStatus') || ''
    const inspField = url.searchParams.get('inspField') || ''
    const managingDept = url.searchParams.get('managingDept') || ''

    let filtered = [...tasks]
    if (inspYear) filtered = filtered.filter((t) => plans.find((p) => p.id === t.planId)?.inspYear === inspYear)
    if (targetUnit) filtered = filtered.filter((t) => t.targetUnit === targetUnit)
    if (taskName) filtered = filtered.filter((t) => t.taskName.includes(taskName))
    if (taskNo) filtered = filtered.filter((t) => t.taskNo.includes(taskNo))
    if (progressStatus) filtered = filtered.filter((t) => t.progressStatus === progressStatus)
    if (inspField) filtered = filtered.filter((t) => t.inspField === inspField)
    if (managingDept) filtered = filtered.filter((t) => t.managingDept === managingDept)

    const result: ApiResult<PageResponse<InspectionTask>> = {
      success: true,
      data: paginate(filtered, page, size),
    }
    return HttpResponse.json(result)
  }),

  // 조치과제 상세
  http.get('/api/sys17/tasks/:id', ({ params }) => {
    const task = tasks.find((t) => t.id === params.id)
    if (!task) {
      return HttpResponse.json({ success: false, message: '조치과제를 찾을 수 없습니다' }, { status: 404 })
    }
    const result: ApiResult<InspectionTask> = { success: true, data: task }
    return HttpResponse.json(result)
  }),

  // 조치과제 등록
  http.post('/api/sys17/tasks', async ({ request }) => {
    const body = (await request.json()) as Partial<InspectionTask>
    const plan = plans.find((p) => p.id === body.planId)
    const newTask: InspectionTask = {
      id: `task-${Date.now()}`,
      taskNo: body.taskNo || `TASK-${String(tasks.length + 1).padStart(3, '0')}`,
      taskName: body.taskName || '',
      planId: body.planId || '',
      planName: plan?.planName || '',
      targetUnit: body.targetUnit || '',
      managingDept: body.managingDept || '',
      inspectorServiceNumber: (body.inspectorServiceNumber as string) || '',
      inspectorRank: (body.inspectorRank as string) || '',
      inspectorName: (body.inspectorName as string) || '',
      isPublic: (body.isPublic as boolean) ?? true,
      inspField: body.inspField || '',
      dispositionType: (body.dispositionType as string) || '',
      taskContent: body.taskContent || '',
      dueDate: body.dueDate || '',
      progressStatus: 'notStarted',
      approvalStatus: 'pending',
      lastUpdated: new Date().toISOString().split('T')[0],
      issues: '',
      actionResult: '',
    }
    tasks = [newTask, ...tasks]
    const result: ApiResult<InspectionTask> = { success: true, data: newTask }
    return HttpResponse.json(result)
  }),

  // 조치과제 수정
  http.put('/api/sys17/tasks/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<InspectionTask>
    const index = tasks.findIndex((t) => t.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ success: false, message: '조치과제를 찾을 수 없습니다' }, { status: 404 })
    }
    tasks[index] = { ...tasks[index], ...body }
    const result: ApiResult<InspectionTask> = { success: true, data: tasks[index] }
    return HttpResponse.json(result)
  }),

  // 조치과제 삭제
  http.delete('/api/sys17/tasks/:id', ({ params }) => {
    const index = tasks.findIndex((t) => t.id === params.id)
    if (index !== -1) tasks.splice(index, 1)
    const result: ApiResult<null> = { success: true, data: null }
    return HttpResponse.json(result)
  }),

  // 조치결과 입력
  http.put('/api/sys17/tasks/:id/result', async ({ params, request }) => {
    const body = (await request.json()) as {
      progressStatus: InspProgressStatus
      issues: string
      actionResult: string
    }
    const index = tasks.findIndex((t) => t.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ success: false, message: '조치과제를 찾을 수 없습니다' }, { status: 404 })
    }
    tasks[index] = {
      ...tasks[index],
      progressStatus: body.progressStatus,
      issues: body.issues || '',
      actionResult: body.actionResult || '',
      lastUpdated: new Date().toISOString().split('T')[0],
    }
    const result: ApiResult<InspectionTask> = { success: true, data: tasks[index] }
    return HttpResponse.json(result)
  }),

  // 과제처리 이력 (Timeline용)
  http.get('/api/sys17/tasks/:id/history', ({ params }) => {
    const taskHistories = histories
      .filter((h) => h.taskId === params.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const result: ApiResult<InspActionHistory[]> = { success: true, data: taskHistories }
    return HttpResponse.json(result)
  }),

  // 접수대기 목록 (검색조건: 연도, 대상부대, 검열분야, 조치부대, 과제명)
  http.get('/api/sys17/approval/pending', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    const inspYear = url.searchParams.get('inspYear') || ''
    const targetUnit = url.searchParams.get('targetUnit') || ''
    const inspField = url.searchParams.get('inspField') || ''
    const taskName = url.searchParams.get('taskName') || ''

    let pending = tasks.filter((t) => t.approvalStatus === 'pending' || t.approvalStatus === 'inReview')
    if (inspYear) pending = pending.filter((t) => plans.find((p) => p.id === t.planId)?.inspYear === inspYear)
    if (targetUnit) pending = pending.filter((t) => t.targetUnit === targetUnit)
    if (inspField) pending = pending.filter((t) => t.inspField === inspField)
    if (taskName) pending = pending.filter((t) => t.taskName.includes(taskName))

    const result: ApiResult<PageResponse<InspectionTask>> = {
      success: true,
      data: paginate(pending, page, size),
    }
    return HttpResponse.json(result)
  }),

  // 접수(승인)
  http.put('/api/sys17/approval/:taskId/approve', ({ params }) => {
    const index = tasks.findIndex((t) => t.id === params.taskId)
    if (index === -1) {
      return HttpResponse.json({ success: false, message: '과제를 찾을 수 없습니다' }, { status: 404 })
    }
    tasks[index] = {
      ...tasks[index],
      approvalStatus: 'approved',
      progressStatus: 'received',
    }
    const result: ApiResult<InspectionTask> = { success: true, data: tasks[index] }
    return HttpResponse.json(result)
  }),

  // 반송(반려)
  http.put('/api/sys17/approval/:taskId/reject', async ({ params, request }) => {
    const body = (await request.json()) as { reason: string }
    const index = tasks.findIndex((t) => t.id === params.taskId)
    if (index === -1) {
      return HttpResponse.json({ success: false, message: '과제를 찾을 수 없습니다' }, { status: 404 })
    }
    tasks[index] = {
      ...tasks[index],
      approvalStatus: 'rejected',
      issues: body.reason || '',
    }
    const result: ApiResult<InspectionTask> = { success: true, data: tasks[index] }
    return HttpResponse.json(result)
  }),

  // 결재선 데이터 (Steps 시각화용)
  http.get('/api/sys17/approval/:taskId/line', ({ params }) => {
    const task = tasks.find((t) => t.id === params.taskId)
    const approvalLine = [
      {
        step: 0,
        title: '조치결과 보고',
        description: '담당자',
        status: 'finish' as const,
        assignee: faker.person.lastName() + faker.person.firstName(),
      },
      {
        step: 1,
        title: '중간 결재',
        description: '결재자',
        status:
          task?.approvalStatus === 'inReview' || task?.approvalStatus === 'approved' || task?.approvalStatus === 'rejected'
            ? ('finish' as const)
            : ('wait' as const),
        assignee: faker.person.lastName() + faker.person.firstName(),
      },
      {
        step: 2,
        title: '최종 접수',
        description: '승인권자',
        status: task?.approvalStatus === 'approved' ? ('finish' as const) : ('wait' as const),
        assignee: faker.person.lastName() + faker.person.firstName(),
      },
    ]
    const result: ApiResult<typeof approvalLine> = { success: true, data: approvalLine }
    return HttpResponse.json(result)
  }),

  // 추진현황 통계
  http.get('/api/sys17/stats/progress', () => {
    const total = tasks.length
    const completed = tasks.filter((t) => t.progressStatus === 'completed' || t.progressStatus === 'received').length
    const inProgress = tasks.filter((t) => t.progressStatus === 'inProgress').length
    const notStarted = tasks.filter((t) => t.progressStatus === 'notStarted').length

    const unitStats = UNITS.map((unitName) => {
      const unitTasks = tasks.filter((t) => t.targetUnit === unitName)
      const unitCompleted = unitTasks.filter(
        (t) => t.progressStatus === 'completed' || t.progressStatus === 'received',
      ).length
      const unitInProgress = unitTasks.filter((t) => t.progressStatus === 'inProgress').length
      const unitNotStarted = unitTasks.filter((t) => t.progressStatus === 'notStarted').length
      return {
        unitName,
        totalTasks: unitTasks.length,
        completed: unitCompleted,
        inProgress: unitInProgress,
        notStarted: unitNotStarted,
        completionRate: unitTasks.length > 0 ? Math.round((unitCompleted / unitTasks.length) * 100) : 0,
      }
    })

    const result: ApiResult<{
      total: number
      completed: number
      inProgress: number
      notStarted: number
      unitStats: typeof unitStats
    }> = {
      success: true,
      data: { total, completed, inProgress, notStarted, unitStats },
    }
    return HttpResponse.json(result)
  }),
]
