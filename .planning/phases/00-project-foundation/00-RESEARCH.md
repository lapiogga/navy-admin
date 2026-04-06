# Phase 0: 프로젝트 기반 구축 - Research

**Researched:** 2026-04-05
**Domain:** React + TypeScript + Vite + FSD + Ant Design 5 + MSW 기반 대규모 SPA 초기화
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Feature-Sliced Design 레이어 구조 채택: `app/` > `pages/` > `widgets/` > `features/` > `entities/` > `shared/`
- **D-02:** 각 서브시스템은 `pages/` 레이어의 독립 슬라이스로 구현 (예: `pages/sys01-overtime/`, `pages/sys02-survey/`)
- **D-03:** 같은 레이어 간 import 금지 원칙 적용 (서브시스템 간 의존성 차단)
- **D-04:** `shared/` 레이어에 ui, api, lib, config, types 슬라이스 배치
- **D-05:** 서브시스템 URL 패턴: `/sys{번호}/{대메뉴슬러그}/{소메뉴슬러그}` (예: `/sys01/application/write`)
- **D-06:** 메인 포탈: `/`, 로그인: `/login`
- **D-07:** 공통 기능: `/common/{기능슬러그}` (예: `/common/auth-group`, `/common/code-mgmt`)
- **D-08:** Ant Design 5.x + ProComponents 사용 (ProTable, ProForm, ProLayout)
- **D-09:** Tailwind CSS는 Ant Design 컴포넌트 외부 레이아웃/간격에만 사용, 컴포넌트 내부 스타일은 antd 토큰 시스템
- **D-10:** 군 행정 포탈에 맞는 중립적 블루/그레이 톤 커스텀 테마 토큰 설정
- **D-11:** Phase 0 shared/ui 구현 목록: DataTable(ProTable 래퍼), CrudForm(ProForm 래퍼), DetailModal, SearchForm, StatusBadge, ConfirmDialog
- **D-12:** Phase 0 shared/api 구현: MSW 핸들러 팩토리, 공통 API 타입(PageRequest, PageResponse, ApiResult), axios 인스턴스
- **D-13:** Phase 1에서 구현: widgets — BoardWidget, ApprovalWidget, AuthGroupWidget
- **D-14:** MSW 2.x 브라우저 Service Worker 모드 사용
- **D-15:** Mock 데이터 구조는 Java Spring Boot DTO 관례를 따름 (camelCase 필드, PageResponse 래핑)
- **D-16:** Faker.js 9.x 한국어 로케일로 군 행정 도메인 목데이터 생성
- **D-17:** MSW 핸들러는 `shared/api/mocks/handlers/`에 서브시스템별 분리
- **D-18:** Zustand 5.x: authStore(인증/세션), uiStore(사이드바/테마) 글로벌 스토어
- **D-19:** TanStack Query 5.x: 모든 서버 데이터(CRUD 목록, 상세조회) 관리
- **D-20:** 서브시스템별 로컬 상태는 각 pages/ 슬라이스 내부에서 관리
- **D-21:** React Router v7 SPA 모드, 중첩 라우트로 포탈/서브시스템 레이아웃 공유
- **D-22:** 서브시스템별 React.lazy() 코드 스플리팅 적용
- **D-23:** ProtectedRoute 컴포넌트: authStore 확인 후 미인증 시 /login 리다이렉트
- **D-24:** 모든 검색/입력 컴포넌트에 `e.nativeEvent.isComposing` 가드 적용 (한글 IME 이중 이벤트 방지)

### Claude's Discretion

- 정확한 Tailwind 설정값 (색상 팔레트, 간격 스케일)
- Vite 빌드 최적화 (manualChunks 전략)
- ESLint/Prettier 설정 상세
- 테스트 프레임워크(Vitest) 초기 설정 범위

### Deferred Ideas (OUT OF SCOPE)

