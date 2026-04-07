# Architecture Patterns

**Domain:** 대규모 React 행정 포탈 (18개 서브시스템 + 공통모듈)
**Researched:** 2026-04-05
**Confidence:** HIGH

---

## 핵심 결정: Single Repo + Feature-Sliced Design (FSD)

**모노레포(Turborepo/Nx)나 Module Federation은 사용하지 않는다.**

이유: MVP 단계에서 단일 팀이 단일 Java 백엔드에 연결될 프론트엔드를 개발하는 구조다. 배포 독립성, 팀 독립성, 런타임 공유가 필요 없으므로 마이크로프론트엔드의 복잡도는 순수 오버헤드다. Single Repo + FSD 레이어링이 복잡도 대비 최적이다.

---

## 추천 아키텍처: Feature-Sliced Design (FSD)

FSD는 기능(도메인) 중심으로 코드를 계층화하는 방법론이다. 18개 서브시스템이 각각 `pages/` 슬라이스가 되고, 공통 기능은 `shared/`와 `entities/`로 분리된다.

### 프로젝트 구조

```
src/
├── app/                    # 앱 초기화, 글로벌 설정
│   ├── router.tsx          # 전체 라우트 정의 (lazy loading 적용)
│   ├── providers.tsx       # Context 프로바이더 조합
│   └── styles/             # 글로벌 CSS, Tailwind base
│
├── pages/                  # 라우트 단위 페이지 (서브시스템 진입점)
│   ├── login/              # 로그인 화면
│   ├── portal/             # 메인 포탈 대시보드
│   ├── system-admin/       # 99_공통기능 - 시스템관리
│   ├── overtime/           # 01_초과근무관리체계
│   ├── survey/             # 02_설문종합관리체계
│   ├── performance/        # 03_성과관리체계
│   ├── certificate/        # 04_인증서발급신청체계
│   ├── admin-rules/        # 05_행정규칙포탈체계
│   ├── regulations/        # 06_해병대규정관리체계
│   ├── military-data/      # 07_군사자료관리체계
│   ├── unit-lineage/       # 08_부대계보관리체계
│   ├── memorial/           # 09_영현보훈체계
│   ├── weekend-bus/        # 10_주말버스예약관리체계
│   ├── research-data/      # 11_연구자료종합관리체계
│   ├── directives/         # 12_지시건의사항관리체계
│   ├── knowledge/          # 13_지식관리체계
│   ├── suggestion/         # 14_나의 제언
│   ├── security-ledger/    # 15_보안일일결산체계
│   ├── meeting-room/       # 16_회의실예약관리체계
│   ├── inspection/         # 17_검열결과관리체계
│   └── job-description/    # 18_직무기술서관리체계
│
├── widgets/                # 독립 UI 블록 (여러 pages에서 조합)
│   ├── subsystem-nav/      # 서브시스템 네비게이션 바
│   ├── approval-flow/      # 결재선 위젯
│   ├── bulletin-board/     # 공통게시판 위젯
│   └── session-guard/      # 세션 만료 감지 + 처리
│
├── features/               # 사용자 행동 단위 기능
│   ├── auth/               # 로그인/로그아웃 액션
│   ├── session/            # 세션 갱신, 만료 처리
│   ├── approval/           # 결재 신청/승인/반려
│   ├── board/              # 게시글 CRUD
│   ├── permission/         # 권한 부여/회수
│   └── code-management/    # 코드그룹/코드 CRUD
│
├── entities/               # 도메인 엔티티 (데이터 모델 + 기본 UI)
│   ├── user/               # 사용자 타입, 훅, 기본 카드
│   ├── approval-line/      # 결재선 타입, 렌더러
│   ├── permission-group/   # 권한그룹 타입
│   └── subsystem/          # 서브시스템 메타데이터 (이름, 경로, 아이콘)
│
└── shared/                 # 순수 재사용 코드 (도메인 무관)
    ├── ui/                 # 원자 컴포넌트
    │   ├── Button/
    │   ├── Input/
    │   ├── Modal/
    │   ├── Table/
    │   ├── Form/
    │   ├── Badge/
    │   └── Pagination/
    ├── lib/                # 유틸리티 함수
    │   ├── date.ts
    │   ├── format.ts
    │   └── validators.ts
    ├── api/                # Mock API 클라이언트
    │   ├── client.ts       # Axios 인스턴스 (인터셉터 포함)
    │   └── mock/           # MSW 핸들러
    ├── constants/          # 공통 상수
    └── types/              # 공통 타입 정의
```

---

