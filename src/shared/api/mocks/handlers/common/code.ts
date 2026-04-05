import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker/locale/ko'
import type { PageResponse, ApiResult } from '@/shared/api/types'
import type { CodeGroup, Code, CodeOption } from '@/entities/code/types'

// 사전 정의 코드그룹 목록 (실제적인 군 행정 코드)
const GROUP_DEFS = [
  { groupCode: 'APPROVAL_STATUS', groupName: '결재상태' },
  { groupCode: 'USER_RANK', groupName: '계급' },
  { groupCode: 'UNIT_TYPE', groupName: '부대유형' },
  { groupCode: 'BOARD_TYPE', groupName: '게시판유형' },
  { groupCode: 'FILE_TYPE', groupName: '파일유형' },
  { groupCode: 'PERMISSION_TYPE', groupName: '권한유형' },
  { groupCode: 'MSG_TYPE', groupName: '메시지유형' },
  { groupCode: 'LOG_LEVEL', groupName: '로그레벨' },
  { groupCode: 'SYSTEM_TYPE', groupName: '시스템유형' },
  { groupCode: 'CERT_TYPE', groupName: '인증서유형' },
]

// 코드그룹 Mock 데이터 생성
let mockGroups: CodeGroup[] = GROUP_DEFS.map((def) => ({
  id: faker.string.uuid(),
  groupCode: def.groupCode,
  groupName: def.groupName,
  description: faker.lorem.sentence(),
  useYn: 'Y',
  createdAt: faker.date.past({ years: 1 }).toISOString().split('T')[0],
  updatedAt: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
}))

// 코드그룹별 코드 Mock 데이터
const CODE_DEFS: Record<string, Array<{ codeValue: string; codeName: string }>> = {
  APPROVAL_STATUS: [
    { codeValue: 'PENDING', codeName: '대기' },
    { codeValue: 'APPROVED', codeName: '승인' },
    { codeValue: 'REJECTED', codeName: '반려' },
    { codeValue: 'CANCELED', codeName: '취소' },
  ],
  USER_RANK: [
    { codeValue: 'PRIVATE', codeName: '이병' },
    { codeValue: 'PFC', codeName: '일병' },
    { codeValue: 'CPL', codeName: '상병' },
    { codeValue: 'SGT', codeName: '병장' },
    { codeValue: 'SSG', codeName: '하사' },
    { codeValue: 'SFC', codeName: '중사' },
    { codeValue: 'MSG', codeName: '상사' },
    { codeValue: 'SGM', codeName: '원사' },
  ],
  UNIT_TYPE: [
    { codeValue: 'HQ', codeName: '본부' },
    { codeValue: 'DIV', codeName: '사단' },
    { codeValue: 'BDE', codeName: '여단' },
    { codeValue: 'BN', codeName: '대대' },
    { codeValue: 'CO', codeName: '중대' },
  ],
  BOARD_TYPE: [
    { codeValue: 'NOTICE', codeName: '공지사항' },
    { codeValue: 'QNA', codeName: '질의응답' },
    { codeValue: 'DATA', codeName: '자료실' },
    { codeValue: 'FREE', codeName: '자유게시판' },
  ],
  FILE_TYPE: [
    { codeValue: 'DOC', codeName: '문서' },
    { codeValue: 'IMG', codeName: '이미지' },
    { codeValue: 'PDF', codeName: 'PDF' },
    { codeValue: 'ZIP', codeName: '압축파일' },
  ],
  PERMISSION_TYPE: [
    { codeValue: 'ADMIN', codeName: '관리자' },
    { codeValue: 'USER', codeName: '일반사용자' },
    { codeValue: 'VIEWER', codeName: '조회자' },
  ],
  MSG_TYPE: [
    { codeValue: 'INFO', codeName: '정보' },
    { codeValue: 'WARN', codeName: '경고' },
    { codeValue: 'ERROR', codeName: '오류' },
  ],
  LOG_LEVEL: [
    { codeValue: 'DEBUG', codeName: 'DEBUG' },
    { codeValue: 'INFO', codeName: 'INFO' },
    { codeValue: 'WARN', codeName: 'WARN' },
    { codeValue: 'ERROR', codeName: 'ERROR' },
  ],
  SYSTEM_TYPE: [
    { codeValue: 'OVERTIME', codeName: '초과근무' },
    { codeValue: 'SECURITY', codeName: '보안결산' },
    { codeValue: 'COMMON', codeName: '공통' },
  ],
  CERT_TYPE: [
    { codeValue: 'PERSONAL', codeName: '개인' },
    { codeValue: 'UNIT', codeName: '부대' },
    { codeValue: 'SERVER', codeName: '서버' },
  ],
}

// 코드 Mock 데이터 생성
let mockCodes: Code[] = mockGroups.flatMap((group) => {
  const defs = CODE_DEFS[group.groupCode] ?? []
  return defs.map((def, idx) => ({
    id: faker.string.uuid(),
    groupId: group.id,
    groupCode: group.groupCode,
    codeValue: def.codeValue,
    codeName: def.codeName,
    sortOrder: (idx + 1) * 10,
    useYn: 'Y',
    description: '',
    createdAt: faker.date.past({ years: 1 }).toISOString().split('T')[0],
  }))
})