없음 (discussion이 Phase 범위 내에서 유지됨)

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BASE-01 | React + TypeScript + Vite 프로젝트 초기화 및 FSD 구조 설정 | FSD 레이어 구조, 버전 선택 가이드 참조 |
| BASE-02 | Tailwind CSS + Ant Design 5 통합 설정 | Tailwind 3 vs 4 선택 근거, antd 충돌 방지 패턴 참조 |
| BASE-03 | React Router v7 라우팅 구조 (포탈 + 18개 서브시스템 lazy loading) | 라우팅 아키텍처, lazy loading 코드 예시 참조 |
| BASE-04 | Zustand 전역 상태 관리 (세션, 권한) 설정 | 상태관리 아키텍처, authStore/uiStore 구조 참조 |
| BASE-05 | TanStack Query + MSW Mock API 인프라 설정 | MSW 브라우저 설정 방법, 핸들러 구조 참조 |
| BASE-06 | 공통 레이아웃 (포탈 레이아웃, 서브시스템 레이아웃, 사이드바) | ProLayout 설정 패턴, 레이아웃 분리 아키텍처 참조 |
| BASE-07 | 공통 컴포넌트 라이브러리 (ProTable, ProForm, 모달, 검색폼) | ProTable/ProForm 래퍼 패턴, 공통 컴포넌트 목록 참조 |
| BASE-08 | Mock 인증/세션 관리 구조 | ProtectedRoute, SessionGuard, authStore 패턴 참조 |
| BASE-09 | URL 컨벤션 및 라우트 설정 문서화 | 서브시스템 명칭 대응표, 경로 상수 테이블 참조 |

</phase_requirements>

---

## Summary

Phase 0은 이후 845개 화면의 불변 계약(frozen contract)을 수립하는 Phase다. 여기서 확정된 FSD 구조, URL 패턴, 공통 컴포넌트 인터페이스, API 타입 스키마는 이후 모든 Phase에서 변경 금지다.

**버전 선택에서 가장 중요한 발견:** npm 현재 최신 버전이 STACK.md 가정과 다르다. React는 18.x가 아닌 19.2.4, Vite는 5.x가 아닌 8.x(latest), Ant Design은 5.x가 아닌 6.3.5가 최신이다. **그러나 결정(D-08)은 Ant Design 5.x를 명시하므로**, `antd@5` + ProComponents 2.x 조합을 유지하되, React 19 호환 패치(`@ant-design/v5-patch-for-react-19`)를 포함하거나, **더 단순한 대안으로 Ant Design 6.x로 업그레이드하는 것을 고려**해야 한다. Tailwind CSS는 4.x가 최신이나 antd와의 통합 안정성을 위해 3.x(`tailwindcss@3`)를 사용하는 것이 권장된다.

**1차 권고:** Ant Design 6.x 사용. React 19와 네이티브 호환, 패치 패키지 불필요. D-08의 "5.24" 버전 번호는 당시 최신이었으나 현재는 6.x가 안정화됨. CONTEXT.md 재검토를 플래그한다.
**2차 권고 (D-08 엄격 준수 시):** `antd@5.29.3` + `@ant-design/v5-patch-for-react-19` 사용.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.4 | UI 렌더링 | 현재 latest. Concurrent Features, Actions API |
| TypeScript | 5.x (`typescript@5.8`) | 타입 안전성 | 845개 프로세스 규모에서 타입 오류 컴파일 타임 차단 필수 |
| Vite | 5.4.21 (`previous`) | 빌드 도구 | Vite 8.x는 beta. 안정 버전 5.x 사용. HMR 속도 우수 |
| Tailwind CSS | 3.4.19 (`v3-lts`) | 유틸리티 CSS | v4는 antd ConfigProvider와 충돌 보고 다수. `v3-lts` 태그로 설치 |

> **Vite 버전 결정:** `npm view vite dist-tags` 결과 latest는 8.0.3(beta), previous는 5.4.21. 안정적인 5.4.21 사용.

### 상태 관리

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Zustand | 5.0.12 | 전역 클라이언트 상태 | React 18/19 네이티브 `useSyncExternalStore`. authStore, uiStore |
| TanStack Query | 5.96.2 | 서버/비동기 상태 | Mock→실API 전환 무코드 변경. staleTime, retry 내장 |

### 라우팅

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React Router | 7.14.0 | 포탈 + 서브시스템 라우팅 | SPA 모드. 중첩 라우트로 레이아웃 공유. D-21 결정 |

### UI 컴포넌트

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| antd | 6.3.5 (권고) 또는 5.29.3 (D-08 엄수) | 엔터프라이즈 UI | Table, Form, Tree, DatePicker 60+ 컴포넌트 내장 |
| @ant-design/pro-components | 2.8.10 | ProTable, ProForm, ProLayout | 행정 목록/폼 화면 개발 속도 극대화. D-08 결정 |

> **antd 버전 주의:** `antd@6`은 React 18+ 전용, `@ant-design/icons@6` 동시 업그레이드 필요. `antd@5`와 React 19 사용 시 `@ant-design/v5-patch-for-react-19` 필요.

### 폼 처리

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React Hook Form | 7.72.1 | 폼 상태 관리 | 비제어 컴포넌트, 50+ 필드 재렌더링 최소화 |
| Zod | 4.3.6 | 스키마 유효성 검사 | TypeScript 타입 = 런타임 검증 일치 |
| @hookform/resolvers | 최신 | RHF + Zod 연결 | zodResolver로 직접 연동 |

