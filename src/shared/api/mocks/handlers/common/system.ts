import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker/locale/ko'
import type { PageResponse, ApiResult } from '@/shared/api/types'

// ===== 공통 =====

const RANKS = ['중위', '대위', '소령', '중령', '대령', '준위', '원사', '상사', '중사', '하사']
void ['해군본부', '1함대', '2함대', '3함대', '교육사령부', '해병대사령부', '1사단', '2사단']
const SUBSYSTEM_CODES = ['SYS01', 'SYS02', 'SYS03', 'SYS04', 'SYS05', 'SYS06', 'SYS07', 'SYS08', 'SYS09', 'SYS10']

// ===== 체계담당자 (COM-01) =====

interface SystemManager extends Record<string, unknown> {
  id: string
  managerName: string
  managerRank: string
  subsystemCode: string
  contactInfo: string
  description: string
  createdAt: string
  updatedAt: string
}

let mockManagers: SystemManager[] = Array.from({ length: 25 }, () => ({
  id: faker.string.uuid(),
  managerName: faker.person.fullName(),
  managerRank: faker.helpers.arrayElement(RANKS),
  subsystemCode: faker.helpers.arrayElement(SUBSYSTEM_CODES),
  contactInfo: faker.phone.number(),
  description: faker.lorem.sentence(),
  createdAt: faker.date.past({ years: 1 }).toISOString().split('T')[0],
  updatedAt: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
}))

// ===== 메뉴관리 (COM-02) =====

interface MenuItem extends Record<string, unknown> {
  id: string
  menuName: string
  menuPath: string
  parentId: string | null
  subsystemCode: string
  sortOrder: number
  useYn: string
}

// 실데이터 기반 메뉴 Mock 생성
const MENU_DEFINITIONS = [
  { name: '신청서 관리', path: '/sys01/1', subsystem: 'SYS01', children: [
    { name: '신청서 작성', path: '/sys01/1/1' },
    { name: '신청서 결재', path: '/sys01/1/2' },
    { name: '일괄처리', path: '/sys01/1/3' },
  ]},
  { name: '현황조회', path: '/sys01/2', subsystem: 'SYS01', children: [
    { name: '나의 근무현황', path: '/sys01/2/1' },
    { name: '부대 근무 현황', path: '/sys01/2/2' },
  ]},
  { name: '코드관리', path: '/common/code-mgmt', subsystem: 'SYS99', children: [] },
  { name: '권한관리', path: '/common/auth-group', subsystem: 'SYS99', children: [] },
  { name: '결재선관리', path: '/common/approval', subsystem: 'SYS99', children: [] },
  { name: '시스템관리', path: '/common/system-mgr', subsystem: 'SYS99', children: [] },
]

const builtMenus: MenuItem[] = []
MENU_DEFINITIONS.forEach((def) => {
  const parentId = faker.string.uuid()
  builtMenus.push({
    id: parentId,
    menuName: def.name,
    menuPath: def.path,
    parentId: null,
    subsystemCode: def.subsystem,
    sortOrder: builtMenus.length + 1,
    useYn: 'Y',
  })
  def.children.forEach((child, ci) => {
    builtMenus.push({
      id: faker.string.uuid(),
      menuName: child.name,
      menuPath: child.path,
      parentId,
      subsystemCode: def.subsystem,
      sortOrder: ci + 1,
      useYn: 'Y',
    })
  })
})

let mockMenus: MenuItem[] = builtMenus

// ===== 메시지관리 (COM-03) =====

interface MessageItem extends Record<string, unknown> {
  id: string
  messageCode: string
  messageContent: string
  messageType: string
  useYn: string
  createdAt: string
  updatedAt: string
}