export const codeHandlers = [
  // 코드그룹 목록 조회
  http.get('/api/common/code-groups', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '0')
    const size = Number(url.searchParams.get('size') ?? '10')
    const keyword = url.searchParams.get('keyword') ?? ''

    let filtered = mockGroups
    if (keyword) {
      filtered = mockGroups.filter(
        (g) => g.groupCode.includes(keyword) || g.groupName.includes(keyword),
      )
    }

    const start = page * size
    const content = filtered.slice(start, start + size)

    const result: ApiResult<PageResponse<CodeGroup>> = {
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

  // 코드그룹 등록
  http.post('/api/common/code-groups', async ({ request }) => {
    const body = (await request.json()) as Partial<CodeGroup>
    const newGroup: CodeGroup = {
      id: faker.string.uuid(),
      groupCode: body.groupCode ?? '',
      groupName: body.groupName ?? '',
      description: body.description ?? '',
      useYn: body.useYn ?? 'Y',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    }
    mockGroups = [...mockGroups, newGroup]

    const result: ApiResult<CodeGroup> = { success: true, data: newGroup, message: '등록되었습니다' }
    return HttpResponse.json(result, { status: 201 })
  }),

  // 코드그룹 수정
  http.put('/api/common/code-groups/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<CodeGroup>
    const idx = mockGroups.findIndex((g) => g.id === params.id)
    if (idx === -1) {
      return HttpResponse.json({ success: false, data: null, message: '대상을 찾을 수 없습니다' }, { status: 404 })
    }
    const updated = { ...mockGroups[idx], ...body, updatedAt: new Date().toISOString().split('T')[0] }
    mockGroups = [...mockGroups.slice(0, idx), updated, ...mockGroups.slice(idx + 1)]

    const result: ApiResult<CodeGroup> = { success: true, data: updated, message: '수정되었습니다' }
    return HttpResponse.json(result)
  }),

  // 코드그룹 삭제
  http.delete('/api/common/code-groups/:id', ({ params }) => {
    const groupId = params.id as string
    mockGroups = mockGroups.filter((g) => g.id !== groupId)
    mockCodes = mockCodes.filter((c) => c.groupId !== groupId)

    const result: ApiResult = { success: true, data: undefined as never, message: '삭제되었습니다' }
    return HttpResponse.json(result)
  }),

  // 코드 목록 조회 (groupId 기반)
  http.get('/api/common/codes', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '0')
    const size = Number(url.searchParams.get('size') ?? '10')
    const groupId = url.searchParams.get('groupId') ?? ''

    const filtered = groupId ? mockCodes.filter((c) => c.groupId === groupId) : mockCodes

    const start = page * size
    const content = filtered.slice(start, start + size)

    const result: ApiResult<PageResponse<Code>> = {
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

  // 코드 등록
  http.post('/api/common/codes', async ({ request }) => {
    const body = (await request.json()) as Partial<Code>
    const group = mockGroups.find((g) => g.id === body.groupId)
    const newCode: Code = {
      id: faker.string.uuid(),
      groupId: body.groupId ?? '',
      groupCode: group?.groupCode ?? body.groupCode ?? '',
      codeValue: body.codeValue ?? '',
      codeName: body.codeName ?? '',
      sortOrder: body.sortOrder ?? 10,
      useYn: body.useYn ?? 'Y',
      description: body.description ?? '',
      createdAt: new Date().toISOString().split('T')[0],
    }
    mockCodes = [...mockCodes, newCode]

    const result: ApiResult<Code> = { success: true, data: newCode, message: '등록되었습니다' }
    return HttpResponse.json(result, { status: 201 })
  }),

  // 코드 수정
  http.put('/api/common/codes/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<Code>
    const idx = mockCodes.findIndex((c) => c.id === params.id)
    if (idx === -1) {
      return HttpResponse.json({ success: false, data: null, message: '대상을 찾을 수 없습니다' }, { status: 404 })
    }
    const updated = { ...mockCodes[idx], ...body }
    mockCodes = [...mockCodes.slice(0, idx), updated, ...mockCodes.slice(idx + 1)]

    const result: ApiResult<Code> = { success: true, data: updated, message: '수정되었습니다' }
    return HttpResponse.json(result)
  }),

  // 코드 삭제
  http.delete('/api/common/codes/:id', ({ params }) => {
    mockCodes = mockCodes.filter((c) => c.id !== params.id)

    const result: ApiResult = { success: true, data: undefined as never, message: '삭제되었습니다' }
    return HttpResponse.json(result)
  }),

  // 코드 옵션 조회 (groupCode 기반)
  http.get('/api/common/codes/options/:groupCode', ({ params }) => {
    const groupCode = params.groupCode as string
    const options: CodeOption[] = mockCodes
      .filter((c) => c.groupCode === groupCode && c.useYn === 'Y')
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((c) => ({ label: c.codeName, value: c.codeValue }))

    const result: ApiResult<CodeOption[]> = { success: true, data: options }
    return HttpResponse.json(result)
  }),
]