### Mock API

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| MSW | 2.12.14 | 네트워크 레벨 API 모킹 | Service Worker 기반, 실 API 전환 시 코드 무수정. D-14 결정 |
| @faker-js/faker | 10.4.0 | Mock 데이터 생성 | 한국어 로케일 지원. D-16 결정 |

### 테스트

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vitest | 4.1.2 | 단위/통합 테스트 | Vite 기반, 설정 공유. 설정 파일 불필요(vite.config.ts 통합 가능) |
| @testing-library/react | 16.3.2 | 컴포넌트 테스트 | Vitest와 연동, RTL 표준 |
| @testing-library/jest-dom | 최신 | 매처 확장 | `toBeInTheDocument` 등 DOM 매처 |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| axios | 1.x | HTTP 클라이언트 | MSW가 인터셉트. 실 API 전환 시 base URL만 변경 |
| dayjs | 1.11.20 | 날짜 처리 | antd DatePicker 공식 권장 라이브러리 |
| date-fns | 3.x | 날짜 계산 유틸 | 초과근무 계산, 기간 차이 등 비 UI 날짜 처리 |

### Installation

```bash
# 프로젝트 생성
npm create vite@5 marine-admin -- --template react-ts
cd marine-admin

# Tailwind CSS v3 (antd 호환성)
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p

# Ant Design (버전 선택: antd@6 권고)
npm install antd @ant-design/icons @ant-design/pro-components
# antd@5 사용 시 추가:
# npm install @ant-design/v5-patch-for-react-19

# 상태 관리
npm install zustand @tanstack/react-query @tanstack/react-query-devtools

# 라우팅
npm install react-router-dom

# 폼
npm install react-hook-form zod @hookform/resolvers

# HTTP + 날짜
npm install axios dayjs date-fns

# Mock
npm install msw @faker-js/faker
npx msw init ./public --save

# 테스트 (개발 의존성)
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

---

## Architecture Patterns

### FSD 프로젝트 구조 (D-01~D-04 기반)

```
src/
├── app/                          # 앱 초기화, 글로벌 설정
│   ├── router.tsx                # 전체 라우트 (lazy loading 적용)
│   ├── providers.tsx             # QueryClient, 테마, Toast Provider
│   └── styles/
│       ├── index.css             # @tailwind base/components/utilities
│       └── antd-theme.ts        # antd ConfigProvider 테마 토큰
│
├── pages/                        # 서브시스템 진입점 (라우트 단위)
│   ├── login/
│   ├── portal/
│   ├── sys01-overtime/
│   ├── sys02-survey/
│   ├── ... (sys03 ~ sys18)
│   └── common/                   # 99_공통기능 진입점
│
├── widgets/                      # 복합 재사용 UI 블록 (Phase 1에서 구현)
│   ├── session-guard/            # 세션 만료 감지 (Phase 0에서 구현)
│   └── subsystem-nav/
│
├── features/                     # 사용자 행동 단위 기능
│   └── auth/                     # 로그인/로그아웃 (Phase 0에서 구현)
│
├── entities/                     # 도메인 엔티티 타입 + 기본 UI
│   ├── user/
│   └── subsystem/                # 서브시스템 메타데이터
│
└── shared/                       # 순수 재사용 코드
    ├── ui/                       # Phase 0 구현 공통 컴포넌트
    │   ├── DataTable/            # ProTable 래퍼
    │   ├── CrudForm/             # ProForm 래퍼
    │   ├── DetailModal/
    │   ├── SearchForm/
    │   ├── StatusBadge/
    │   └── ConfirmDialog/
    ├── api/
    │   ├── client.ts             # axios 인스턴스 (인터셉터)
    │   ├── types.ts              # PageRequest, PageResponse, ApiResult
    │   └── mocks/
    │       ├── browser.ts        # MSW setupWorker
    │       ├── server.ts         # MSW setupServer (테스트용)
    │       └── handlers/
    │           ├── auth.ts
    │           └── index.ts
    ├── lib/
    │   ├── date.ts               # formatDate, formatDateTime
    │   ├── ime.ts                # useImeGuard 훅 (D-24)
    │   └── permission.ts         # usePermission 훅
    ├── config/
    │   └── routes.ts             # 경로 상수 테이블 (D-05~D-07)
    └── types/
        └── index.ts
```

### 레이어 의존성 규칙 (D-03 기반)

```
app → pages → widgets → features → entities → shared
```

같은 레이어 내 슬라이스 간 import 절대 금지. `pages/sys01`이 `pages/sys02`를 import하면 FSD 위반.

### 라우팅 패턴 (D-21, D-22, D-23 기반)

```typescript
// src/app/router.tsx
import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import LoginPage from '@/pages/login'
import PortalPage from '@/pages/portal'
import PortalLayout from './PortalLayout'