## 컴포넌트 경계 (Component Boundaries)

### 레이어 의존성 규칙 (FSD 핵심)

```
app → pages → widgets → features → entities → shared
```

**규칙: 상위 레이어만 하위 레이어를 import할 수 있다. 역방향 금지.**

| 레이어 | 담당 | 통신 방향 |
|--------|------|-----------|
| `app` | 라우터, 프로바이더, 글로벌 초기화 | pages 아래 모두 사용 가능 |
| `pages` | 서브시스템 진입점, 페이지 조합 | widgets, features, entities, shared |
| `widgets` | 여러 페이지에서 재사용하는 복합 UI | features, entities, shared |
| `features` | 사용자 인터랙션 단위 비즈니스 로직 | entities, shared |
| `entities` | 도메인 모델, 기본 UI | shared만 |
| `shared` | UI 원자, 유틸, API 클라이언트 | 외부 라이브러리만 |

**같은 레이어 내 슬라이스 간 import 금지.** (예: `pages/overtime`이 `pages/portal`을 import하는 것 불가)

---

## 라우팅 아키텍처

### React Router v7 + Lazy Loading

```typescript
// src/app/router.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { lazy, Suspense } from 'react'

// 즉시 로드: 인증 관련 (항상 필요)
import LoginPage from '@/pages/login'
import PortalPage from '@/pages/portal'

// 서브시스템: 필요할 때만 로드
const OvertimePage = lazy(() => import('@/pages/overtime'))
const SurveyPage = lazy(() => import('@/pages/survey'))
const PerformancePage = lazy(() => import('@/pages/performance'))
// ... 나머지 15개 서브시스템

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <PortalLayout />,          // 세션 가드 포함
    children: [
      { index: true, element: <PortalPage /> },
      {
        path: 'overtime/*',
        element: (
          <Suspense fallback={<SubsystemLoadingSpinner />}>
            <OvertimePage />
          </Suspense>
        ),
      },
      // ... 나머지 서브시스템
    ],
  },
])
```

### 레이아웃 분리

```
PortalLayout (메인 포탈 진입 후 세션 공유 레이아웃)
├── GlobalHeader (로그아웃, 사용자 정보)
├── Outlet (서브시스템 렌더링 위치)
└── SessionGuard (세션 만료 감지)

SubsystemLayout (서브시스템 내부 레이아웃)
├── SubsystemHeader (서브시스템 제목, 뒤로가기/Exit 버튼)
├── SubsystemSidebar (서브시스템 내 메뉴)
└── ContentArea
```

**Exit 버튼 동작**: `navigate('/')` → 메인 포탈로 이동
**창닫기(beforeunload)**: 메인 포탈 자체를 탭으로 유지하므로 별도 처리 불필요

---

## 상태 관리 아키텍처

### Zustand - 전역 상태

```
AuthStore (Zustand)
├── user: User | null
├── isAuthenticated: boolean
├── sessionExpiry: Date
├── login(credentials) → void
├── logout() → void
└── refreshSession() → void

PermissionStore (Zustand)
├── permissions: Record<subsystemId, string[]>
├── hasPermission(subsystem, action) → boolean
└── loadPermissions(userId) → void
```

**인증 흐름:**
1. 로그인 → `AuthStore.login()` 호출 → 사용자 정보 + 만료시간 저장
2. `SessionGuard` 컴포넌트가 1분 간격으로 만료시간 체크
3. 만료 감지 → `navigate('/login', { replace: true })`
4. Axios 인터셉터가 401 응답 시 동일 처리

**서브시스템 로컬 상태:** React `useState` / `useReducer` 사용. Zustand는 글로벌 상태에만 사용.

### TanStack Query (서버 상태)

서버에서 오는 데이터(목록, 상세)는 TanStack Query로 관리.

```typescript
// Mock API 연동 시에도 동일 패턴
const { data: overtime } = useQuery({
  queryKey: ['overtime', 'list', filters],
  queryFn: () => overtimeApi.getList(filters),
})
```

---

## 인증/세션 아키텍처 (Mock MVP)

### Mock 인증 구현

```typescript
// src/shared/api/mock/auth.ts (MSW 핸들러)
// POST /api/auth/login
// - 아이디/비밀번호 고정값 검증 (예: admin/1234)
// - JWT 형식의 Mock 토큰 반환
// - 만료시간 30분 설정

// GET /api/auth/me
// - Authorization 헤더 검증
// - 사용자 정보 반환
```

### 세션 관리 패턴

