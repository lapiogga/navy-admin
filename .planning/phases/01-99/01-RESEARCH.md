# Phase 1: 공통 기능 (99_공통기능) - Research

**Researched:** 2026-04-05
**Domain:** 엔터프라이즈 행정 포탈 공통 기능 (권한관리, 결재선, 코드관리, 게시판, 시스템관리)
**Confidence:** HIGH

## Summary

Phase 1은 18개 서브시스템이 공유하는 82개 프로세스를 구현한다. Phase 0에서 동결된 FSD 구조, DataTable/CrudForm/SearchForm/DetailModal 공통 컴포넌트, MSW 패턴, ProLayout 레이아웃이 이미 존재한다. Phase 1의 핵심 과제는 이 기반 위에 **권한 모델(RBAC)**과 **코드 관리(전역 옵션 소스)**를 먼저 확립한 뒤, 결재선, 게시판, 시스템관리를 순서대로 적층하는 것이다.

Phase 1은 단순 CRUD 화면 구현이 아니다. 권한관리(COM-10~14)에서 정의한 권한그룹은 이후 845개 화면의 메뉴 접근 제어 기반이 되고, 코드관리(COM-07~08)에서 정의한 코드그룹은 모든 서브시스템 Select/Radio의 옵션 소스가 된다. 이 두 도메인이 Phase 1의 핵심 인프라이며, 나머지(게시판, 결재선, 시스템관리)는 이 인프라를 활용하는 기능들이다.

Phase 0 코드베이스를 분석한 결과, `common` 경로는 router.tsx에 이미 등록되어 있고(`/common/*`), pages/common/index.tsx는 SubsystemPage 플레이스홀더만 반환하는 상태다. 따라서 Phase 1은 신규 라우트 추가 없이 `pages/common/` 하위 각 모듈 페이지를 구현하고, entities/features 레이어에 도메인 로직을 쌓는 방식으로 진행된다.

**Primary recommendation:** 코드관리 → 권한관리 → 결재선 → 시스템관리 → 게시판 순서로 구현한다. 코드관리가 다른 화면의 Select 옵션 소스이므로 반드시 선행되어야 하고, 권한관리가 런타임 접근 제어의 기반이 되므로 두 번째로 구현한다.

<user_constraints>
## User Constraints (from CLAUDE.md / STATE.md Decisions)

### Locked Decisions
- FSD (Feature-Sliced Design) 아키텍처 채택 — 18개 서브시스템 간 코드 오염 방지
- Ant Design 5 ProComponents 채택 — antd@5.29.3 (Phase 00에서 동결)
- MSW 2.x Mock API — 백엔드 없는 MVP, 실 API 전환 시 코드 무수정
- Tailwind preflight:false — antd CSS reset 충돌 방지, Tailwind는 외부 레이아웃 전용
- MSW enableMocking() 비동기 패턴 — Service Worker 등록 완료 후 React 마운트
- shared/ui 6개 컴포넌트 인터페이스 동결 — DataTable, CrudForm, DetailModal, SearchForm, StatusBadge, SubsystemPage
- DataTable page 변환 내부화: ProTable 1-based current를 PageRequest 0-based로 DataTable 내부에서 처리
- React Router v7 — `/common/*` 라우트 이미 등록됨 (router.tsx 확인)
- Zustand persist — 'auth-storage' 키로 인증 상태 유지

### Claude's Discretion
- Phase 1 내부 URL 서브경로 구조 (/common/auth-group, /common/code-mgmt 등 — ROUTES 상수에 이미 정의됨)
- 각 도메인 entity 타입 정의
- MSW 핸들러 파일 분리 방식
- 게시판 파일 첨부 Mock 전략
- 코드 관리 전역 캐싱 전략 (TanStack Query staleTime 설정)