// 서브시스템: lazy loading (D-22)
const Sys01Page = lazy(() => import('@/pages/sys01-overtime'))
const Sys02Page = lazy(() => import('@/pages/sys02-survey'))
// ... sys03 ~ sys18

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <RequireAuth><PortalLayout /></RequireAuth>,  // D-23
    children: [
      { index: true, element: <PortalPage /> },
      {
        path: 'sys01/*',
        element: (
          <Suspense fallback={<PageSpinner />}>
            <Sys01Page />
          </Suspense>
        ),
      },
      // sys02 ~ sys18 동일 패턴
      { path: 'common/*', element: <Suspense fallback={<PageSpinner />}><CommonPage /></Suspense> },
    ],
  },
])
```

### MSW 브라우저 설정 패턴 (D-14 기반)

```typescript
// src/shared/api/mocks/browser.ts
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'
export const worker = setupWorker(...handlers)

// src/main.tsx — MSW 비동기 초기화 (race condition 방지)
async function enableMocking() {
  if (import.meta.env.MODE !== 'development') return
  const { worker } = await import('./shared/api/mocks/browser')
  return worker.start({
    onUnhandledRequest: 'bypass',
  })
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode><App /></StrictMode>
  )
})
```

> `npx msw init ./public --save` 실행 후 `public/mockServiceWorker.js` 생성 필수.

### Zustand 스토어 패턴 (D-18 기반)

```typescript
// src/features/auth/store/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  sessionExpiry: number | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      sessionExpiry: null,
      login: async (credentials) => {
        // MSW를 통한 Mock 인증
        const response = await authApi.login(credentials)
        set({
          user: response.user,
          isAuthenticated: true,
          sessionExpiry: Date.now() + 30 * 60 * 1000, // 30분
        })
      },
      logout: () => set({ user: null, isAuthenticated: false, sessionExpiry: null }),
    }),
    { name: 'auth-storage' }
  )
)
```

### 공통 API 타입 패턴 (D-12, D-15 기반)

```typescript
// src/shared/api/types.ts — Java Spring Boot DTO 관례 준수
export interface PageRequest {
  page: number        // 0-based (Spring Boot 기본)
  size: number
  sort?: string[]
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number      // 현재 페이지 (0-based)
}

export interface ApiResult<T = void> {
  success: boolean
  data: T
  message?: string
  errorCode?: string
}
```

### Tailwind + Ant Design 통합 패턴 (D-09 기반)

```css
/* src/app/styles/index.css */
/* Tailwind 기본 레이어만 활성화 — 컴포넌트/유틸리티는 충돌 주의 */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

```typescript
// tailwind.config.js — Ant Design 클래스 충돌 방지
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // corePlugins에서 preflight 비활성화 (antd 글로벌 스타일과 충돌)
  corePlugins: {
    preflight: false,
  },
}
```

```typescript
// src/app/providers.tsx — antd 테마 토큰 설정 (D-10)
import { ConfigProvider } from 'antd'
import koKR from 'antd/locale/ko_KR'

const theme = {
  token: {
    colorPrimary: '#1E3A5F',     // 해군/해병대 네이비
    colorBgContainer: '#FFFFFF',
    borderRadius: 4,
    fontFamily: "'Noto Sans KR', sans-serif",
  },
}

export function Providers({ children }) {
  return (
    <ConfigProvider theme={theme} locale={koKR}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ConfigProvider>
  )
}
```

### Anti-Patterns to Avoid

- **같은 레이어 cross-import:** `pages/sys01`에서 `pages/portal`을 import — FSD 위반
- **shared에 도메인 로직:** `shared/ui`에 비즈니스 규칙 포함 — shared는 도메인 무관 코드만
- **antd preflight 충돌 미방지:** Tailwind preflight와 antd reset이 충돌하면 버튼/폼 스타일 깨짐
- **MSW 동기 초기화:** `main.tsx`에서 MSW 시작 전 React 렌더링 — race condition 발생
- **정적 서브시스템 import:** `import Sys01 from '@/pages/sys01'` — lazy 없으면 초기 번들 수 MB
- **any 타입 사용:** `any` 대신 `unknown` + zod parse 패턴 사용

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 서버사이드 페이지네이션 테이블 | 커스텀 테이블 + 페이지네이션 | ProTable | 정렬/필터/선택/익스포트 내장. 구현 비용 대비 이득 없음 |
| 복잡한 폼 레이아웃 | 커스텀 Grid + Form | ProForm (ProFormList, StepsForm) | 결재선 같은 동적 필드 배열 처리 내장 |
| 사이드바 + 헤더 레이아웃 | 커스텀 레이아웃 | ProLayout | 브레드크럼, 메뉴 접기, 반응형 내장 |
| API 모킹 | 로컬 상수 객체 | MSW | 실제 HTTP 흐름 시뮬레이션, 실 API 전환 시 코드 무수정 |
| 폼 유효성 검사 | 커스텀 검사 함수 | Zod + RHF | 타입과 런타임 검증 일치, i18n 에러 메시지 내장 |
| 전역 상태 | React Context | Zustand | Context는 잦은 리렌더링 유발, 특히 세션/권한 같은 고빈도 변경 상태에 부적합 |