const MESSAGE_CODES = [
  'MSG_SUCCESS_SAVE', 'MSG_SUCCESS_DELETE', 'MSG_ERROR_NOTFOUND',
  'MSG_ERROR_PERMISSION', 'MSG_WARN_DUPLICATE', 'MSG_INFO_LOADING',
  'MSG_ERROR_SERVER', 'MSG_WARN_TIMEOUT', 'MSG_SUCCESS_UPLOAD',
  'MSG_ERROR_VALIDATION',
]

let mockMessages: MessageItem[] = Array.from({ length: 30 }, (_, i) => ({
  id: faker.string.uuid(),
  messageCode: MESSAGE_CODES[i % MESSAGE_CODES.length] + '_' + faker.string.alphanumeric(3).toUpperCase(),
  messageContent: faker.lorem.sentence(),
  messageType: faker.helpers.arrayElement(['INFO', 'WARN', 'ERROR']),
  useYn: faker.helpers.arrayElement(['Y', 'Y', 'Y', 'N']),
  createdAt: faker.date.past({ years: 1 }).toISOString().split('T')[0],
  updatedAt: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
}))

// ===== 접속로그 (COM-04) =====

interface AccessLog extends Record<string, unknown> {
  id: string
  userId: string
  userName: string
  loginTime: string
  logoutTime: string
  ipAddress: string
  userAgent: string
  subsystemCode: string
}

const mockAccessLogs: AccessLog[] = Array.from({ length: 200 }, () => {
  const loginTime = faker.date.recent({ days: 30 })
  const logoutTime = new Date(loginTime.getTime() + faker.number.int({ min: 5, max: 480 }) * 60000)
  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    userName: faker.person.fullName(),
    loginTime: loginTime.toISOString(),
    logoutTime: logoutTime.toISOString(),
    ipAddress: faker.internet.ip(),
    userAgent: faker.internet.userAgent(),
    subsystemCode: faker.helpers.arrayElement(SUBSYSTEM_CODES),
  }
})

// ===== 장애로그 (COM-05) =====

interface ErrorLog extends Record<string, unknown> {
  id: string
  errorCode: string
  errorMessage: string
  errorLevel: string
  occurredAt: string
  resolvedAt: string | null
  stackTrace: string
}

const mockErrorLogs: ErrorLog[] = Array.from({ length: 50 }, () => {
  const occurredAt = faker.date.recent({ days: 90 })
  const isResolved = faker.datatype.boolean()
  return {
    id: faker.string.uuid(),
    errorCode: 'ERR_' + faker.string.alphanumeric(6).toUpperCase(),
    errorMessage: faker.lorem.sentence(),
    errorLevel: faker.helpers.arrayElement(['ERROR', 'WARN', 'CRITICAL', 'INFO']),
    occurredAt: occurredAt.toISOString(),
    resolvedAt: isResolved
      ? new Date(occurredAt.getTime() + faker.number.int({ min: 10, max: 1440 }) * 60000).toISOString()
      : null,
    stackTrace: `at ${faker.system.fileName()}:${faker.number.int({ min: 1, max: 500 })}\nat ${faker.system.fileName()}:${faker.number.int({ min: 1, max: 500 })}`,
  }
})

// ===== MSW 핸들러 =====

