---
phase: 00-project-foundation
plan: 02
subsystem: infra
tags: [zustand, msw, react-router, prolayout, auth, session, routing]

# Dependency graph
requires:
  - "00-01 (Vite+FSD 기반, Vitest 인프라, MSW placeholder, axios 클라이언트)"
provides:
  - "Zustand authStore (persist, login/logout/checkSession, 30분 세션)"
  - "Zustand uiStore (사이드바 collapse 상태)"
  - "useSessionCheck 훅 (1분 간격 세션 만료 자동 체크)"
  - "MSW authHandlers (/api/auth/login|me|logout)"
  - "ROUTES 경로 상수 (LOGIN, PORTAL, SYS01~18, COMMON 하위)"
  - "SUBSYSTEM_META (18개 서브시스템 메타데이터)"
  - "React Router v7 createBrowserRouter (18개 lazy 라우트)"
  - "ProLayout 기반 PortalLayout (사이드바+헤더+로그아웃)"
  - "RequireAuth (미인증 리다이렉트 + useSessionCheck)"
  - "LoginPage (antd Form, admin/1234 MSW Mock 인증)"
  - "PortalPage (18개 서브시스템 카드 대시보드)"
affects:
  - "00-03 (공통 컴포넌트는 이 라우팅/레이아웃 구조 위에 배치)"
  - "phase-1 (공통 기능 화면들이 ROUTES.COMMON.* 사용)"
  - "phase-2 (메인 포탈은 PortalLayout 기반)"
  - "all-phases (모든 서브시스템이 ROUTES.SYS** 경로 상수 사용)"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Zustand persist 미들웨어: auth-storage 키로 localStorage에 세션 유지"
    - "RequireAuth 패턴: useSessionCheck() + Navigate to={ROUTES.LOGIN} 리다이렉트"
    - "createBrowserRouter + lazy + Suspense: 서브시스템 코드 스플리팅"
    - "ProLayout avatarProps.render: Dropdown 로그아웃 메뉴 주입"
    - "Providers(antd/QueryClient) 바깥에서 RouterProvider 불가 — Providers 내부에 RouterProvider 위치"

key-files:
  created:
    - marine-admin/src/entities/user/types.ts
    - marine-admin/src/entities/subsystem/types.ts
    - marine-admin/src/entities/subsystem/config.ts
    - marine-admin/src/features/auth/store/authStore.ts
    - marine-admin/src/features/auth/store/uiStore.ts
    - marine-admin/src/features/auth/store/authStore.test.ts
    - marine-admin/src/features/auth/hooks/useSessionCheck.ts
    - marine-admin/src/shared/api/mocks/handlers/auth.ts
    - marine-admin/src/shared/api/mocks/handlers/auth.test.ts
    - marine-admin/src/shared/config/routes.ts
    - marine-admin/src/app/components/RequireAuth.tsx
    - marine-admin/src/app/components/PageSpinner.tsx
    - marine-admin/src/app/layouts/PortalLayout.tsx
    - marine-admin/src/app/layouts/SubsystemLayout.tsx
    - marine-admin/src/app/router.test.tsx
  modified:
    - marine-admin/src/shared/api/mocks/handlers/index.ts
    - marine-admin/src/app/router.tsx
    - marine-admin/src/pages/login/index.tsx
    - marine-admin/src/pages/portal/index.tsx
    - marine-admin/src/App.tsx

key-decisions:
  - "ROUTES 상수를 Task 1에서 미리 생성 — useSessionCheck.ts가 ROUTES.LOGIN에 의존하므로 순서 조정 (계획 대비 Task 1에서 선행 생성)"
  - "PortalLayout의 Avatar import: unused import 경고 방지 위해 void Avatar 패턴 적용"
  - "marine-admin 내부 git 저장소: 2nd_biz outer repo 아닌 marine-admin/.git에 커밋"

requirements:
  - BASE-03
  - BASE-04
  - BASE-05
  - BASE-06
  - BASE-08
  - BASE-09

# Metrics
duration: 22min
completed: 2026-04-05
---

# Phase 00 Plan 02: 라우팅/인증/레이아웃 Summary

**Zustand authStore+uiStore(persist), MSW Mock 인증 API, React Router v7 lazy 라우팅(18개 서브시스템), ProLayout 사이드바+헤더, RequireAuth 세션 자동 체크, ROUTES/SUBSYSTEM_META 경로 상수 확립 — 전체 23개 단위 테스트 통과**

## Performance

- **Duration:** 22 min
- **Started:** 2026-04-05T01:22:00Z
- **Completed:** 2026-04-05T01:44:25Z
- **Tasks:** 2
- **Files modified:** 20

## Accomplishments

- Zustand 5 authStore: persist 미들웨어, login/logout/checkSession(세션 30분), useSessionCheck(1분 간격 자동 만료 체크)
- MSW authHandlers: /api/auth/login admin/1234 Mock, /api/auth/me, /api/auth/logout
- ROUTES 경로 상수 (하드코딩 없는 URL 관리) + SUBSYSTEM_META 18개 서브시스템 메타데이터
- React Router v7 createBrowserRouter: 18개 서브시스템 lazy 코드 스플리팅, RequireAuth 래핑
- ProLayout 기반 PortalLayout: 사이드바(18개 서브시스템 + 공통 기능 메뉴), 헤더(계급/이름/소속부대 + 로그아웃)
- LoginPage(antd Form, MSW Mock 인증), PortalPage(18개 서브시스템 카드 대시보드)
- TypeScript noEmit: 0 에러, Vitest: 23/23 테스트 통과