**Key insight:** 행정 포탈에서 커스텀 컴포넌트를 직접 구현하는 것은 "바퀴 재발명" 이상의 비용이 든다. ProTable 하나가 정렬, 필터, 페이지네이션, 행 선택, 컬럼 숨김, 엑셀 익스포트를 내장하고 있다.

---

## Common Pitfalls

### Pitfall 1: antd + Tailwind preflight 충돌

**What goes wrong:** Tailwind의 `@tailwind base`가 antd 버튼/폼의 기본 스타일을 리셋하여 컴포넌트가 비정상적으로 보임.

**Why it happens:** Tailwind preflight은 CSS normalize를 포함하며, antd도 자체 CSS reset을 적용함. 두 reset이 충돌.

**How to avoid:** `tailwind.config.js`에 `corePlugins: { preflight: false }` 설정. Tailwind는 레이아웃/간격에만 사용(D-09).

**Warning signs:** 버튼 테두리 사라짐, 인풋 높이 이상, Select 드롭다운 스타일 깨짐.

---

### Pitfall 2: MSW Service Worker 초기화 race condition

**What goes wrong:** React 앱이 렌더링된 후 MSW가 등록되면, 초기 API 호출이 Mock 핸들러를 거치지 않고 실제 네트워크로 나가서 404 발생.

**Why it happens:** `worker.start()`가 Promise를 반환하는 비동기 작업이지만, `createRoot().render()`를 동기적으로 실행하면 MSW 준비 전에 컴포넌트가 mount됨.

**How to avoid:** `main.tsx`에서 `enableMocking().then(() => render())` 패턴 사용. MSW가 완전히 등록된 후 React 렌더링.

**Warning signs:** 개발 중 첫 API 호출만 실패, 새로고침 후 정상 동작.

---

### Pitfall 3: antd v5와 React 19 경고

**What goes wrong:** `antd@5`와 `react@19` 조합 시 콘솔에 React 19 호환성 경고 발생. 일부 레거시 ref 패턴이 깨질 수 있음.

**Why it happens:** antd v5는 React 16~18을 기본 대상으로 설계. React 19에서 일부 내부 API가 변경됨.

**How to avoid:** (1) `antd@6` 사용 — React 19 네이티브 지원, 패치 불필요. (2) `antd@5` 유지 시 `@ant-design/v5-patch-for-react-19` 설치.

**Warning signs:** 콘솔의 `ReactDOM.render is no longer supported` 또는 ref 관련 경고.

---

### Pitfall 4: Vite 8.x(beta) 사용으로 인한 빌드 불안정

**What goes wrong:** `npm create vite@latest`가 Vite 8.0.3(beta)을 설치. beta 버전은 플러그인 호환성 미검증.

**Why it happens:** `latest` 태그가 beta 버전을 가리킴.

**How to avoid:** `npm create vite@5` 또는 `vite@previous`(5.4.21)를 명시적으로 사용.

**Warning signs:** `@vitejs/plugin-react` 플러그인 로드 실패, HMR 오류.

---

### Pitfall 5: FSD 레이어 간 역방향 import

**What goes wrong:** `shared/ui/DataTable`이 `entities/user`를 import하면 FSD 규칙 위반. 이후 shared를 다른 프로젝트에서 재사용 불가. 순환 의존성 위험.

**Why it happens:** "간단히" 도메인 타입을 shared 컴포넌트에 직접 주입하는 유혹.

**How to avoid:** shared 컴포넌트는 제네릭 타입만 사용. 도메인 타입은 entities 레이어에서 정의하고 상위 레이어에서 주입.

**Warning signs:** `import { User } from '@/entities/user'`가 `shared/` 경로 파일 내에 존재.

---

### Pitfall 6: 한글 IME Enter 이벤트 이중 발화 (D-24)