### Deferred Ideas (OUT OF SCOPE)
- 백엔드(Java Spring Boot) 실 API 연동
- 실 인증/JWT 검증
- 파일 실제 업로드 (S3 등)
- 권한에 따른 서버 사이드 접근 제어
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| COM-01 | 체계담당자 관리 (목록조회, 등록, 수정, 삭제, 상세조회, 저장) [6] | DataTable + CrudForm 패턴 재사용. MSW handler: GET/POST/PUT/DELETE /api/common/system-managers |
| COM-02 | 메뉴관리 (목록조회, 등록, 수정) [3] | Tree 형태 메뉴 구조. Ant Design Tree 또는 ProTable + 계층 데이터. SUBSYSTEM_MENUS entity와 연동 고려 |
| COM-03 | 메시지 관리 (목록조회, 등록, 수정, 삭제) [4] | DataTable + CrudForm. 메시지 코드/내용 구조 |
| COM-04 | 접속로그 조회 (목록조회, 상세조회, 저장) [3] | 읽기 전용 테이블 + CSV 내보내기. Ant Design Table exportable 또는 수동 CSV 생성 |
| COM-05 | 장애로그 조회 [1] | 읽기 전용 테이블 (단일 화면) |
| COM-06 | 결재선 관리 (목록조회, 등록, 수정, 삭제, 상세조회) [5] | 결재선 = 순서 있는 사용자 목록. Transfer 컴포넌트(antd)로 결재자 선택 + 순서 지정 UI 필요 |
| COM-07 | 코드그룹 관리 (목록조회, 등록, 수정, 삭제) [4] | DataTable + CrudForm. 코드그룹이 코드관리의 상위 분류 |
| COM-08 | 코드 관리 (목록조회, 등록, 수정, 삭제, 상세조회) [5] | 마스터-디테일 레이아웃: 좌측 코드그룹 목록, 우측 해당 그룹의 코드 목록. 전역 캐시 필수 |
| COM-09 | 게시판 설정 + CRUD + 첨부파일 등 [32] | 가장 복잡한 단위 요구사항. 게시판 설정(메타)/카테고리/게시글/댓글/첨부 5개 하위 도메인. Mock 파일 업로드 처리 필요 |
| COM-10 | 권한그룹 등록 (목록조회, 등록, 수정, 삭제) [4] | DataTable + CrudForm. 그룹 코드/이름/설명 기본 CRUD |
| COM-11 | 메뉴별 권한그룹 등록 (조회, 등록, 삭제) [3] | 메뉴 트리에서 권한그룹 배정. Tree + Transfer 패턴 |
| COM-12 | 권한그룹별 메뉴 등록 (조회, 등록, 삭제) [3] | COM-11의 역방향 뷰. 권한그룹 선택 → 접근 가능 메뉴 목록 |
| COM-13 | 권한그룹별 사용부대 등록 (조회, 등록, 수정, 삭제) [4] | 부대 목록에서 권한그룹 배정. DataTable + 모달 선택 |
| COM-14 | 권한그룹별 사용자 등록 (조회, 등록, 수정, 삭제, 상세조회) [5] | 사용자 검색 + 권한그룹 배정. User entity 타입(기존) 활용 |
</phase_requirements>

---

## Standard Stack

### Core (Phase 0에서 동결 — 변경 불가)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.3.1 | UI 렌더링 | Phase 0 결정 |
| TypeScript | 5.6.2 | 타입 안전성 | Phase 0 결정 |
| antd | 5.29.3 | UI 컴포넌트 | Phase 0 결정 |
| @ant-design/pro-components | 2.8.10 | ProTable/ProForm/ProLayout | Phase 0 결정 |
| zustand | 5.0.12 | 클라이언트 상태 | Phase 0 결정 |
| @tanstack/react-query | 5.96.2 | 서버 상태/캐싱 | Phase 0 결정 |
| react-router-dom | 7.14.0 | 라우팅 | Phase 0 결정 |
| msw | 2.12.14 | Mock API | Phase 0 결정 |
| @faker-js/faker | 10.4.0 | Mock 데이터 생성 | Phase 0 결정 |

### Phase 1 신규 활용 (이미 설치됨, 미사용)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| antd `Transfer` | 5.29.3 (번들) | 결재선 결재자 선택 | COM-06 결재선 관리 |
| antd `Tree` / `TreeSelect` | 5.29.3 (번들) | 메뉴 계층 구조 표시 | COM-02 메뉴관리, COM-11/12 권한-메뉴 배정 |
| antd `Upload` | 5.29.3 (번들) | 파일 첨부 UI | COM-09 게시판 첨부파일 |
| antd `Tabs` | 5.29.3 (번들) | 게시판 설정 탭 구조 | COM-09 게시판 설정 |

**신규 패키지 설치 불필요.** 모든 필요 컴포넌트가 이미 설치된 antd 5.x에 포함됨.

---

## Architecture Patterns

### FSD 레이어 적용 원칙 (Phase 0 동결)

