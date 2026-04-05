import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker/locale/ko'
import type { PageResponse, ApiResult } from '@/shared/api/types'
import type { PermissionGroup, MenuPermission, GroupUser, GroupUnit } from '@/entities/permission/types'

// 권한그룹 사전 정의
const GROUP_DEFS = [
  { groupCode: 'ADMIN', groupName: '관리자' },
  { groupCode: 'COMMON_USER', groupName: '일반사용자' },
  { groupCode: 'VIEWER', groupName: '조회전용' },
  { groupCode: 'SYS_ADMIN', groupName: '시스템관리자' },
  { groupCode: 'SYS01_MANAGER', groupName: '초과근무관리자' },
  { groupCode: 'SYS01_USER', groupName: '초과근무사용자' },
  { groupCode: 'SYS02_MANAGER', groupName: '설문관리자' },
  { groupCode: 'SYS02_USER', groupName: '설문사용자' },
  { groupCode: 'SYS03_MANAGER', groupName: '성과관리자' },
  { groupCode: 'SYS03_USER', groupName: '성과사용자' },
  { groupCode: 'SYS04_MANAGER', groupName: '인증서관리자' },
  { groupCode: 'SYS04_USER', groupName: '인증서사용자' },
  { groupCode: 'SYS15_MANAGER', groupName: '보안관리자' },
  { groupCode: 'SYS15_USER', groupName: '보안사용자' },
  { groupCode: 'SYS16_MANAGER', groupName: '회의실관리자' },
  { groupCode: 'SYS10_MANAGER', groupName: '버스관리자' },
  { groupCode: 'SYS10_USER', groupName: '버스사용자' },
  { groupCode: 'SECURITY_OFFICER', groupName: '보안담당관' },
  { groupCode: 'UNIT_ADMIN', groupName: '부대관리자' },
  { groupCode: 'READONLY', groupName: '읽기전용' },
]

// 권한그룹 Mock 데이터
let mockGroups: PermissionGroup[] = GROUP_DEFS.map((def) => ({
  id: faker.string.uuid(),
  groupCode: def.groupCode,
  groupName: def.groupName,
  description: faker.lorem.sentence(),
  createdAt: faker.date.past({ years: 1 }).toISOString().split('T')[0],
  updatedAt: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
}))

// 메뉴 경로 목록 (sys01~sys05 대표 메뉴)
const SAMPLE_MENU_PATHS = [
  '/sys01/1/1', '/sys01/1/2', '/sys01/1/3', '/sys01/2/1', '/sys01/2/3',
  '/sys01/3/1', '/sys01/3/2', '/sys02/1/1', '/sys02/1/2', '/sys02/1/3',
  '/sys03/1/1', '/sys03/2/1', '/sys04/1/1', '/sys04/1/2', '/sys04/1/3',
  '/sys05/1/1', '/sys05/2/1', '/common/1/1', '/common/2/1', '/common/3/1',
]

const MENU_NAME_MAP: Record<string, string> = {
  '/sys01/1/1': '신청서 작성', '/sys01/1/2': '신청서 결재', '/sys01/1/3': '일괄처리',
  '/sys01/2/1': '나의 근무현황', '/sys01/2/3': '부대 근무 현황',
  '/sys01/3/1': '부대인원 조회', '/sys01/3/2': '최대인정시간',
  '/sys02/1/1': '게시판', '/sys02/1/2': '나의 설문관리', '/sys02/1/3': '설문참여',
  '/sys03/1/1': '메인화면', '/sys03/2/1': '시스템관리',
  '/sys04/1/1': '게시판', '/sys04/1/2': '인증서 신청', '/sys04/1/3': '인증서 승인/관리',
  '/sys05/1/1': '현행규정', '/sys05/2/1': '해군본부',
  '/common/1/1': '체계담당자', '/common/2/1': '결재선 관리', '/common/3/1': '코드그룹 관리',
}