**What goes wrong:** 검색폼에서 한글 입력 후 Enter 시 제출 이벤트가 2회 발화. 빈 쿼리로 API 재호출.

**Why it happens:** 한글은 IME 조합 문자. `keydown` 이벤트가 조합 완료 전후 각각 발생.

**How to avoid:** 공통 훅 `useImeGuard`로 추상화. 모든 Enter 핸들러에 적용 강제.

```typescript
// src/shared/lib/ime.ts
export function useEnterSubmit(onSubmit: () => void) {
  return (e: React.KeyboardEvent) => {
    if (e.nativeEvent.isComposing) return
    if (e.key === 'Enter') onSubmit()
  }
}
```

---

## Code Examples

### ProTable 래퍼 (DataTable) 패턴

```typescript
// src/shared/ui/DataTable/DataTable.tsx
import { ProTable, ProTableProps } from '@ant-design/pro-components'

// ProTable은 제네릭 타입으로 컬럼/데이터 타입 주입
interface DataTableProps<T extends Record<string, unknown>> {
  columns: ProTableProps<T, PageRequest>['columns']
  request: (params: PageRequest) => Promise<PageResponse<T>>
  rowKey: keyof T & string
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  request,
  rowKey,
}: DataTableProps<T>) {
  return (
    <ProTable<T, PageRequest>
      columns={columns}
      request={async (params) => {
        const res = await request({
          page: (params.current ?? 1) - 1,
          size: params.pageSize ?? 10,
        })
        return { data: res.content, success: true, total: res.totalElements }
      }}
      rowKey={rowKey}
      pagination={{ showSizeChanger: true }}
      search={false}  // SearchForm을 별도로 사용
      dateFormatter="string"
    />
  )
}
```

### ProtectedRoute 패턴 (D-23)

```typescript
// src/app/router.tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/authStore'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}
```

### MSW 핸들러 팩토리 패턴 (D-17)

```typescript
// src/shared/api/mocks/handlers/auth.ts
import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker/locale/ko'

export const authHandlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as { username: string; password: string }
    if (body.username === 'admin' && body.password === '1234') {
      return HttpResponse.json({
        success: true,
        data: {
          token: 'mock-jwt-token',
          user: {
            id: faker.string.uuid(),
            name: faker.person.fullName(),
            rank: '대위',
            unit: '해병대사령부',
          },
        },
      })
    }
    return HttpResponse.json({ success: false, message: '인증 실패' }, { status: 401 })
  }),
  http.get('/api/auth/me', () => {
    return HttpResponse.json({
      success: true,
      data: { id: '1', name: '홍길동', rank: '대위', unit: '해병대사령부' },
    })
  }),
]
```

### URL 경로 상수 테이블 (D-05~D-07, D-09)