```
navy-admin/src/
├── app/                    # 앱 레벨 (router, layouts, providers) — Phase 0 완료, 수정 최소화
├── pages/
│   └── common/             # Phase 1 진입점 (현재: SubsystemPage 플레이스홀더)
│       ├── index.tsx        # 라우터 진입점 (기존) — 수정 필요
│       ├── auth-group/      # COM-10~14 권한관리 페이지들
│       ├── code-mgmt/       # COM-07~08 코드관리 페이지들
│       ├── board/           # COM-09 게시판 페이지들
│       ├── approval/        # COM-06 결재선 페이지
│       └── system-mgr/      # COM-01~05 시스템관리 페이지들
├── widgets/                 # 복합 UI 블록 (필요 시 추가)
│   └── board/               # 게시글 에디터 위젯 (COM-09가 복잡할 경우)
├── features/
│   ├── auth/                # Phase 0 완료 — 수정 금지
│   └── common/              # Phase 1 신규: 권한체크 훅, 코드옵션 훅
├── entities/
│   ├── user/                # Phase 0 완료 — User 타입 활용
│   ├── subsystem/           # Phase 0 완료 — menus/config 활용
│   ├── permission/          # Phase 1 신규: 권한그룹 타입/API
│   ├── code/                # Phase 1 신규: 코드그룹/코드 타입/API
│   ├── approval/            # Phase 1 신규: 결재선 타입/API
│   └── board/               # Phase 1 신규: 게시판/게시글 타입/API
└── shared/
    ├── ui/                  # Phase 0 동결 — 6개 컴포넌트 인터페이스 변경 금지
    ├── api/
    │   ├── types.ts         # Phase 0 동결
    │   └── mocks/
    │       └── handlers/
    │           ├── auth.ts  # Phase 0 완료
    │           ├── demo.ts  # Phase 0 완료
    │           └── common/  # Phase 1 신규: 도메인별 handlers 추가
    └── config/
        └── routes.ts        # Phase 0에 COMMON 경로 이미 정의됨 — 서브경로 추가 필요
```

### Pattern 1: 마스터-디테일 CRUD (표준 패턴)

**What:** DataTable(목록) + CrudForm(등록/수정 모달) + DetailModal(상세 조회)
**When to use:** COM-01, COM-03, COM-06, COM-07, COM-10, COM-13, COM-14

```typescript
// Source: Phase 0 기존 코드 패턴 (demo.ts 참조)
// entities/permission/types.ts
export interface PermissionGroup {
  id: string
  groupCode: string
  groupName: string
  description: string
  createdAt: string
}

// entities/permission/api.ts
export const permissionGroupApi = {
  list: (params: PageRequest): Promise<PageResponse<PermissionGroup>> =>
    apiClient.get('/api/common/permission-groups', { params }),
  create: (data: Omit<PermissionGroup, 'id' | 'createdAt'>): Promise<ApiResult<PermissionGroup>> =>
    apiClient.post('/api/common/permission-groups', data),
  update: (id: string, data: Partial<PermissionGroup>): Promise<ApiResult<PermissionGroup>> =>
    apiClient.put(`/api/common/permission-groups/${id}`, data),
  delete: (id: string): Promise<ApiResult> =>
    apiClient.delete(`/api/common/permission-groups/${id}`),
}

// pages/common/auth-group/PermissionGroupPage.tsx
export function PermissionGroupPage() {
  const [editTarget, setEditTarget] = useState<PermissionGroup | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <DataTable<PermissionGroup>
        columns={columns}
        request={permissionGroupApi.list}
        rowKey="id"
        toolBarRender={() => [
          <Button onClick={() => setModalOpen(true)}>등록</Button>
        ]}
      />
      <Modal open={modalOpen} onCancel={() => setModalOpen(false)}>
        <CrudForm
          fields={fields}
          initialValues={editTarget ?? undefined}
          mode={editTarget ? 'edit' : 'create'}
          onFinish={async (values) => {
            // mutate → invalidateQueries
            return true
          }}
        />
      </Modal>
    </>
  )
}
```

### Pattern 2: 코드관리 마스터-디테일 2패널 레이아웃

**What:** 좌측 코드그룹 목록 + 우측 선택된 그룹의 코드 목록
**When to use:** COM-07~08

```typescript
// pages/common/code-mgmt/CodeManagementPage.tsx
export function CodeManagementPage() {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  return (
    <Row gutter={16}>
      <Col span={10}>
        {/* 코드그룹 DataTable — 행 선택 시 setSelectedGroupId */}
        <DataTable<CodeGroup> ... />
      </Col>
      <Col span={14}>
        {/* 선택된 그룹의 코드 DataTable */}
        {selectedGroupId && <CodeListPanel groupId={selectedGroupId} />}
      </Col>
    </Row>
  )
}
```

### Pattern 3: 결재선 관리 (Transfer 컴포넌트)

**What:** antd Transfer로 전체 사용자 목록에서 결재자 선택, 순서는 draggable list 또는 위/아래 버튼
**When to use:** COM-06

```typescript
// 결재선 모달 내부
import { Transfer } from 'antd'

const [selectedKeys, setSelectedKeys] = useState<string[]>([])
const [targetKeys, setTargetKeys] = useState<string[]>([]) // 결재자 순서 배열

<Transfer
  dataSource={allUsers.map(u => ({ key: u.id, title: `${u.rank} ${u.name}` }))}
  targetKeys={targetKeys}
  onChange={(nextTargetKeys) => setTargetKeys(nextTargetKeys as string[])}
  render={item => item.title}
  showSearch
/>
```

### Pattern 4: 권한-메뉴 배정 (Tree + Checkbox)