## Task Commits

1. **Task 1: Zustand + MSW Mock API + 세션 체크 훅 + 단위 테스트** - `2017905` (feat)
2. **Task 2: React Router 라우팅 + ProLayout 레이아웃 + RequireAuth + 로그인/포탈 화면** - `d10645e` (feat)

## Files Created/Modified

- `marine-admin/src/entities/user/types.ts` — User, LoginCredentials, LoginResponse 타입
- `marine-admin/src/entities/subsystem/types.ts` — SubsystemMeta 타입
- `marine-admin/src/entities/subsystem/config.ts` — SUBSYSTEM_META (18개 서브시스템)
- `marine-admin/src/features/auth/store/authStore.ts` — persist 미들웨어, login/logout/checkSession
- `marine-admin/src/features/auth/store/uiStore.ts` — 사이드바 collapse 상태
- `marine-admin/src/features/auth/hooks/useSessionCheck.ts` — 1분 간격 세션 만료 체크
- `marine-admin/src/shared/api/mocks/handlers/auth.ts` — MSW auth 핸들러 3개
- `marine-admin/src/shared/config/routes.ts` — ROUTES 경로 상수
- `marine-admin/src/app/router.tsx` — 18개 lazy 라우트, RequireAuth, PortalLayout
- `marine-admin/src/app/layouts/PortalLayout.tsx` — ProLayout 사이드바+헤더+로그아웃
- `marine-admin/src/app/layouts/SubsystemLayout.tsx` — PageContainer 공통 래퍼
- `marine-admin/src/app/components/RequireAuth.tsx` — 미인증 리다이렉트 + 세션 체크
- `marine-admin/src/app/components/PageSpinner.tsx` — Suspense lazy-load 스피너
- `marine-admin/src/pages/login/index.tsx` — antd Form 로그인 화면
- `marine-admin/src/pages/portal/index.tsx` — 서브시스템 카드 대시보드
- `marine-admin/src/App.tsx` — RouterProvider + Providers 아키텍처 경계

## Decisions Made

- **ROUTES를 Task 1에서 선행 생성**: useSessionCheck 훅이 ROUTES.LOGIN에 의존하므로, 플랜 순서(Task 2 생성 예정)를 조정하여 Task 1에서 먼저 생성. Task 2에서는 재스테이지.
- **marine-admin 내부 git 저장소**: `C:/Users/User/2nd_biz/marine-admin`이 독립 git 저장소임을 확인. 모든 커밋을 marine-admin/.git에 수행.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] ROUTES 상수를 Task 1에서 선행 생성**
- **Found during:** Task 1
- **Issue:** useSessionCheck.ts가 `ROUTES.LOGIN`을 import하는데, ROUTES는 Task 2에서 생성 예정이었음. Task 1 완료 시점에 TypeScript 오류 발생 방지 필요
- **Fix:** ROUTES 상수(shared/config/routes.ts)를 Task 1에서 먼저 생성. Task 2에서는 내용 확인 후 재스테이지
- **Files modified:** src/shared/config/routes.ts
- **Commit:** 2017905 (Task 1 커밋에 포함)

## Known Stubs

- `src/pages/common/index.tsx`: `return <div>공통 기능</div>` — Plan 01에서 생성된 placeholder. Phase 1에서 실제 공통 기능 화면으로 구현 예정
- `src/pages/sys01-overtime/index.tsx` ~ `src/pages/sys18-job-desc/index.tsx`: 각 서브시스템 placeholder. Phase 3~7에서 실제 화면으로 구현 예정

이 스텁들은 라우팅 구조(lazy import)가 정상 동작하기 위해 필요한 placeholder이며, 플랜 목표(네비게이션 플로우 확립)를 방해하지 않음.

## Self-Check: PASSED

- FOUND: marine-admin/src/entities/user/types.ts
- FOUND: marine-admin/src/entities/subsystem/types.ts
- FOUND: marine-admin/src/entities/subsystem/config.ts
- FOUND: marine-admin/src/features/auth/store/authStore.ts
- FOUND: marine-admin/src/features/auth/store/uiStore.ts
- FOUND: marine-admin/src/features/auth/hooks/useSessionCheck.ts
- FOUND: marine-admin/src/shared/api/mocks/handlers/auth.ts
- FOUND: marine-admin/src/shared/config/routes.ts
- FOUND: marine-admin/src/app/router.tsx
- FOUND: marine-admin/src/app/layouts/PortalLayout.tsx
- FOUND: marine-admin/src/app/components/RequireAuth.tsx
- FOUND: marine-admin/src/app/router.test.tsx
- FOUND commit 2017905: Task 1
- FOUND commit d10645e: Task 2
- TypeScript noEmit: 0 errors
- Vitest: 23/23 tests passed

---
*Phase: 00-project-foundation*
*Completed: 2026-04-05*