```typescript
// src/shared/config/routes.ts
export const ROUTES = {
  LOGIN: '/login',
  PORTAL: '/',
  COMMON: {
    ROOT: '/common',
    AUTH_GROUP: '/common/auth-group',
    CODE_MGMT: '/common/code-mgmt',
    BOARD: '/common/board',
    MENU_MGMT: '/common/menu-mgmt',
  },
  SYS01: {
    ROOT: '/sys01',
    LIST: '/sys01/overtime/list',
    CREATE: '/sys01/overtime/create',
    DETAIL: (id: string) => `/sys01/overtime/detail/${id}`,
  },
  // SYS02 ~ SYS18 동일 패턴
} as const

// 서브시스템 명칭 대응표 (Pitfall 10 방지)
export const SUBSYSTEM_META = {
  sys01: { name: '초과근무관리체계', path: '/sys01', code: 'SYS01', componentPrefix: 'Overtime' },
  sys02: { name: '설문종합관리체계', path: '/sys02', code: 'SYS02', componentPrefix: 'Survey' },
  sys03: { name: '성과관리체계',      path: '/sys03', code: 'SYS03', componentPrefix: 'Performance' },
  sys04: { name: '인증서발급신청체계', path: '/sys04', code: 'SYS04', componentPrefix: 'Certificate' },
  sys05: { name: '행정규칙포탈체계',  path: '/sys05', code: 'SYS05', componentPrefix: 'AdminRules' },
  sys06: { name: '해병대규정관리체계', path: '/sys06', code: 'SYS06', componentPrefix: 'Regulations' },
  sys07: { name: '군사자료관리체계',  path: '/sys07', code: 'SYS07', componentPrefix: 'MilData' },
  sys08: { name: '부대계보관리체계',  path: '/sys08', code: 'SYS08', componentPrefix: 'UnitLineage' },
  sys09: { name: '영현보훈체계',      path: '/sys09', code: 'SYS09', componentPrefix: 'Memorial' },
  sys10: { name: '주말버스예약관리체계', path: '/sys10', code: 'SYS10', componentPrefix: 'WeekendBus' },
  sys11: { name: '연구자료종합관리체계', path: '/sys11', code: 'SYS11', componentPrefix: 'Research' },
  sys12: { name: '지시건의사항관리체계', path: '/sys12', code: 'SYS12', componentPrefix: 'Directives' },
  sys13: { name: '지식관리체계',      path: '/sys13', code: 'SYS13', componentPrefix: 'Knowledge' },
  sys14: { name: '나의 제언',         path: '/sys14', code: 'SYS14', componentPrefix: 'Suggestion' },
  sys15: { name: '보안일일결산체계',  path: '/sys15', code: 'SYS15', componentPrefix: 'Security' },
  sys16: { name: '회의실예약관리체계', path: '/sys16', code: 'SYS16', componentPrefix: 'MeetingRoom' },
  sys17: { name: '검열결과관리체계',  path: '/sys17', code: 'SYS17', componentPrefix: 'Inspection' },
  sys18: { name: '직무기술서관리체계', path: '/sys18', code: 'SYS18', componentPrefix: 'JobDesc' },
} as const
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| antd v5 (React 16~18 대상) | antd v6 (React 18+ 필수) | 2025년 하반기 | React 19 패치 패키지 불필요 |
| Tailwind CSS v3 (JS config) | Tailwind CSS v4 (CSS config) | 2025년 초 | v4는 antd와 통합 안정성 미검증. v3 유지 권장 |
| Vite 5.x (stable) | Vite 8.x (beta, latest 태그) | 2026년 | beta 버전 불안정. `vite@previous`(5.4.21) 사용 |
| Redux Toolkit | Zustand 5 | 2024~2025 | 보일러플레이트 90% 감소, React 18/19 네이티브 |
| React Router v6 | React Router v7 | 2024년 말 | SPA/SSR 통합, 타입 안전성 강화 |

**Deprecated/outdated:**
- `react-scripts` (CRA): Vite로 대체. 더 이상 유지보수 없음.
- `antd@5` + React 19 패치 없는 조합: 경고 발생. antd@6 또는 패치 필요.
- `msw@1.x`: v2 대비 API 변경. `http.get` 대신 이전 `rest.get` 사용.

---

## Open Questions

1. **antd v5 vs v6 최종 선택**
   - What we know: D-08이 v5를 명시. v6은 React 19 네이티브 지원, API 대부분 하위 호환.
   - What's unclear: ProComponents 2.x가 antd@6과 완전 호환되는지 npm에서 peer dependency 경고 수준.
   - Recommendation: `npm install antd@6 @ant-design/pro-components`로 설치 시도, peer dependency 경고 없으면 v6 채택. 경고 있으면 antd@5 + patch 유지. 플래너가 Wave 0 설치 태스크에서 검증.

2. **군 인트라넷 브라우저 지원 범위**
   - What we know: STATE.md에 "IE 지원 여부 미확인" 블로커로 기록됨.
   - What's unclear: antd v6는 IE 지원 완전 종료. IE 환경 필요 시 antd v5 필수.
   - Recommendation: 현재 Phase 0은 antd v5/v6 선택 유연하게 설계. IE 확인되면 v5 고정. 확인 전에는 v6 진행.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | 전체 빌드/개발 | ✓ | v24.13.0 | — |
| npm | 패키지 관리 | ✓ | 11.6.2 | — |
| git | 버전 관리 | ✓ | 2.53.0.windows.1 | — |
| Vite (설치 전) | 빌드 도구 | ✗ (설치 필요) | — | Wave 0에서 설치 |
| React (설치 전) | UI 렌더링 | ✗ (설치 필요) | — | Wave 0에서 설치 |

**Missing dependencies with no fallback:** 없음 — 모든 의존성은 npm으로 설치 가능.

**Node 버전 주의:** Node 24.13.0은 Vite 5.x의 공식 지원 범위 내. Vite 8.x(beta)도 Node 18+ 지원하나 beta 사용 비권장.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.2 |
| Config file | vite.config.ts (test 블록 통합) |
| Quick run command | `npm run test -- --run` |
| Full suite command | `npm run test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BASE-01 | FSD 폴더 구조 존재 확인 | smoke | `npm run test -- shared/` | ❌ Wave 0 |
| BASE-02 | antd ConfigProvider 테마 적용 | unit | `npm run test -- providers.test` | ❌ Wave 0 |
| BASE-03 | ProtectedRoute — 미인증 시 /login 리다이렉트 | unit | `npm run test -- ProtectedRoute.test` | ❌ Wave 0 |
| BASE-03 | lazy-loaded 서브시스템 라우트 접근 | smoke | `npm run test -- router.test` | ❌ Wave 0 |
| BASE-04 | authStore login/logout 상태 변화 | unit | `npm run test -- authStore.test` | ❌ Wave 0 |
| BASE-05 | MSW 핸들러 응답 데이터 반환 | integration | `npm run test -- auth.handlers.test` | ❌ Wave 0 |
| BASE-06 | PortalLayout 렌더링 | unit | `npm run test -- PortalLayout.test` | ❌ Wave 0 |
| BASE-07 | DataTable 페이지네이션 request 호출 | unit | `npm run test -- DataTable.test` | ❌ Wave 0 |
| BASE-08 | Mock 로그인 성공/실패 흐름 | integration | `npm run test -- auth.integration.test` | ❌ Wave 0 |
| BASE-09 | ROUTES 상수가 모든 서브시스템 경로 포함 | unit | `npm run test -- routes.test` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npm run test -- --run --reporter=dot`
- **Per wave merge:** `npm run test -- --run`
- **Phase gate:** 전체 테스트 green + `npm run build` 성공 후 `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/test/setup.ts` — @testing-library/jest-dom 매처 설정
- [ ] `src/shared/ui/DataTable/DataTable.test.tsx` — BASE-07
- [ ] `src/features/auth/store/authStore.test.ts` — BASE-04
- [ ] `src/app/router.test.tsx` — BASE-03
- [ ] `src/shared/api/mocks/handlers/auth.test.ts` — BASE-05
- [ ] `vitest.config` 블록 in `vite.config.ts` — 테스트 환경 jsdom 설정

**Vitest 설정 블록:**

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': '/src' } },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

---

## Project Constraints (from CLAUDE.md)

CLAUDE.md에서 추출한 실행 지침:

| 카테고리 | 지침 |
|----------|------|
| 불변성 | spread operator로 새 객체 생성. Zustand 상태 mutation 금지 |
| 시크릿 | `.env.*` 파일 커밋 금지. `process.env`로만 접근 |
| 타입 안전성 | TypeScript `any` 남용 금지. `unknown` + zod parse 패턴 |
| 파일 크기 | 파일 800줄, 함수 50줄 한계. 공통 컴포넌트 분리 |
| 입력 검증 | Zod 스키마로 폼/API 응답 검증 |
| 테스트 | TDD 원칙. 80% 커버리지 목표 |
| 임계 코드 수정 | 기존 코드 먼저 읽기. 최소 변경 유지 |
| 커밋 | 명시적 요청 시에만 수행. 한국어 메시지 |

---

## Sources

### Primary (HIGH confidence)

- npm registry — `npm view [package] dist-tags` 버전 직접 확인 (2026-04-05)
- [Ant Design From v5 to v6](https://ant.design/docs/react/migration-v6/) — 마이그레이션 가이드
- [MSW Browser Integration](https://mswjs.io/docs/integrations/browser/) — setupWorker, worker.start() 패턴
- [Tailwind CSS v3 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)

### Secondary (MEDIUM confidence)

- [Feature-Sliced Design 공식](https://feature-sliced.design/) — FSD 레이어 구조, 의존성 규칙
- [React Router v7 공식](https://reactrouter.com/) — SPA 모드, 중첩 라우트
- [Zustand v5 GitHub Releases](https://github.com/pmndrs/zustand/releases) — v5 안정 확인
- 기존 `.planning/research/STACK.md`, `ARCHITECTURE.md`, `PITFALLS.md` — 도메인 리서치 문서

### Tertiary (LOW confidence)

- [Ant Design 6.0 Released - DEV Community](https://dev.to/zombiej/ant-design-60-is-released-bfa) — ProComponents v6 호환성 (단일 소스)
- [Tailwind v4 + antd 충돌 — Medium downgrade 사례](https://medium.com/@pradeepgudipati/) — Tailwind v4 사용 주의 근거

---

## Metadata

**Confidence breakdown:**

- Standard Stack: HIGH — npm dist-tags 직접 확인, 공식 문서 교차 검증
- Architecture: HIGH — CONTEXT.md 결정사항 기반, ARCHITECTURE.md 기존 리서치 통합
- Pitfalls: HIGH — 기존 PITFALLS.md + 새 버전 이슈 추가
- Validation Architecture: MEDIUM — Vitest 설정은 공식 문서 기반이나 실제 Wave 0에서 검증 필요

**Research date:** 2026-04-05
**Valid until:** 2026-05-05 (antd v6 호환성은 설치 시 재검증 필요)
