import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker/locale/ko'
import type { PageResponse, ApiResult } from '@/shared/api/types'
import type { ApprovalLine, Approver } from '@/entities/approval/types'

// ===== Mock 데이터 =====

const RANKS = ['중위', '대위', '소령', '중령', '대령', '준위', '원사', '상사', '중사', '하사']
const UNITS = ['해군본부', '1함대', '2함대', '3함대', '교육사령부', '해병대사령부', '1사단', '2사단']
const LINE_NAMES = [
  '기본결재선',
  '부대장직속',
  '팀장결재선',
  '부서장결재선',
  '지휘관결재선',
  '비상결재선',
  '일반업무결재선',
  '인사결재선',
  '보안결재선',
  '교육결재선',
]

function generateApprovers(count: number): Approver[] {
  return Array.from({ length: count }, (_, i) => ({
    userId: faker.string.uuid(),
    userName: faker.person.fullName(),
    userRank: faker.helpers.arrayElement(RANKS),
    userUnit: faker.helpers.arrayElement(UNITS),
    order: i + 1,
  }))
}

let mockLines: ApprovalLine[] = Array.from({ length: 15 }, () => ({
  id: faker.string.uuid(),
  lineName: faker.helpers.arrayElement(LINE_NAMES) + '_' + faker.string.alphanumeric(3),
  description: faker.lorem.sentence(),
  approvers: generateApprovers(faker.number.int({ min: 2, max: 5 })),
  createdBy: faker.string.uuid(),
  createdAt: faker.date.past({ years: 1 }).toISOString().split('T')[0],
  updatedAt: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
}))

// Mock 사용자 목록 (결재자 선택용)
const mockUsers = Array.from({ length: 50 }, () => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  rank: faker.helpers.arrayElement(RANKS),
  unit: faker.helpers.arrayElement(UNITS),
  username: faker.internet.username(),
  roles: ['COMMON_USER'],
}))

// ===== MSW 핸들러 =====

export const approvalHandlers = [
  // 결재선 목록 조회
  http.get('/api/common/approval-lines', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '0')
    const size = Number(url.searchParams.get('size') ?? '10')
    const keyword = url.searchParams.get('keyword') ?? ''

    let filtered = mockLines
    if (keyword) {
      filtered = mockLines.filter(
        (l) => l.lineName.includes(keyword) || l.description.includes(keyword),
      )
    }

    const start = page * size
    const content = filtered.slice(start, start + size)

    const result: ApiResult<PageResponse<ApprovalLine>> = {
      success: true,
      data: {
        content,
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / size),
        size,
        number: page,
      },
    }
    return HttpResponse.json(result)
  }),

  // 결재선 상세 조회
  http.get('/api/common/approval-lines/:id', ({ params }) => {
    const line = mockLines.find((l) => l.id === params.id)
    if (!line) {
      return HttpResponse.json({ success: false, data: null, message: '결재선을 찾을 수 없습니다' }, { status: 404 })
    }
    const result: ApiResult<ApprovalLine> = { success: true, data: line }
    return HttpResponse.json(result)
  }),

  // 결재선 등록
  http.post('/api/common/approval-lines', async ({ request }) => {
    const body = await request.json() as {
      lineName: string
      description: string
      approvers: { userId: string; order: number }[]
    }
    const newLine: ApprovalLine = {
      id: faker.string.uuid(),
      lineName: body.lineName,
      description: body.description,
      approvers: body.approvers.map((a) => {
        const user = mockUsers.find((u) => u.id === a.userId)
        return {
          userId: a.userId,
          userName: user?.name ?? '알 수 없음',
          userRank: user?.rank ?? '',
          userUnit: user?.unit ?? '',
          order: a.order,
        }
      }),
      createdBy: 'current-user',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    }
    mockLines = [newLine, ...mockLines]
    const result: ApiResult<ApprovalLine> = { success: true, data: newLine, message: '등록되었습니다' }
    return HttpResponse.json(result, { status: 201 })
  }),

  // 결재선 수정
  http.put('/api/common/approval-lines/:id', async ({ params, request }) => {
    const body = await request.json() as {
      lineName: string
      description: string
      approvers: { userId: string; order: number }[]
    }
    const idx = mockLines.findIndex((l) => l.id === params.id)
    if (idx === -1) {
      return HttpResponse.json({ success: false, data: null, message: '결재선을 찾을 수 없습니다' }, { status: 404 })
    }
    const updated: ApprovalLine = {
      ...mockLines[idx],
      lineName: body.lineName,
      description: body.description,
      approvers: body.approvers.map((a) => {
        const user = mockUsers.find((u) => u.id === a.userId)
        return {
          userId: a.userId,
          userName: user?.name ?? '알 수 없음',
          userRank: user?.rank ?? '',
          userUnit: user?.unit ?? '',
          order: a.order,
        }
      }),
      updatedAt: new Date().toISOString().split('T')[0],
    }
    mockLines = mockLines.map((l, i) => (i === idx ? updated : l))
    const result: ApiResult<ApprovalLine> = { success: true, data: updated, message: '수정되었습니다' }
    return HttpResponse.json(result)
  }),

  // 결재선 삭제
  http.delete('/api/common/approval-lines/:id', ({ params }) => {
    const idx = mockLines.findIndex((l) => l.id === params.id)
    if (idx === -1) {
      return HttpResponse.json({ success: false, data: null, message: '결재선을 찾을 수 없습니다' }, { status: 404 })
    }
    mockLines = mockLines.filter((l) => l.id !== params.id)
    const result: ApiResult<void> = { success: true, data: undefined as never, message: '삭제되었습니다' }
    return HttpResponse.json(result)
  }),

  // 사용자 목록 (결재자 선택용)
  http.get('/api/common/users', ({ request }) => {
    const url = new URL(request.url)
    const keyword = url.searchParams.get('keyword') ?? ''
    let filtered = mockUsers
    if (keyword) {
      filtered = mockUsers.filter((u) => u.name.includes(keyword) || u.rank.includes(keyword))
    }
    const result: ApiResult<typeof mockUsers> = { success: true, data: filtered }
    return HttpResponse.json(result)
  }),
]