**What:** SUBSYSTEM_MENUS의 메뉴 계층을 Tree로 표시, 체크박스로 권한그룹에 메뉴 배정
**When to use:** COM-11, COM-12

```typescript
import { Tree } from 'antd'

// SUBSYSTEM_MENUS를 antd TreeDataNode 형식으로 변환
const treeData = Object.entries(SUBSYSTEM_MENUS).map(([sysCode, menus]) => ({
  key: sysCode,
  title: SUBSYSTEM_META[sysCode]?.name ?? sysCode,
  children: menus.map(menu => ({
    key: menu.path,
    title: menu.name,
    children: menu.children?.map(child => ({
      key: child.path,
      title: child.name,
    }))
  }))
}))

<Tree checkable treeData={treeData} checkedKeys={checkedMenuPaths} onCheck={setCheckedMenuPaths} />
```

### Pattern 5: 게시판 (COM-09 복합 구조)

**What:** 게시판 설정(메타 CRUD) + 카테고리 관리 + 게시글 CRUD + 댓글 + 첨부파일 업로드
**When to use:** COM-09 전용

게시판은 32개 프로세스를 포함하는 가장 복잡한 단위이다. 내부 구조를 5개 서브 도메인으로 분리한다:
1. 게시판 설정 (BoardConfig): 게시판 생성/수정/삭제
2. 카테고리 관리 (BoardCategory): 카테고리 CRUD
3. 게시글 (BoardPost): 목록/상세/작성/수정/삭제
4. 댓글 (BoardComment): 목록/작성/삭제
5. 첨부파일 (BoardAttachment): 업로드(antd Upload)/삭제/다운로드 Mock

```typescript
// antd Upload Mock 전략
import { Upload, Button } from 'antd'

<Upload
  action="/api/common/board/attachments"  // MSW가 인터셉트
  onChange={({ fileList }) => setFileList(fileList)}
  fileList={fileList}
>
  <Button icon={<UploadOutlined />}>파일 첨부</Button>
</Upload>
```

### Pattern 6: CSV 내보내기 (COM-04 접속로그)

**What:** 테이블 데이터를 클라이언트 사이드에서 CSV 변환 후 다운로드
**When to use:** COM-04

```typescript
// shared/lib/csv.ts — 신규 유틸 함수
export function downloadCsv(filename: string, rows: Record<string, unknown>[], headers: { key: string; label: string }[]) {
  const headerRow = headers.map(h => h.label).join(',')
  const dataRows = rows.map(row =>
    headers.map(h => `"${String(row[h.key] ?? '').replace(/"/g, '""')}"`).join(',')
  )
  const csv = [headerRow, ...dataRows].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
