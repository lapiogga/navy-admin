import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker/locale/ko'
import type { ApiResult, PageResponse } from '@/shared/api/types'

// 타입 정의
export type SurveyStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'active' | 'closed'
export type QuestionType = 'radio' | 'checkbox' | 'textarea' | 'rate'

export interface Survey extends Record<string, unknown> {
  id: string
  surveyName: string
  description: string
  status: SurveyStatus
  startDate: string
  endDate: string
  targetType: string
  targetUnits: string[]
  targetRanks: string[]
  targetCount: number
  responseCount: number
  questionCount: number
  isPublicResult: boolean
  isAnonymous: boolean
  authorName: string
  createdAt: string
  submittedAt?: string
  categoryId?: string
  templateId?: string
}

export interface SurveyQuestion extends Record<string, unknown> {
  id: string
  surveyId: string
  questionText: string
  questionType: QuestionType
  isRequired: boolean
  options: string[]
  orderIndex: number
}

export interface SurveyResponse extends Record<string, unknown> {
  id: string
  surveyId: string
  questionId: string
  respondentName: string
  answer: string | string[]
  ratingValue?: number
}

export interface SurveyCategory extends Record<string, unknown> {
  id: string
  categoryName: string
  description: string
  sortOrder: number
  surveyCount: number
  createdAt: string
}

export interface SurveyTemplate extends Record<string, unknown> {
  id: string
  templateName: string
  description: string
  categoryId: string
  questionCount: number
  createdAt: string
  authorName: string
}

export interface SurveyTarget extends Record<string, unknown> {
  id: string
  surveyId: string
  targetName: string
  targetUnit: string
  targetRank: string
  isResponded: boolean
  respondedAt?: string
}

const UNITS = ['1사단', '2사단', '3사단', '해병대사령부', '교육훈련단']
const RANKS = ['대령', '중령', '소령', '대위', '중위', '소위', '준위', '원사', '상사', '중사', '하사']
const STATUSES: SurveyStatus[] = ['draft', 'submitted', 'approved', 'rejected', 'active', 'closed']
const QUESTION_TYPES: QuestionType[] = ['radio', 'checkbox', 'textarea', 'rate']

// Mock 카테고리 5건
let categories: SurveyCategory[] = Array.from({ length: 5 }, (_, i) => ({
  id: `cat-${i + 1}`,
  categoryName: ['인사', '교육', '훈련', '복지', '보안'][i],
  description: `${['인사', '교육', '훈련', '복지', '보안'][i]} 관련 설문 카테고리`,
  sortOrder: i + 1,
  surveyCount: faker.number.int({ min: 1, max: 10 }),
  createdAt: faker.date.recent({ days: 90 }).toISOString().split('T')[0],
}))

// Mock 템플릿 5건
let templates: SurveyTemplate[] = Array.from({ length: 5 }, (_, i) => ({
  id: `tmpl-${i + 1}`,
  templateName: ['표준 만족도 조사', '교육 효과 측정', '직무 환경 조사', '복지 요구도 조사', '보안 인식 조사'][i],
  description: `${['표준 만족도 조사', '교육 효과 측정', '직무 환경 조사', '복지 요구도 조사', '보안 인식 조사'][i]} 템플릿`,
  categoryId: `cat-${(i % 5) + 1}`,
  questionCount: faker.number.int({ min: 3, max: 8 }),
  createdAt: faker.date.recent({ days: 60 }).toISOString().split('T')[0],
  authorName: faker.person.lastName() + faker.person.firstName(),
}))

// Mock 설문 15건 (상태별 분포)
let surveys: Survey[] = Array.from({ length: 15 }, (_, i) => ({
  id: `survey-${i + 1}`,
  surveyName: `${['만족도 조사', '교육 효과 측정', '직무 환경 조사', '복지 수요 조사', '보안 인식 조사'][i % 5]} ${Math.floor(i / 5) + 1}차`,
  description: faker.lorem.sentences(2),
  status: STATUSES[i % STATUSES.length],
  startDate: faker.date.soon({ days: 30 }).toISOString().split('T')[0],
  endDate: faker.date.soon({ days: 60 }).toISOString().split('T')[0],
  targetType: ['부대', '직급', '전체'][i % 3],
  targetUnits: [UNITS[i % UNITS.length]],
  targetRanks: [RANKS[i % RANKS.length]],
  targetCount: faker.number.int({ min: 20, max: 200 }),
  responseCount: faker.number.int({ min: 0, max: 100 }),
  questionCount: faker.number.int({ min: 3, max: 10 }),
  isPublicResult: i % 2 === 0,
  isAnonymous: i % 3 !== 0,
  authorName: faker.person.lastName() + faker.person.firstName(),
  createdAt: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
  submittedAt: i % 2 === 0 ? faker.date.recent({ days: 10 }).toISOString().split('T')[0] : undefined,
  categoryId: `cat-${(i % 5) + 1}`,
}))