// 메뉴별 권한 Mock 데이터
let mockMenuPermissions: MenuPermission[] = mockGroups.flatMap((group) => {
  // 각 그룹에 랜덤으로 5~15개 메뉴 배정
  const count = faker.number.int({ min: 5, max: 15 })
  const shuffled = [...SAMPLE_MENU_PATHS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map((path) => ({
    id: faker.string.uuid(),
    groupId: group.id,
    menuPath: path,
    menuName: MENU_NAME_MAP[path] ?? path,
    subsystemCode: path.split('/')[1] ?? 'common',
  }))
})

// 전체 사용자 Mock 데이터 (사용자 검색/배정용 50명)
const mockAllUsers = Array.from({ length: 50 }, () => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  rank: faker.helpers.arrayElement(['이병', '일병', '상병', '병장', '하사', '중사', '상사', '원사', '준위', '소위', '중위', '대위', '소령', '중령', '대령']),
  unit: faker.helpers.arrayElement(['해병대사령부', '1사단', '2사단', '교육훈련단', '연평부대', '백령부대']),
  username: faker.internet.username(),
  roles: [faker.helpers.arrayElement(['COMMON_USER', 'SYS01_USER', 'SYS02_USER'])],
}))

// 그룹별 사용자 배정 Mock 데이터
let mockGroupUsers: GroupUser[] = mockGroups.flatMap((group) => {
  const count = faker.number.int({ min: 3, max: 10 })
  return Array.from({ length: count }, () => {
    const user = faker.helpers.arrayElement(mockAllUsers)
    return {
      id: faker.string.uuid(),
      groupId: group.id,
      userId: user.id,
      userName: user.name,
      userRank: user.rank,
      userUnit: user.unit,
      assignedAt: faker.date.recent({ days: 90 }).toISOString().split('T')[0],
    }
  })
})

// 부대 목록
const UNIT_DEFS = [
  { unitCode: 'HQ', unitName: '해병대사령부' },
  { unitCode: 'DIV1', unitName: '1사단' },
  { unitCode: 'DIV2', unitName: '2사단' },
  { unitCode: 'TRAIN', unitName: '교육훈련단' },
  { unitCode: 'YP', unitName: '연평부대' },
  { unitCode: 'BL', unitName: '백령부대' },
]