```typescript
// src/widgets/session-guard/SessionGuard.tsx
const SESSION_CHECK_INTERVAL = 60_000 // 1분

export function SessionGuard({ children }) {
  const { sessionExpiry, logout } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() > sessionExpiry.getTime()) {
        logout()
        navigate('/login', { replace: true })
      }
    }, SESSION_CHECK_INTERVAL)
    return () => clearInterval(interval)
  }, [sessionExpiry])

  return children
}
```

### 보호된 라우트

```typescript
// src/app/router.tsx
{
  path: '/',
  element: <RequireAuth><PortalLayout /></RequireAuth>,
  children: [...subsystemRoutes]
}
```

`RequireAuth`: `isAuthenticated`가 false이면 `/login`으로 리다이렉트.

---

## 공통 모듈 재사용 패턴

### 공통게시판 (Bulletin Board) 재사용

게시판은 18개 서브시스템 중 다수에서 사용된다. 설정 기반 컴포넌트로 구현.

```typescript
// src/widgets/bulletin-board/BulletinBoard.tsx
interface BulletinBoardConfig {
  boardId: string
  title: string
  allowAttachment?: boolean
  allowCategory?: boolean
  allowAnonymous?: boolean
  requiredPermission?: string
}

// 각 서브시스템에서:
<BulletinBoard
  config={{ boardId: 'overtime-notice', title: '초과근무 공지', allowAttachment: true }}
/>
```

### 결재 위젯 재사용

```typescript
// src/widgets/approval-flow/ApprovalFlow.tsx
interface ApprovalFlowProps {
  documentType: string    // 'overtime-request' | 'survey-result' | ...
  documentId: string
  onApprove?: () => void
  onReject?: () => void
}
```

### 권한 체크 패턴

```typescript
// src/shared/lib/permission.ts
export function usePermission(subsystem: string, action: string) {
  const { hasPermission } = usePermissionStore()
  return hasPermission(subsystem, action)
}

// 사용:
const canWrite = usePermission('overtime', 'write')
```

---

## 데이터 흐름

```
[사용자 액션]
     ↓
[Page 컴포넌트] → useQuery/useMutation (TanStack Query)
     ↓                    ↓
[Feature Hook]    [shared/api/client.ts]
     ↓                    ↓
[Zustand Store]    [Mock API (MSW)]
     ↓
[UI 업데이트]
```

**단방향 데이터 흐름 원칙:**
- UI → Action → Store/Query → UI 업데이트
- 서브시스템 간 직접 데이터 공유 없음 (공통 Zustand Store 경유)

---

## 빌드 최적화

### Vite manualChunks 전략

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 공통 벤더 (자주 변경 안됨 → 캐시 효율)
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-state': ['zustand', '@tanstack/react-query'],
          'vendor-ui': ['clsx', 'tailwind-merge'],

          // 서브시스템별 청크 (lazy import와 자동 분리되지만 명시 가능)
          // React.lazy()로 import하면 Vite가 자동으로 별도 청크 생성
        }
      }
    },
    chunkSizeWarningLimit: 600, // 기본 500kb → 600kb로 조정
  }
})
```

### 초기 번들 크기 목표

| 청크 | 목표 크기 |
|------|----------|
| 초기 진입 (login + portal) | < 200kb |
| 공통 vendor | < 300kb |
| 서브시스템별 청크 | < 150kb 각 |

React.lazy()로 서브시스템을 분리하면 초기 로딩 시 login + portal 화면만 로드되어 사용자 첫 진입 속도가 최적화된다.

---

## 빌드 순서 (개발 의존성)

```
1. shared/ui + shared/lib + shared/types
   ↓ (모든 레이어가 의존)

2. shared/api (Mock client + MSW 핸들러 기반)
   ↓

3. entities (도메인 타입 + 기본 UI)
   ↓

4. features/auth + features/session (인증 먼저)
   ↓

5. widgets/session-guard + app/router (라우팅 기반)
   ↓

6. pages/login + pages/portal (메인 포탈 완성)
   ↓

7. features/board + features/approval + features/permission (공통 기능)
   ↓

8. widgets/bulletin-board + widgets/approval-flow (공통 위젯)
   ↓