// Mock 문항 (설문별 3~5개)
let questions: SurveyQuestion[] = surveys.flatMap((survey) =>
  Array.from({ length: faker.number.int({ min: 3, max: 5 }) }, (_, j) => {
    const qType = QUESTION_TYPES[j % QUESTION_TYPES.length]
    return {
      id: `q-${survey.id}-${j + 1}`,
      surveyId: survey.id,
      questionText: `${j + 1}. ${['본 설문에 대한 만족도는?', '교육 내용의 유익성은?', '직무 환경에 대한 의견을 작성해 주세요.', '전반적인 만족도는?', '개선이 필요한 사항이 있다면?'][j % 5]}`,
      questionType: qType,
      isRequired: j === 0,
      options: qType === 'radio' || qType === 'checkbox' ? ['매우 그렇다', '그렇다', '보통이다', '그렇지 않다', '매우 그렇지 않다'] : [],
      orderIndex: j + 1,
    }
  })
)

// Mock 응답 30건
let responses: SurveyResponse[] = Array.from({ length: 30 }, (_, i) => ({
  id: `resp-${i + 1}`,
  surveyId: `survey-${(i % 15) + 1}`,
  questionId: `q-survey-${(i % 15) + 1}-1`,
  respondentName: faker.person.lastName() + faker.person.firstName(),
  answer: ['매우 그렇다', '그렇다', '보통이다'][i % 3],
  ratingValue: i % 5 === 0 ? faker.number.int({ min: 1, max: 5 }) : undefined,
}))