// 그룹별 부대 배정 Mock 데이터
let mockGroupUnits: GroupUnit[] = mockGroups.flatMap((group) => {
  const count = faker.number.int({ min: 2, max: 5 })
  const shuffled = [...UNIT_DEFS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map((unit) => ({
    id: faker.string.uuid(),
    groupId: group.id,
    unitCode: unit.unitCode,
    unitName: unit.unitName,
    assignedAt: faker.date.recent({ days: 90 }).toISOString().split('T')[0],
  }))
})

export const permissionHandlers = [
  // 권한그룹 목록 조회
  http.get('/api/common/permission-groups', ({ request }) => {
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

    const result: ApiResult<PageResponse<PermissionGroup>> = {
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

  // 권한그룹 등록
  http.post('/api/common/permission-groups', async ({ request }) => {
    const body = (await request.json()) as Partial<PermissionGroup>
    const newGroup: PermissionGroup = {
      id: faker.string.uuid(),
      groupCode: body.groupCode ?? '',
      groupName: body.groupName ?? '',
      description: body.description ?? '',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    }
    mockGroups = [...mockGroups, newGroup]

    const result: ApiResult<PermissionGroup> = { success: true, data: newGroup, message: '등록되었습니다' }
    return HttpResponse.json(result, { status: 201 })
  }),

  // 권한그룹 수정
  http.put('/api/common/permission-groups/:id', async ({ params, request }) => {
    const body = (await request.json()) as Partial<PermissionGroup>
    const idx = mockGroups.findIndex((g) => g.id === params.id)
    if (idx === -1) {
      return HttpResponse.json({ success: false, data: null, message: '대상을 찾을 수 없습니다' }, { status: 404 })
    }
    const updated = { ...mockGroups[idx], ...body, updatedAt: new Date().toISOString().split('T')[0] }
    mockGroups = [...mockGroups.slice(0, idx), updated, ...mockGroups.slice(idx + 1)]

    const result: ApiResult<PermissionGroup> = { success: true, data: updated, message: '수정되었습니다' }
    return HttpResponse.json(result)
  }),

  // 권한그룹 삭제
  http.delete('/api/common/permission-groups/:id', ({ params }) => {
    const groupId = params.id as string
    mockGroups = mockGroups.filter((g) => g.id !== groupId)
    mockMenuPermissions = mockMenuPermissions.filter((p) => p.groupId !== groupId)
    mockGroupUsers = mockGroupUsers.filter((u) => u.groupId !== groupId)
    mockGroupUnits = mockGroupUnits.filter((u) => u.groupId !== groupId)

    const result: ApiResult = { success: true, data: undefined as never, message: '삭제되었습니다' }
    return HttpResponse.json(result)
  }),

  // 메뉴별 권한그룹 조회 (menuPath 또는 groupId 파라미터)
  http.get('/api/common/menu-permissions', ({ request }) => {
    const url = new URL(request.url)
    const menuPath = url.searchParams.get('menuPath') ?? ''
    const groupId = url.searchParams.get('groupId') ?? ''

    let filtered = mockMenuPermissions
    if (menuPath) {
      filtered = mockMenuPermissions.filter((p) => p.menuPath === menuPath)
    } else if (groupId) {
      filtered = mockMenuPermissions.filter((p) => p.groupId === groupId)
    }

    const result: ApiResult<MenuPermission[]> = { success: true, data: filtered }
    return HttpResponse.json(result)
  }),

  // 메뉴 배정 (POST /api/common/menu-permissions)
  http.post('/api/common/menu-permissions', async ({ request }) => {
    const body = (await request.json()) as { groupId: string; menuPaths: string[] }
    // 기존 배정 제거 후 재배정
    mockMenuPermissions = mockMenuPermissions.filter((p) => p.groupId !== body.groupId)
    const newPerms: MenuPermission[] = body.menuPaths.map((path) => ({
      id: faker.string.uuid(),
      groupId: body.groupId,
      menuPath: path,
      menuName: MENU_NAME_MAP[path] ?? path,
      subsystemCode: path.split('/')[1] ?? 'common',
    }))
    mockMenuPermissions = [...mockMenuPermissions, ...newPerms]

    const result: ApiResult = { success: true, data: undefined as never, message: '저장되었습니다' }
    return HttpResponse.json(result)
  }),

  // 메뉴 해제 (DELETE /api/common/menu-permissions)
  http.delete('/api/common/menu-permissions', async ({ request }) => {
    const body = (await request.json()) as { groupId: string; menuPaths: string[] }
    mockMenuPermissions = mockMenuPermissions.filter(
      (p) => !(p.groupId === body.groupId && body.menuPaths.includes(p.menuPath)),
    )

    const result: ApiResult = { success: true, data: undefined as never, message: '해제되었습니다' }
    return HttpResponse.json(result)
  }),

  // 그룹별 메뉴 조회 (GET /api/common/permission-groups/:id/menus)
  http.get('/api/common/permission-groups/:id/menus', ({ params }) => {
    const groupId = params.id as string
    const menus = mockMenuPermissions.filter((p) => p.groupId === groupId)
    const result: ApiResult<MenuPermission[]> = { success: true, data: menus }
    return HttpResponse.json(result)
  }),

  // 그룹 메뉴 배정 (POST /api/common/permission-groups/:id/menus)
  http.post('/api/common/permission-groups/:id/menus', async ({ params, request }) => {
    const groupId = params.id as string
    const body = (await request.json()) as { menuPaths: string[] }
    mockMenuPermissions = mockMenuPermissions.filter((p) => p.groupId !== groupId)
    const newPerms: MenuPermission[] = body.menuPaths.map((path) => ({
      id: faker.string.uuid(),
      groupId,
      menuPath: path,
      menuName: MENU_NAME_MAP[path] ?? path,
      subsystemCode: path.split('/')[1] ?? 'common',
    }))
    mockMenuPermissions = [...mockMenuPermissions, ...newPerms]

    const result: ApiResult = { success: true, data: undefined as never, message: '저장되었습니다' }
    return HttpResponse.json(result)
  }),

  // 그룹 메뉴 해제 (DELETE /api/common/permission-groups/:id/menus)
  http.delete('/api/common/permission-groups/:id/menus', async ({ params, request }) => {
    const groupId = params.id as string
    const body = (await request.json()) as { menuPaths: string[] }
    mockMenuPermissions = mockMenuPermissions.filter(
      (p) => !(p.groupId === groupId && body.menuPaths.includes(p.menuPath)),
    )

    const result: ApiResult = { success: true, data: undefined as never, message: '해제되었습니다' }
    return HttpResponse.json(result)
  }),

  // 그룹 사용자 목록 (GET /api/common/permission-groups/:id/users)
  http.get('/api/common/permission-groups/:id/users', ({ params, request }) => {
    const groupId = params.id as string
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '0')
    const size = Number(url.searchParams.get('size') ?? '10')

    const filtered = mockGroupUsers.filter((u) => u.groupId === groupId)
    const start = page * size
    const content = filtered.slice(start, start + size)

    const result: ApiResult<PageResponse<GroupUser>> = {
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

  // 그룹 사용자 배정 (POST /api/common/permission-groups/:id/users)
  http.post('/api/common/permission-groups/:id/users', async ({ params, request }) => {
    const groupId = params.id as string
    const body = (await request.json()) as { userIds: string[] }
    const newAssignments: GroupUser[] = body.userIds.map((userId) => {
      const user = mockAllUsers.find((u) => u.id === userId)
      return {
        id: faker.string.uuid(),
        groupId,
        userId,
        userName: user?.name ?? '알 수 없음',
        userRank: user?.rank ?? '-',
        userUnit: user?.unit ?? '-',
        assignedAt: new Date().toISOString().split('T')[0],
      }
    })
    // 중복 배정 방지
    const existingUserIds = mockGroupUsers.filter((u) => u.groupId === groupId).map((u) => u.userId)
    const unique = newAssignments.filter((a) => !existingUserIds.includes(a.userId))
    mockGroupUsers = [...mockGroupUsers, ...unique]

    const result: ApiResult = { success: true, data: undefined as never, message: '배정되었습니다' }
    return HttpResponse.json(result, { status: 201 })
  }),

  // 그룹 사용자 상세 (GET /api/common/permission-groups/:id/users/:uid)
  http.get('/api/common/permission-groups/:id/users/:uid', ({ params }) => {
    const groupId = params.id as string
    const userId = params.uid as string
    const user = mockGroupUsers.find((u) => u.groupId === groupId && u.userId === userId)
    if (!user) {
      return HttpResponse.json({ success: false, data: null, message: '대상을 찾을 수 없습니다' }, { status: 404 })
    }
    const result: ApiResult<GroupUser> = { success: true, data: user }
    return HttpResponse.json(result)
  }),

  // 그룹 사용자 해제 (DELETE /api/common/permission-groups/:id/users/:uid)
  http.delete('/api/common/permission-groups/:id/users/:uid', ({ params }) => {
    const groupId = params.id as string
    const userId = params.uid as string
    mockGroupUsers = mockGroupUsers.filter((u) => !(u.groupId === groupId && u.userId === userId))

    const result: ApiResult = { success: true, data: undefined as never, message: '해제되었습니다' }
    return HttpResponse.json(result)
  }),

  // 그룹 부대 목록 (GET /api/common/permission-groups/:id/units)
  http.get('/api/common/permission-groups/:id/units', ({ params, request }) => {
    const groupId = params.id as string
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '0')
    const size = Number(url.searchParams.get('size') ?? '10')

    const filtered = mockGroupUnits.filter((u) => u.groupId === groupId)
    const start = page * size
    const content = filtered.slice(start, start + size)

    const result: ApiResult<PageResponse<GroupUnit>> = {
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

  // 그룹 부대 배정 (POST /api/common/permission-groups/:id/units)
  http.post('/api/common/permission-groups/:id/units', async ({ params, request }) => {
    const groupId = params.id as string
    const body = (await request.json()) as { units: { unitCode: string; unitName: string }[] }
    const newUnits: GroupUnit[] = body.units.map((unit) => ({
      id: faker.string.uuid(),
      groupId,
      unitCode: unit.unitCode,
      unitName: unit.unitName,
      assignedAt: new Date().toISOString().split('T')[0],
    }))
    mockGroupUnits = [...mockGroupUnits, ...newUnits]

    const result: ApiResult = { success: true, data: undefined as never, message: '배정되었습니다' }
    return HttpResponse.json(result, { status: 201 })
  }),

  // 그룹 부대 해제 (DELETE /api/common/permission-groups/:id/units/:unitId)
  http.delete('/api/common/permission-groups/:id/units/:unitId', ({ params }) => {
    const unitId = params.unitId as string
    mockGroupUnits = mockGroupUnits.filter((u) => u.id !== unitId)

    const result: ApiResult = { success: true, data: undefined as never, message: '해제되었습니다' }
    return HttpResponse.json(result)
  }),

  // 전체 사용자 검색 (사용자 배정용)
  http.get('/api/common/users', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '0')
    const size = Number(url.searchParams.get('size') ?? '10')
    const keyword = url.searchParams.get('keyword') ?? ''

    let filtered = mockAllUsers
    if (keyword) {
      filtered = mockAllUsers.filter(
        (u) => u.name.includes(keyword) || u.unit.includes(keyword) || u.rank.includes(keyword),
      )
    }

    const start = page * size
    const content = filtered.slice(start, start + size)

    const result: ApiResult<PageResponse<typeof mockAllUsers[0]>> = {
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
]