9. pages/* (서브시스템 - 복잡도 낮은 것부터)
```

---

## 대안 고려 및 기각 이유

| 방식 | 기각 이유 |
|------|----------|
| Module Federation (마이크로프론트엔드) | 단일 팀, 단일 배포, MVP 단계에서 오버엔지니어링. 빌드 설정 복잡도 대비 이득 없음. |
| Turborepo 모노레포 | 여러 독립 앱이 아닌 단일 앱 구조. 패키지 분리 필요성 없음. |
| Redux Toolkit | Zustand 대비 보일러플레이트 과다. 18개 서브시스템 × 다수 상태 = 관리 부담. |
| React Context (상태관리) | 잦은 리렌더링 위험. 세션/권한 같은 글로벌 상태에 부적합. |
| 파일별 타입 분리 (types/ 폴더만) | FSD 방식으로 도메인별 응집도가 더 높아 유지보수성 우위. |

---

## 확장성 고려

| 시점 | 대응 |
|------|------|
| MVP 완료 후 백엔드 연동 | `shared/api/mock/`를 실제 API 호출로 교체. 인터페이스 동일. |
| 서브시스템 추가 | `pages/` 슬라이스 추가 + `app/router.tsx`에 경로 추가. 기존 코드 무수정. |
| 팀 분리 시 | FSD 슬라이스가 이미 명확히 분리되어 있어 담당 레이어/슬라이스 할당 용이. |
| 마이크로프론트엔드 전환 필요 시 | FSD 슬라이스 경계가 Module Federation remote 경계와 자연스럽게 매핑됨. |

---

## Sources

- [Feature-Sliced Design 공식 문서](https://feature-sliced.design/)
- [React Router v7 Lazy Loading - Robin Wieruch](https://www.robinwieruch.de/react-router-lazy-loading/)
- [Faster Lazy Loading in React Router v7.5+](https://remix.run/blog/faster-lazy-loading)
- [State Management in 2025: When to Use Zustand](https://dev.to/hijazi313/state-management-in-2025-when-to-use-context-redux-zustand-or-jotai-2d2k)
- [Vite Code Splitting with manualChunks](https://sambitsahoo.com/blog/vite-code-splitting-that-works.html)
- [Monorepo Architecture 2025 - Feature-Sliced Design Blog](https://feature-sliced.design/blog/frontend-monorepo-explained)
- [Building Scalable Frontend Monorepo with Turborepo](https://dev.to/harrytranswe/building-a-scalable-frontend-monorepo-with-turborepo-vite-tailwindcss-v4-react-19-tanstack-21ko)

---

## GAP 수정 반영 (2026-04-07)

### 공통 컴포넌트 아키텍처 패턴 강화

GAP 분석(req_spec vs 구현 비교)에 따라 `shared/ui` 레이어의 공통 컴포넌트가 확장되었다. 이는 FSD 아키텍처의 **shared 레이어가 표준 UI 계약을 정의하고, 상위 레이어(pages)가 이를 소비하는** 패턴을 더욱 강화한다.

### 변경된 아키텍처 요소

```
shared/
  ui/
    DataTable/       -- navy-bordered-table CSS 자동 적용 (R5 규칙)
    SearchForm/      -- search-form-container 100px wrapper (R2 규칙)
    CrudForm/        -- file/dateRange/checkbox 필드 타입 추가 (R1 규칙)
    DetailModal/     -- render(value, record) 시그니처 확장
  lib/
    military.ts      -- [신규] formatMilitaryPerson(), militaryPersonColumn() (R6 규칙)
  styles/
    index.css        -- 글로벌 CSS (navy 테이블 보더, 검색 폼 컨테이너)
```

### 아키텍처 원칙 준수

1. **단일 변경점**: 공통 컴포넌트 수정 1회로 18개 서브시스템 전체에 일괄 적용. 서브시스템별 개별 CSS 수정 불필요.
2. **하위 호환**: 기존 API(DataTable columns, SearchForm fields, CrudForm fieldType) 유지. 새 기능은 선택적(opt-in).
3. **FSD 레이어 규칙 준수**: `shared/lib/military.ts`는 도메인 독립적 유틸리티로 shared 레이어에 배치. 군 도메인 엔티티는 entities 레이어에 유지.

### GAP 규칙 6개의 아키텍처 매핑

| 규칙 | 아키텍처 레이어 | 구현 위치 |
|------|----------------|----------|
| R1 (입력값 컬럼) | shared/ui | CrudForm fieldType 확장 |
| R2 (검색영역 100px) | shared/ui + shared/styles | SearchForm wrapper + index.css |
| R3 (규칙/예외사항) | pages/* | 각 서브시스템 페이지에서 UI 로직 구현 |
| R4 (관리자 메뉴) | pages/* | 서브시스템별 AdminPage 컴포넌트 |
| R5 (테이블 보더) | shared/ui + shared/styles | DataTable CSS + index.css |
| R6 (군번/계급/성명) | shared/lib | military.ts 헬퍼 |