// Mock 대상자 50건
let targets: SurveyTarget[] = Array.from({ length: 50 }, (_, i) => ({
  id: `target-${i + 1}`,
  surveyId: `survey-${(i % 15) + 1}`,
  targetName: faker.person.lastName() + faker.person.firstName(),
  targetUnit: UNITS[i % UNITS.length],
  targetRank: RANKS[i % RANKS.length],
  isResponded: i % 3 === 0,
  respondedAt: i % 3 === 0 ? faker.date.recent({ days: 5 }).toISOString().split('T')[0] : undefined,
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

export const sys02Handlers = [
  // 설문 목록
  http.get('/api/sys02/surveys', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    const status = url.searchParams.get('status') || ''

    let filtered = [...surveys]
    if (status) {
      filtered = filtered.filter((s) => s.status === status)
    }

    const result: ApiResult<PageResponse<Survey>> = {
      success: true,
      data: paginate(filtered, page, size),
    }
    return HttpResponse.json(result)
  }),

  // 설문 상세
  http.get('/api/sys02/surveys/:id', ({ params }) => {
    const survey = surveys.find((s) => s.id === params.id)
    if (!survey) {
      return HttpResponse.json({ success: false, message: '설문을 찾을 수 없습니다' }, { status: 404 })
    }
    const result: ApiResult<Survey> = { success: true, data: survey }
    return HttpResponse.json(result)
  }),

  // 설문 생성
  http.post('/api/sys02/surveys', async ({ request }) => {
    const body = (await request.json()) as Partial<Survey>
    const newSurvey: Survey = {
      id: `survey-${Date.now()}`,
      surveyName: body.surveyName || '새 설문',
      description: body.description || '',
      status: 'draft',
      startDate: body.startDate || new Date().toISOString().split('T')[0],
      endDate: body.endDate || new Date().toISOString().split('T')[0],
      targetType: body.targetType || '전체',
      targetUnits: body.targetUnits || [],
      targetRanks: body.targetRanks || [],
      targetCount: 0,
      responseCount: 0,
      questionCount: 0,
      isPublicResult: body.isPublicResult ?? true,
      isAnonymous: body.isAnonymous ?? true,
      authorName: '홍길동',
      createdAt: new Date().toISOString().split('T')[0],
      categoryId: body.categoryId,
    }
    surveys = [newSurvey, ...surveys]
    const result: ApiResult<Survey> = { success: true, data: newSurvey }
    return HttpResponse.json(result)
  }),

  // 설문 수정
  http.put('/api/sys02/surveys/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<Survey>
    const index = surveys.findIndex((s) => s.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ success: false, message: '설문을 찾을 수 없습니다' }, { status: 404 })
    }
    surveys[index] = { ...surveys[index], ...body }
    const result: ApiResult<Survey> = { success: true, data: surveys[index] }
    return HttpResponse.json(result)
  }),

  // 설문 삭제
  http.delete('/api/sys02/surveys/:id', ({ params }) => {
    const index = surveys.findIndex((s) => s.id === params.id)
    if (index !== -1) {
      surveys.splice(index, 1)
    }
    const result: ApiResult<null> = { success: true, data: null }
    return HttpResponse.json(result)
  }),

  // 승인 요청 (draft -> submitted)
  http.put('/api/sys02/surveys/:id/submit', ({ params }) => {
    const index = surveys.findIndex((s) => s.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ success: false, message: '설문을 찾을 수 없습니다' }, { status: 404 })
    }
    surveys[index] = {
      ...surveys[index],
      status: 'submitted',
      submittedAt: new Date().toISOString().split('T')[0],
    }
    const result: ApiResult<Survey> = { success: true, data: surveys[index] }
    return HttpResponse.json(result)
  }),

  // 배포 (approved -> active)
  http.put('/api/sys02/surveys/:id/deploy', ({ params }) => {
    const index = surveys.findIndex((s) => s.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ success: false, message: '설문을 찾을 수 없습니다' }, { status: 404 })
    }
    surveys[index] = { ...surveys[index], status: 'active' }
    const result: ApiResult<Survey> = { success: true, data: surveys[index] }
    return HttpResponse.json(result)
  }),

  // 마감 (active -> closed)
  http.put('/api/sys02/surveys/:id/close', ({ params }) => {
    const index = surveys.findIndex((s) => s.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ success: false, message: '설문을 찾을 수 없습니다' }, { status: 404 })
    }
    surveys[index] = { ...surveys[index], status: 'closed' }
    const result: ApiResult<Survey> = { success: true, data: surveys[index] }
    return HttpResponse.json(result)
  }),

  // 문항 목록
  http.get('/api/sys02/surveys/:id/questions', ({ params }) => {
    const surveyQuestions = questions.filter((q) => q.surveyId === params.id)
    const result: ApiResult<SurveyQuestion[]> = { success: true, data: surveyQuestions }
    return HttpResponse.json(result)
  }),

  // 문항 일괄 저장
  http.put('/api/sys02/surveys/:id/questions', async ({ params, request }) => {
    const body = (await request.json()) as SurveyQuestion[]
    questions = questions.filter((q) => q.surveyId !== params.id)
    const newQuestions = body.map((q, i) => ({ ...q, surveyId: params.id as string, orderIndex: i + 1 }))
    questions = [...questions, ...newQuestions]
    const result: ApiResult<SurveyQuestion[]> = { success: true, data: newQuestions }
    return HttpResponse.json(result)
  }),

  // 설문참여 목록 (active 상태 설문)
  http.get('/api/sys02/surveys/participation', () => {
    const activeSurveys = surveys.filter((s) => s.status === 'active')
    const result: ApiResult<Survey[]> = { success: true, data: activeSurveys }
    return HttpResponse.json(result)
  }),

  // 설문 응답 제출
  http.post('/api/sys02/surveys/:id/respond', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const newResponse: SurveyResponse = {
      id: `resp-${Date.now()}`,
      surveyId: params.id as string,
      questionId: (body.questionId as string) || '',
      respondentName: '홍길동',
      answer: (body.answer as string) || '',
    }
    responses = [newResponse, ...responses]
    const result: ApiResult<SurveyResponse> = { success: true, data: newResponse }
    return HttpResponse.json(result)
  }),

  // 결과 분석
  http.get('/api/sys02/surveys/:id/results', ({ params }) => {
    const survey = surveys.find((s) => s.id === params.id)
    const surveyQuestions = questions.filter((q) => q.surveyId === params.id)
    const result = {
      survey,
      totalTarget: survey?.targetCount || 0,
      totalResponse: survey?.responseCount || 0,
      responseRate: survey ? Math.round((survey.responseCount / Math.max(survey.targetCount, 1)) * 100) : 0,
      questionResults: surveyQuestions.map((q) => ({
        question: q,
        optionCounts: q.options.map((opt, i) => ({
          option: opt,
          count: faker.number.int({ min: 0, max: 20 }),
          ratio: Math.round(Math.random() * 100),
        })),
        textAnswers: q.questionType === 'textarea' ? ['응답 내용 1', '응답 내용 2', '응답 내용 3'] : [],
        averageRating: q.questionType === 'rate' ? faker.number.float({ min: 1, max: 5, fractionDigits: 1 }) : undefined,
        ratingDistribution: q.questionType === 'rate' ? [
          { score: 1, count: faker.number.int({ min: 0, max: 10 }) },
          { score: 2, count: faker.number.int({ min: 0, max: 10 }) },
          { score: 3, count: faker.number.int({ min: 0, max: 15 }) },
          { score: 4, count: faker.number.int({ min: 5, max: 20 }) },
          { score: 5, count: faker.number.int({ min: 10, max: 30 }) },
        ] : undefined,
      })),
    }
    return HttpResponse.json({ success: true, data: result })
  }),

  // 지난 설문 (closed)
  http.get('/api/sys02/surveys/past', () => {
    const closedSurveys = surveys.filter((s) => s.status === 'closed')
    const result: ApiResult<Survey[]> = { success: true, data: closedSurveys }
    return HttpResponse.json(result)
  }),

  // 승인 대기 목록
  http.get('/api/sys02/surveys/pending', () => {
    const pendingSurveys = surveys.filter((s) => s.status === 'submitted')
    const result: ApiResult<Survey[]> = { success: true, data: pendingSurveys }
    return HttpResponse.json(result)
  }),

  // 승인
  http.put('/api/sys02/surveys/:id/approve', ({ params }) => {
    const index = surveys.findIndex((s) => s.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ success: false, message: '설문을 찾을 수 없습니다' }, { status: 404 })
    }
    surveys[index] = { ...surveys[index], status: 'approved' }
    const result: ApiResult<Survey> = { success: true, data: surveys[index] }
    return HttpResponse.json(result)
  }),

  // 반려
  http.put('/api/sys02/surveys/:id/reject', async ({ params, request }) => {
    const index = surveys.findIndex((s) => s.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ success: false, message: '설문을 찾을 수 없습니다' }, { status: 404 })
    }
    let reason = ''
    try {
      const body = (await request.json()) as { reason?: string }
      reason = body.reason || ''
    } catch {
      // body 없을 수 있음
    }
    surveys[index] = { ...surveys[index], status: 'rejected', description: reason || surveys[index].description }
    const result: ApiResult<Survey> = { success: true, data: surveys[index] }
    return HttpResponse.json(result)
  }),

  // 전체 설문관리 목록 (관리자)
  http.get('/api/sys02/surveys/all', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    const result: ApiResult<PageResponse<Survey>> = {
      success: true,
      data: paginate(surveys, page, size),
    }
    return HttpResponse.json(result)
  }),

  // 카테고리 목록
  http.get('/api/sys02/categories', () => {
    const result: ApiResult<SurveyCategory[]> = { success: true, data: categories }
    return HttpResponse.json(result)
  }),

  // 카테고리 등록
  http.post('/api/sys02/categories', async ({ request }) => {
    const body = (await request.json()) as Partial<SurveyCategory>
    const newCat: SurveyCategory = {
      id: `cat-${Date.now()}`,
      categoryName: body.categoryName || '',
      description: body.description || '',
      sortOrder: body.sortOrder || categories.length + 1,
      surveyCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    }
    categories = [newCat, ...categories]
    const result: ApiResult<SurveyCategory> = { success: true, data: newCat }
    return HttpResponse.json(result)
  }),

  // 카테고리 수정
  http.put('/api/sys02/categories/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<SurveyCategory>
    const index = categories.findIndex((c) => c.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ success: false, message: '카테고리를 찾을 수 없습니다' }, { status: 404 })
    }
    categories[index] = { ...categories[index], ...body }
    const result: ApiResult<SurveyCategory> = { success: true, data: categories[index] }
    return HttpResponse.json(result)
  }),

  // 카테고리 삭제
  http.delete('/api/sys02/categories/:id', ({ params }) => {
    const index = categories.findIndex((c) => c.id === params.id)
    if (index !== -1) {
      categories.splice(index, 1)
    }
    const result: ApiResult<null> = { success: true, data: null }
    return HttpResponse.json(result)
  }),

  // 설문 통계
  http.get('/api/sys02/stats', () => {
    const stats = {
      totalSurveys: surveys.length,
      activeSurveys: surveys.filter((s) => s.status === 'active').length,
      closedSurveys: surveys.filter((s) => s.status === 'closed').length,
      averageResponseRate: Math.round(
        surveys.reduce((acc, s) => acc + (s.responseCount / Math.max(s.targetCount, 1)) * 100, 0) / surveys.length
      ),
      monthlyStats: Array.from({ length: 6 }, (_, i) => ({
        month: `${new Date().getMonth() - 5 + i + 1}월`,
        registered: faker.number.int({ min: 1, max: 10 }),
        closed: faker.number.int({ min: 0, max: 5 }),
        responded: faker.number.int({ min: 5, max: 50 }),
      })),
      categoryStats: categories.map((cat) => ({
        categoryName: cat.categoryName,
        surveyCount: cat.surveyCount,
        responseRate: faker.number.int({ min: 30, max: 95 }),
      })),
    }
    return HttpResponse.json({ success: true, data: stats })
  }),

  // 설문 템플릿 목록
  http.get('/api/sys02/templates', () => {
    const result: ApiResult<SurveyTemplate[]> = { success: true, data: templates }
    return HttpResponse.json(result)
  }),

  // 템플릿 저장
  http.post('/api/sys02/templates', async ({ request }) => {
    const body = (await request.json()) as Partial<SurveyTemplate>
    const newTmpl: SurveyTemplate = {
      id: `tmpl-${Date.now()}`,
      templateName: body.templateName || '',
      description: body.description || '',
      categoryId: body.categoryId || '',
      questionCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      authorName: '홍길동',
    }
    templates = [newTmpl, ...templates]
    const result: ApiResult<SurveyTemplate> = { success: true, data: newTmpl }
    return HttpResponse.json(result)
  }),

  // 템플릿 수정
  http.put('/api/sys02/templates/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<SurveyTemplate>
    const index = templates.findIndex((t) => t.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ success: false, message: '템플릿을 찾을 수 없습니다' }, { status: 404 })
    }
    templates[index] = { ...templates[index], ...body }
    const result: ApiResult<SurveyTemplate> = { success: true, data: templates[index] }
    return HttpResponse.json(result)
  }),

  // 템플릿 삭제
  http.delete('/api/sys02/templates/:id', ({ params }) => {
    const index = templates.findIndex((t) => t.id === params.id)
    if (index !== -1) {
      templates.splice(index, 1)
    }
    const result: ApiResult<null> = { success: true, data: null }
    return HttpResponse.json(result)
  }),

  // 대상자 목록
  http.get('/api/sys02/surveys/:id/targets', ({ params }) => {
    const surveyTargets = targets.filter((t) => t.surveyId === params.id)
    const result: ApiResult<SurveyTarget[]> = { success: true, data: surveyTargets }
    return HttpResponse.json(result)
  }),

  // 대상자 일괄 수정
  http.put('/api/sys02/surveys/:id/targets', async ({ params, request }) => {
    const body = (await request.json()) as SurveyTarget[]
    targets = targets.filter((t) => t.surveyId !== params.id)
    const newTargets = body.map((t) => ({ ...t, surveyId: params.id as string }))
    targets = [...targets, ...newTargets]
    const result: ApiResult<SurveyTarget[]> = { success: true, data: newTargets }
    return HttpResponse.json(result)
  }),
]