```

### Anti-Patterns to Avoid

- **공통 컴포넌트 인터페이스 수정 금지**: DataTable, CrudForm 등 6개 공통 컴포넌트 props 변경 시 845개 화면에 소급 적용 필요. 확장이 필요하면 새 컴포넌트를 추가하되 기존 인터페이스 유지
- **코드 옵션을 컴포넌트 내부에 하드코딩 금지**: Select/Radio 옵션은 반드시 코드관리 API에서 가져와야 한다 (useCodeOptions 훅 사용)
- **권한 체크를 중복 구현 금지**: 접근 제어는 authStore의 roles 배열을 기반으로 단일 훅(usePermission)에서 처리
- **게시판을 단일 파일로 구현 금지**: COM-09는 32개 프로세스이므로 5개 서브 도메인으로 분리
- **MSW 핸들러를 index.ts에 직접 추가 금지**: handlers/common/ 하위 도메인별 파일로 분리 후 index.ts에서 spread

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 결재자 선택 UI | 커스텀 드래그 선택 컴포넌트 | antd `Transfer` | 검색, 페이지네이션, 접근성 내장 |
| 메뉴 트리 표시 | 재귀 커스텀 Tree 컴포넌트 | antd `Tree` (checkable) | 가상화, 체크박스, 펼침/접힘 내장 |
| 파일 업로드 UI | input[type=file] 직접 조작 | antd `Upload` | 미리보기, 진행률, 다중 파일, drag-drop 내장 |
| 서버 상태 캐싱 | useState + useEffect | TanStack Query useQuery/useMutation | 캐시 무효화, 로딩/에러 상태, 자동 재시도 내장 |
| 페이지네이션 테이블 | 수동 slice + state | DataTable (ProTable 래핑) | 이미 동결된 공통 컴포넌트, 재사용 |
| 폼 검증 | 수동 if/else 검증 | CrudForm + Zod/antd rules | 이미 동결된 공통 컴포넌트 |
| CSV 다운로드 | 라이브러리 설치 | 순수 Blob + URL.createObjectURL | 추가 의존성 불필요, 간단 구현 가능 |

**Key insight:** Phase 0에서 동결된 공통 컴포넌트가 이미 CRUD 화면의 80%를 커버한다. 직접 구현이 필요한 것은 Transfer(결재선), Tree(메뉴 권한), Upload(게시판 첨부) 3개 패턴뿐이며 모두 antd 5.x에 포함되어 있다.

---

## Common Pitfalls

### Pitfall 1: pages/common/index.tsx 라우팅 구조 미설계
**What goes wrong:** 현재 pages/common/index.tsx는 SubsystemPage를 그대로 반환한다. 각 서브 도메인(auth-group, code-mgmt 등)으로 라우팅하는 구조를 만들지 않으면 `/common/auth-group` 접근 시 모두 동일한 플레이스홀더가 표시된다.
**Why it happens:** router.tsx가 `/common/*`을 CommonPage로 연결하지만 내부 라우트 분기가 없다.
**How to avoid:** pages/common/index.tsx에서 `useRoutes` 또는 React Router의 `<Routes>`로 서브 경로별 컴포넌트를 매핑한다.
**Warning signs:** `/common/auth-group`과 `/common/code-mgmt`가 동일한 화면을 보여줄 때

### Pitfall 2: 코드 옵션 캐싱 미설정으로 N+1 요청
**What goes wrong:** 코드관리 API를 각 컴포넌트에서 직접 호출하면, 여러 Select가 있는 페이지에서 동일 코드그룹을 N번 요청한다.
**Why it happens:** TanStack Query staleTime 기본값은 0이므로 매 마운트마다 재요청.
**How to avoid:** 코드 옵션 훅에 `staleTime: 5 * 60 * 1000` (5분) 적용. 코드 CRUD 후 `invalidateQueries(['codes', groupCode])` 호출.
**Warning signs:** Network 탭에서 동일 코드 API URL이 반복 호출될 때

### Pitfall 3: antd Transfer의 targetKeys 순서가 권한 순서와 무관
**What goes wrong:** Transfer는 targetKeys를 Set처럼 관리한다. 결재선 순서(1번 결재 → 2번 결재 → ...)는 별도 순서 배열로 관리해야 한다.
**Why it happens:** Transfer의 onChange는 단순 key 배열을 반환하며 순서를 보장하지 않는다.
**How to avoid:** targetKeys와 별도로 `orderedApproverIds: string[]` 상태를 관리. Transfer로 선택 후 순서 버튼(위/아래)으로 재정렬.

### Pitfall 4: MSW 핸들러 등록 누락으로 404
**What goes wrong:** 새 API 엔드포인트를 정의했지만 handlers/index.ts에 spread를 추가하지 않으면 MSW가 해당 요청을 인터셉트하지 못하고 실제 네트워크 요청이 발생, 404 오류.
**Why it happens:** browser.ts는 handlers/index.ts를 참조하므로 새 핸들러 파일을 index.ts에 등록해야 한다.
**How to avoid:** 새 핸들러 파일 생성 후 handlers/index.ts에서 반드시 spread `[...commonHandlers, ...]`.

### Pitfall 5: 게시판 첨부파일 Upload 컴포넌트의 onPreview/onDownload Mock 미처리
**What goes wrong:** antd Upload의 onPreview 기본 동작이 실제 URL을 열려고 한다. MSW가 파일 바이너리 응답을 반환하지 않으면 콘솔 에러.
**Why it happens:** Upload 컴포넌트가 파일 URL로 window.open 또는 fetch를 시도.
**How to avoid:** `onPreview`를 커스텀 구현하여 Mock에서는 `message.info('Mock: 파일 미리보기 미지원')` 등으로 처리. 다운로드도 동일하게 Mock 처리.

### Pitfall 6: Tree checkable의 반선택(indeterminate) 상태 무시
**What goes wrong:** 메뉴 계층 트리에서 하위 메뉴 일부만 체크한 경우 부모 노드가 반선택 상태가 된다. 이 상태를 권한 저장 시 포함하면 의도치 않게 부모 메뉴 전체 권한이 부여될 수 있다.
**Why it happens:** Tree의 `onCheck`은 `{ checked, halfChecked }` 객체를 반환하는 모드가 있다.
**How to avoid:** `checkStrictly` prop 또는 `onCheck`에서 `checked` 배열만 저장, `halfChecked`는 UI 표시용으로만 사용.

---

## Code Examples

### 공통 CRUD 페이지 기본 구조 (Pattern 1 적용)

```typescript
// Source: Phase 0 DataTable/CrudForm 인터페이스 기반
import { useState, useRef } from 'react'
import { Button, Modal, message } from 'antd'
import type { ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui'
import { CrudForm, type CrudFormField } from '@/shared/ui'
import type { PageRequest } from '@/shared/api/types'

// entity 타입 및 API는 entities/[domain]/ 에서 import
interface ExampleEntity extends Record<string, unknown> {
  id: string
  name: string
  createdAt: string
}

const columns = [
  { title: 'ID', dataIndex: 'id' },
  { title: '이름', dataIndex: 'name' },
  { title: '등록일', dataIndex: 'createdAt' },
]

const formFields: CrudFormField[] = [
  { name: 'name', label: '이름', type: 'text', required: true },
]

export function ExampleCrudPage() {
  const tableRef = useRef<ActionType>()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<ExampleEntity | null>(null)

  const handleCreate = () => {
    setEditItem(null)
    setModalOpen(true)
  }

  const handleFinish = async (values: Record<string, unknown>) => {
    try {
      // await createOrUpdate(values)
      message.success(editItem ? '수정되었습니다' : '등록되었습니다')
      tableRef.current?.reload()
      setModalOpen(false)
      return true
    } catch {
      message.error('처리 실패')
      return false
    }
  }

  return (
    <>
      <DataTable<ExampleEntity>
        columns={columns}
        request={(params: PageRequest) => fetchList(params)}
        rowKey="id"
        toolBarRender={() => [
          <Button type="primary" onClick={handleCreate}>등록</Button>,
        ]}
      />
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        title={editItem ? '수정' : '등록'}
        footer={null}
        destroyOnClose
      >
        <CrudForm
          fields={formFields}
          initialValues={editItem ?? undefined}
          mode={editItem ? 'edit' : 'create'}
          onFinish={handleFinish}
        />
      </Modal>
    </>
  )
}
```

### MSW 핸들러 도메인별 분리 패턴

```typescript
// Source: Phase 0 handlers/demo.ts 패턴 확장
// shared/api/mocks/handlers/common/permission.ts
import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker/locale/ko'
import type { ApiResult, PageResponse } from '@/shared/api/types'
import type { PermissionGroup } from '@/entities/permission/types'

let mockGroups: PermissionGroup[] = Array.from({ length: 20 }, (_, i) => ({
  id: faker.string.uuid(),
  groupCode: `GRP_${String(i + 1).padStart(3, '0')}`,
  groupName: faker.helpers.arrayElement(['관리자', '일반사용자', '조회전용', '시스템관리자']),
  description: faker.lorem.sentence(),
  createdAt: faker.date.recent({ days: 90 }).toISOString().split('T')[0],
}))

export const permissionHandlers = [
  http.get('/api/common/permission-groups', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '0')
    const size = Number(url.searchParams.get('size') ?? '10')
    const start = page * size
    const result: ApiResult<PageResponse<PermissionGroup>> = {
      success: true,
      data: {
        content: mockGroups.slice(start, start + size),
        totalElements: mockGroups.length,
        totalPages: Math.ceil(mockGroups.length / size),
        size,
        number: page,
      },
    }
    return HttpResponse.json(result)
  }),
  // POST, PUT, DELETE 핸들러...
]

// shared/api/mocks/handlers/index.ts에 추가:
// import { permissionHandlers } from './common/permission'
// export const handlers = [...authHandlers, ...demoHandlers, ...permissionHandlers, ...]
```

### TanStack Query + useMutation 패턴

```typescript
// features/common/hooks/usePermissionGroup.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { permissionGroupApi } from '@/entities/permission/api'
import type { PageRequest } from '@/shared/api/types'

export function usePermissionGroups(params: PageRequest) {
  return useQuery({
    queryKey: ['permission-groups', params],
    queryFn: () => permissionGroupApi.list(params),
  })
}

export function useCreatePermissionGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: permissionGroupApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permission-groups'] })
    },
  })
}
```

### 코드 옵션 전역 캐싱 훅

```typescript
// features/common/hooks/useCodeOptions.ts
import { useQuery } from '@tanstack/react-query'
import { codeApi } from '@/entities/code/api'

export function useCodeOptions(groupCode: string) {
  return useQuery({
    queryKey: ['code-options', groupCode],
    queryFn: () => codeApi.getOptions(groupCode),
    staleTime: 5 * 60 * 1000,  // 5분 캐시: 코드는 자주 변하지 않음
    select: (data) => data.map(c => ({ label: c.codeName, value: c.codeValue })),
  })
}

// 사용: const { data: statusOptions } = useCodeOptions('APPROVAL_STATUS')
```

---

## API 엔드포인트 설계

Phase 1에서 구현할 MSW 핸들러의 엔드포인트 목록:

| 도메인 | 엔드포인트 | 메서드 | 요구사항 |
|--------|-----------|--------|---------|
| 체계담당자 | /api/common/system-managers | GET, POST | COM-01 |
| 체계담당자 | /api/common/system-managers/:id | GET, PUT, DELETE | COM-01 |
| 메뉴관리 | /api/common/menus | GET, POST | COM-02 |
| 메뉴관리 | /api/common/menus/:id | PUT, DELETE | COM-02 |
| 메시지관리 | /api/common/messages | GET, POST | COM-03 |
| 메시지관리 | /api/common/messages/:id | PUT, DELETE | COM-03 |
| 접속로그 | /api/common/access-logs | GET | COM-04 |
| 접속로그 | /api/common/access-logs/:id | GET | COM-04 |
| 장애로그 | /api/common/error-logs | GET | COM-05 |
| 결재선 | /api/common/approval-lines | GET, POST | COM-06 |
| 결재선 | /api/common/approval-lines/:id | GET, PUT, DELETE | COM-06 |
| 코드그룹 | /api/common/code-groups | GET, POST | COM-07 |
| 코드그룹 | /api/common/code-groups/:id | PUT, DELETE | COM-07 |
| 코드 | /api/common/codes | GET, POST | COM-08 |
| 코드 | /api/common/codes/:id | GET, PUT, DELETE | COM-08 |
| 코드 옵션 | /api/common/codes/options/:groupCode | GET | COM-08 서비스 |
| 게시판 설정 | /api/common/board-configs | GET, POST | COM-09 |
| 게시판 설정 | /api/common/board-configs/:id | GET, PUT, DELETE | COM-09 |
| 카테고리 | /api/common/boards/:boardId/categories | GET, POST | COM-09 |
| 게시글 | /api/common/boards/:boardId/posts | GET, POST | COM-09 |
| 게시글 | /api/common/boards/:boardId/posts/:id | GET, PUT, DELETE | COM-09 |
| 댓글 | /api/common/posts/:postId/comments | GET, POST | COM-09 |
| 첨부파일 | /api/common/board/attachments | POST | COM-09 |
| 첨부파일 | /api/common/board/attachments/:id | DELETE | COM-09 |
| 권한그룹 | /api/common/permission-groups | GET, POST | COM-10 |
| 권한그룹 | /api/common/permission-groups/:id | PUT, DELETE | COM-10 |
| 메뉴별 권한그룹 | /api/common/menu-permissions | GET, POST, DELETE | COM-11 |
| 권한그룹별 메뉴 | /api/common/permission-groups/:id/menus | GET, POST, DELETE | COM-12 |
| 권한그룹별 부대 | /api/common/permission-groups/:id/units | GET, POST, PUT, DELETE | COM-13 |
| 권한그룹별 사용자 | /api/common/permission-groups/:id/users | GET, POST, PUT, DELETE | COM-14 |
| 권한그룹별 사용자 | /api/common/permission-groups/:id/users/:uid | GET | COM-14 |

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| SubsystemPage 플레이스홀더 | 실제 CRUD 페이지 구현 | Phase 1 시작 | pages/common/ 하위 구조 필요 |
| handlers/index.ts 단일 파일 | handlers/common/ 하위 도메인별 파일 분리 | Phase 1 시작 | 파일당 1~3개 도메인 응집도 유지 |

---

## Open Questions

1. **common 서브시스템의 ProLayout 메뉴 구조**
   - What we know: router.tsx에서 `/common/*`을 CommonPage로 라우팅. ROUTES 상수에 COMMON 서브경로 정의됨
   - What's unclear: SubsystemProLayout이 sysCode = 'common'으로 SUBSYSTEM_META/MENUS를 찾으려 하는데 common은 등록되지 않음
   - Recommendation: SUBSYSTEM_META와 SUBSYSTEM_MENUS에 'common' 키를 추가하거나, 공통 기능 전용 레이아웃을 별도 구성한다. 후자(전용 레이아웃)가 더 명확하다.

2. **권한 체크 런타임 적용 범위**
   - What we know: authStore에 user.roles 배열 존재. 권한그룹 코드(예: 'ADMIN', 'SYS01_USER')
   - What's unclear: Phase 1에서 권한관리를 구현하면 Mock에서 실제로 메뉴 접근을 제한해야 하는지, 아니면 관리 화면만 구현하면 되는지
   - Recommendation: Phase 1에서는 권한관리 화면(CRUD)만 구현. 실제 메뉴 접근 제어는 Phase 2(메인 포탈)에서 통합. 단, `usePermission` 훅의 인터페이스를 Phase 1에서 미리 정의해 두어야 Phase 2에서 연결 가능.

3. **공통게시판의 서브시스템별 인스턴스 연동**
   - What we know: COM-09에서 게시판 설정 후 '해당 서브시스템에서 게시글 작성/조회가 동작'해야 함
   - What's unclear: 서브시스템별로 별도 게시판 인스턴스를 쓰는지, 하나의 공통 게시판에 boardId로 구분하는지
   - Recommendation: boardId 기반 단일 게시판 API를 사용하고, 각 서브시스템에서 해당 boardId로 접근. Phase 3+ 서브시스템 구현 시 게시판 컴포넌트를 재사용할 수 있도록 entities/board/ API를 설계.

---

## Environment Availability

Step 2.6: 기존 Phase 0 환경과 동일. 신규 외부 의존성 없음.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vite dev server | ✓ | Phase 0 검증됨 | — |
| npm | 패키지 설치 | ✓ | Phase 0 검증됨 | — |
| antd Transfer | COM-06 결재선 | ✓ | antd 5.29.3 번들 | — |
| antd Tree | COM-02, COM-11/12 | ✓ | antd 5.29.3 번들 | — |
| antd Upload | COM-09 첨부파일 | ✓ | antd 5.29.3 번들 | — |

**Missing dependencies:** 없음.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.2 + @testing-library/react 16.x |
| Config file | vite.config.ts (test 설정 포함 예상) |
| Quick run command | `npm run test -- --run --reporter=verbose` |
| Full suite command | `npm run test:run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| COM-01 | 체계담당자 CRUD API 핸들러 | unit | `npm run test:run -- common/system-manager` | ❌ Wave 0 |
| COM-07/08 | 코드그룹/코드 CRUD API 핸들러 | unit | `npm run test:run -- common/code` | ❌ Wave 0 |
| COM-08 | useCodeOptions staleTime 캐싱 | unit | `npm run test:run -- useCodeOptions` | ❌ Wave 0 |
| COM-09 | 게시판 설정 생성/게시글 CRUD | unit | `npm run test:run -- common/board` | ❌ Wave 0 |
| COM-10 | 권한그룹 CRUD API 핸들러 | unit | `npm run test:run -- common/permission` | ❌ Wave 0 |
| COM-04 | CSV 다운로드 유틸 | unit | `npm run test:run -- downloadCsv` | ❌ Wave 0 |
| COM-06 | 결재선 등록/수정 MSW 핸들러 | unit | `npm run test:run -- common/approval` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npm run test:run` (기존 통과 테스트 회귀 방지)
- **Per wave merge:** `npm run test:run`
- **Phase gate:** 전체 테스트 녹색 + 주요 화면 브라우저 확인 후 /gsd:verify-work

### Wave 0 Gaps

- [ ] `src/shared/api/mocks/handlers/common/` 디렉토리 생성 — 모든 COM 핸들러 파일
- [ ] `src/entities/permission/`, `src/entities/code/`, `src/entities/approval/`, `src/entities/board/` — 타입/API 파일
- [ ] `src/features/common/hooks/` — useCodeOptions, usePermission 훅
- [ ] `src/shared/lib/csv.ts` — CSV 다운로드 유틸

---

## Project Constraints (from CLAUDE.md)

| 지시사항 | 적용 |
|---------|------|
| FSD 아키텍처 유지 | entities/features/pages 레이어 분리 준수 |
| antd@5.29.3 고정 | 업그레이드 금지 |
| MSW Mock API | 모든 API는 MSW 핸들러로 구현 |
| shared/ui 6개 컴포넌트 인터페이스 동결 | DataTable 등 props 시그니처 변경 금지 |
| TypeScript any 남용 금지 | 모든 API 응답 타입 명시 |
| 파일 800줄, 함수 50줄 제한 | COM-09 게시판은 반드시 분리 |
| 불변성 (mutation 금지) | Zustand set, TanStack Query 캐시 업데이트에 spread 패턴 사용 |
| 환경변수 커밋 금지 | .env 파일 없음 (현재 Mock만 사용) |
| 테스트 커버리지 80%+ | MSW 핸들러 및 훅에 단위 테스트 |
| 한국어 코드 주석 | 컴포넌트 및 유틸 함수 주석 한국어 |

---

## Sources

### Primary (HIGH confidence)
- Phase 0 코드베이스 직접 분석 — authStore, DataTable, CrudForm, router.tsx, handlers/
- package.json — 실제 설치 버전 확인 (antd 5.29.3, zustand 5.0.12, etc.)
- shared/api/types.ts — PageRequest/PageResponse/ApiResult 인터페이스 확인
- shared/config/routes.ts — ROUTES.COMMON 서브경로 확인

### Secondary (MEDIUM confidence)
- antd 5.x 공식 문서 (Transfer, Tree, Upload 컴포넌트) — 훈련 데이터 기반, 버전 일치
- TanStack Query v5 staleTime 패턴 — Phase 0 리서치에서 HIGH 확인됨

### Tertiary (LOW confidence)
- 없음

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — package.json 직접 확인
- Architecture: HIGH — Phase 0 코드베이스 직접 분석
- Pitfalls: HIGH — antd 컴포넌트 동작 특성 기반, Phase 0 패턴 분석
- API 설계: MEDIUM — 요구사항 기반 설계, 실제 Spring Boot API와 맞춰볼 시점에 조정 필요

**Research date:** 2026-04-05
**Valid until:** 2026-05-05 (antd 5.x 안정 버전, 30일)