export const systemHandlers = [
  // === 체계담당자 ===
  http.get('/api/common/system-managers', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '0')
    const size = Number(url.searchParams.get('size') ?? '10')
    const keyword = url.searchParams.get('keyword') ?? ''

    let filtered = mockManagers
    if (keyword) {
      filtered = mockManagers.filter(
        (m) => m.managerName.includes(keyword) || m.subsystemCode.includes(keyword),
      )
    }

    const start = page * size
    const result: ApiResult<PageResponse<SystemManager>> = {
      success: true,
      data: {
        content: filtered.slice(start, start + size),
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / size),
        size,
        number: page,
      },
    }
    return HttpResponse.json(result)
  }),

  http.get('/api/common/system-managers/:id', ({ params }) => {
    const manager = mockManagers.find((m) => m.id === params.id)
    if (!manager) {
      return HttpResponse.json({ success: false, data: null, message: '담당자를 찾을 수 없습니다' }, { status: 404 })
    }
    return HttpResponse.json({ success: true, data: manager } satisfies ApiResult<SystemManager>)
  }),

  http.post('/api/common/system-managers', async ({ request }) => {
    const body = await request.json() as Omit<SystemManager, 'id' | 'createdAt' | 'updatedAt'>
    const newManager = {
      id: faker.string.uuid(),
      ...body,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    } as SystemManager
    mockManagers = [newManager, ...mockManagers]
    return HttpResponse.json({ success: true, data: newManager, message: '등록되었습니다' } satisfies ApiResult<SystemManager>, { status: 201 })
  }),

  http.put('/api/common/system-managers/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<SystemManager>
    const idx = mockManagers.findIndex((m) => m.id === params.id)
    if (idx === -1) {
      return HttpResponse.json({ success: false, data: null, message: '담당자를 찾을 수 없습니다' }, { status: 404 })
    }
    const updated = { ...mockManagers[idx], ...body, updatedAt: new Date().toISOString().split('T')[0] }
    mockManagers = mockManagers.map((m, i) => (i === idx ? updated : m))
    return HttpResponse.json({ success: true, data: updated, message: '수정되었습니다' } satisfies ApiResult<SystemManager>)
  }),

  http.delete('/api/common/system-managers/:id', ({ params }) => {
    const idx = mockManagers.findIndex((m) => m.id === params.id)
    if (idx === -1) {
      return HttpResponse.json({ success: false, data: null, message: '담당자를 찾을 수 없습니다' }, { status: 404 })
    }
    mockManagers = mockManagers.filter((m) => m.id !== params.id)
    return HttpResponse.json({ success: true, data: undefined as never, message: '삭제되었습니다' } satisfies ApiResult<void>)
  }),

  // === 메뉴관리 ===
  http.get('/api/common/menus', () => {
    const result: ApiResult<MenuItem[]> = { success: true, data: mockMenus }
    return HttpResponse.json(result)
  }),

  http.post('/api/common/menus', async ({ request }) => {
    const body = await request.json() as Omit<MenuItem, 'id'>
    const newMenu: MenuItem = { id: faker.string.uuid(), ...body } as MenuItem
    mockMenus = [...mockMenus, newMenu]
    return HttpResponse.json({ success: true, data: newMenu, message: '등록되었습니다' } satisfies ApiResult<MenuItem>, { status: 201 })
  }),

  http.put('/api/common/menus/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<MenuItem>
    const idx = mockMenus.findIndex((m) => m.id === params.id)
    if (idx === -1) {
      return HttpResponse.json({ success: false, data: null, message: '메뉴를 찾을 수 없습니다' }, { status: 404 })
    }
    const updated = { ...mockMenus[idx], ...body }
    mockMenus = mockMenus.map((m, i) => (i === idx ? updated : m))
    return HttpResponse.json({ success: true, data: updated, message: '수정되었습니다' } satisfies ApiResult<MenuItem>)
  }),

  http.delete('/api/common/menus/:id', ({ params }) => {
    const idx = mockMenus.findIndex((m) => m.id === params.id)
    if (idx === -1) {
      return HttpResponse.json({ success: false, data: null, message: '메뉴를 찾을 수 없습니다' }, { status: 404 })
    }
    mockMenus = mockMenus.filter((m) => m.id !== params.id)
    return HttpResponse.json({ success: true, data: undefined as never, message: '삭제되었습니다' } satisfies ApiResult<void>)
  }),

  // === 메시지관리 ===
  http.get('/api/common/messages', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '0')
    const size = Number(url.searchParams.get('size') ?? '10')
    const keyword = url.searchParams.get('keyword') ?? ''

    let filtered = mockMessages
    if (keyword) {
      filtered = mockMessages.filter(
        (m) => m.messageCode.includes(keyword) || m.messageContent.includes(keyword),
      )
    }

    const start = page * size
    const result: ApiResult<PageResponse<MessageItem>> = {
      success: true,
      data: {
        content: filtered.slice(start, start + size),
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / size),
        size,
        number: page,
      },
    }
    return HttpResponse.json(result)
  }),

  http.post('/api/common/messages', async ({ request }) => {
    const body = await request.json() as Omit<MessageItem, 'id' | 'createdAt' | 'updatedAt'>
    const newMsg = {
      id: faker.string.uuid(),
      ...body,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    } as MessageItem
    mockMessages = [newMsg, ...mockMessages]
    return HttpResponse.json({ success: true, data: newMsg, message: '등록되었습니다' } satisfies ApiResult<MessageItem>, { status: 201 })
  }),

  http.put('/api/common/messages/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<MessageItem>
    const idx = mockMessages.findIndex((m) => m.id === params.id)
    if (idx === -1) {
      return HttpResponse.json({ success: false, data: null, message: '메시지를 찾을 수 없습니다' }, { status: 404 })
    }
    const updated = { ...mockMessages[idx], ...body, updatedAt: new Date().toISOString().split('T')[0] }
    mockMessages = mockMessages.map((m, i) => (i === idx ? updated : m))
    return HttpResponse.json({ success: true, data: updated, message: '수정되었습니다' } satisfies ApiResult<MessageItem>)
  }),

  http.delete('/api/common/messages/:id', ({ params }) => {
    const idx = mockMessages.findIndex((m) => m.id === params.id)
    if (idx === -1) {
      return HttpResponse.json({ success: false, data: null, message: '메시지를 찾을 수 없습니다' }, { status: 404 })
    }
    mockMessages = mockMessages.filter((m) => m.id !== params.id)
    return HttpResponse.json({ success: true, data: undefined as never, message: '삭제되었습니다' } satisfies ApiResult<void>)
  }),

  // === 접속로그 ===
  http.get('/api/common/access-logs', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '0')
    const size = Number(url.searchParams.get('size') ?? '10')
    const keyword = url.searchParams.get('keyword') ?? ''
    const startDate = url.searchParams.get('startDate') ?? ''
    const endDate = url.searchParams.get('endDate') ?? ''

    let filtered = mockAccessLogs
    if (keyword) {
      filtered = filtered.filter(
        (l) => l.userName.includes(keyword) || l.ipAddress.includes(keyword),
      )
    }
    if (startDate) {
      filtered = filtered.filter((l) => l.loginTime >= startDate)
    }
    if (endDate) {
      filtered = filtered.filter((l) => l.loginTime <= endDate + 'T23:59:59')
    }

    const start = page * size
    const result: ApiResult<PageResponse<AccessLog>> = {
      success: true,
      data: {
        content: filtered.slice(start, start + size),
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / size),
        size,
        number: page,
      },
    }
    return HttpResponse.json(result)
  }),

  http.get('/api/common/access-logs/:id', ({ params }) => {
    const log = mockAccessLogs.find((l) => l.id === params.id)
    if (!log) {
      return HttpResponse.json({ success: false, data: null, message: '로그를 찾을 수 없습니다' }, { status: 404 })
    }
    return HttpResponse.json({ success: true, data: log } satisfies ApiResult<AccessLog>)
  }),

  // === 장애로그 ===
  http.get('/api/common/error-logs', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '0')
    const size = Number(url.searchParams.get('size') ?? '10')
    const keyword = url.searchParams.get('keyword') ?? ''

    let filtered = mockErrorLogs
    if (keyword) {
      filtered = mockErrorLogs.filter(
        (l) => l.errorCode.includes(keyword) || l.errorMessage.includes(keyword),
      )
    }

    const start = page * size
    const result: ApiResult<PageResponse<ErrorLog>> = {
      success: true,
      data: {
        content: filtered.slice(start, start + size),
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / size),
        size,
        number: page,
      },
    }
    return HttpResponse.json(result)
  }),
]
