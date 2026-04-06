---
phase: 00-project-foundation
plan: 01
subsystem: infra
tags: [react, typescript, vite, tailwind, antd, fsd, zustand, tanstack-query, react-router, msw, vitest, axios, dayjs]

# Dependency graph
requires: []
provides:
  - Vite 5 + React 18 + TypeScript 프로젝트 기반 (marine-admin/)
  - FSD 6-레이어 폴더 구조 (app/pages/widgets/features/entities/shared)
  - 21개 pages 폴더 (login, portal, sys01~sys18, common) placeholder
  - antd 5.29.3 해병대 네이비 테마 (#1E3A5F) + koKR 로케일
  - Tailwind CSS 3 (preflight:false, antd 충돌 방지)
  - 공통 API 타입 (PageRequest, PageResponse, ApiResult, ListParams)
  - axios 인스턴스 (apiClient, /api, 10000ms)
  - 한글 IME 가드 훅 (useEnterSubmit)
  - formatDate/formatDateTime 유틸리티
  - MSW 2 Service Worker 초기화 + handlers 구조
  - Vitest 4 + jsdom + @testing-library/react 테스트 인프라
  - 단위 테스트 9개 (date, ime, client)
affects: [00-02, 00-03, phase-1, phase-2, all-phases]

# Tech tracking
tech-stack:
  added:
    - react@18.3.1
    - typescript@5.6.2
    - vite@5.4.10
    - antd@5.29.3
    - "@ant-design/pro-components@2.8.10"
    - tailwindcss@3.4.19
    - zustand@5.0.12
    - "@tanstack/react-query@5.96.2"
    - react-router-dom@7.14.0
    - react-hook-form@7.72.1
    - zod@4.3.6
    - "@hookform/resolvers@5.2.2"
    - axios@1.14.0
    - dayjs@1.11.20
    - date-fns@4.1.0
    - msw@2.12.14
    - "@faker-js/faker@10.4.0"
    - vitest@4.1.2
    - "@testing-library/react@16.3.2"
    - "@testing-library/jest-dom@6.9.1"
  patterns:
    - "FSD 레이어 분리: app > pages > widgets > features > entities > shared"
    - "ConfigProvider + koKR 로케일 + QueryClient 를 Providers 컴포넌트로 래핑"
    - "MSW 비동기 초기화 (enableMocking().then) — dev 환경에서만 활성화"
    - "Tailwind preflight:false — antd 컴포넌트 내부는 antd 토큰, 외부는 Tailwind"
    - "Spring Boot DTO 관례 기반 API 타입 (PageResponse<T>, ApiResult<T>)"
    - "e.nativeEvent.isComposing 가드로 한글 IME Enter 이중 발화 방지"

key-files:
  created:
    - marine-admin/src/app/styles/antd-theme.ts
    - marine-admin/src/app/styles/index.css
    - marine-admin/src/app/providers.tsx
    - marine-admin/src/app/router.tsx
    - marine-admin/src/shared/api/types.ts
    - marine-admin/src/shared/api/client.ts
    - marine-admin/src/shared/api/mocks/browser.ts
    - marine-admin/src/shared/api/mocks/handlers/index.ts
    - marine-admin/src/shared/lib/date.ts
    - marine-admin/src/shared/lib/ime.ts
    - marine-admin/src/shared/types/index.ts
    - marine-admin/src/test/setup.ts
    - "marine-admin/src/pages/[21개 폴더]/index.tsx"
    - marine-admin/public/mockServiceWorker.js
  modified:
    - marine-admin/vite.config.ts
    - marine-admin/tsconfig.app.json
    - marine-admin/tailwind.config.js
    - marine-admin/package.json
    - marine-admin/src/main.tsx
    - marine-admin/src/App.tsx

key-decisions:
  - "antd@5.29.3 채택 (6.x 아닌 5.x) — ProComponents 2.x와 안정적 호환, React 18 환경"
  - "Tailwind preflight:false — antd global CSS reset과 충돌 방지, 레이아웃/간격에만 Tailwind 사용"
  - "MSW enableMocking() 비동기 패턴 — Service Worker 등록 완료 후 React 마운트 (Pitfall 2 방지)"
  - "FSD pages/ 레이어에 sys01~sys18 독립 슬라이스 — 서브시스템 간 코드 오염 차단"
  - "Spring Boot Page<T> 관례 PageResponse<T> — Mock→실API 전환 시 타입 계약 유지"

patterns-established:
  - "Providers 패턴: ConfigProvider(antdTheme, koKR) > AntdApp > QueryClientProvider"
  - "FSD import 방향: app -> pages -> widgets -> features -> entities -> shared"
  - "테스트 파일 위치: 구현 파일과 동일 폴더 (date.ts / date.test.ts)"
  - "API 클라이언트: axios.create({baseURL: '/api'}) + response interceptor"

requirements-completed: [BASE-01, BASE-02]

# Metrics
duration: 12min
completed: 2026-04-05
---

# Phase 00 Plan 01: 프로젝트 기반 구축 Summary

**Vite 5+React 18+TypeScript FSD 구조 초기화, antd 5.29.3 해병대 네이비 테마, Tailwind preflight:false 통합, Spring Boot 관례 API 타입, MSW 비동기 초기화, Vitest 9개 단위 테스트 통과**

## Performance

- **Duration:** 12 min
- **Started:** 2026-04-05T01:22:33Z
- **Completed:** 2026-04-05T01:34:52Z
- **Tasks:** 2
- **Files modified:** 35+

## Accomplishments

- FSD 6개 레이어(app/pages/widgets/features/entities/shared) + test 폴더 + 21개 pages 슬라이스 생성
- antd 5.29.3 네이비 블루 커스텀 테마 + koKR 로케일 + Tailwind 3 preflight:false 충돌 없는 통합
- 공통 API 타입(PageRequest/PageResponse/ApiResult) + axios 클라이언트 + IME 가드 훅 + 날짜 유틸리티
- MSW 비동기 초기화 패턴(enableMocking().then) 적용 — Service Worker 등록 보장
- Vitest 4 + jsdom 테스트 인프라, 단위 테스트 9개 전체 통과

## Task Commits

1. **Task 1: Vite 프로젝트 생성 + FSD 폴더 구조 + 패키지 설치 + Vitest 설정** - `a50661b` (feat)
2. **Task 2: Tailwind + Ant Design 테마 통합 + 공통 타입 + 유틸리티 + 단위 테스트** - `9809392` (feat)

## Files Created/Modified

- `marine-admin/src/app/styles/antd-theme.ts` — 해병대 네이비 테마 토큰 (colorPrimary: #1E3A5F)
- `marine-admin/src/app/providers.tsx` — ConfigProvider+koKR+QueryClientProvider 래퍼
- `marine-admin/src/app/styles/index.css` — Tailwind 3 디렉티브 + 최소 reset
- `marine-admin/src/main.tsx` — MSW 비동기 초기화(enableMocking) + React 마운트
- `marine-admin/src/shared/api/types.ts` — PageRequest/PageResponse/ApiResult/ListParams
- `marine-admin/src/shared/api/client.ts` — axios 인스턴스 (/api, 10000ms, interceptor)
- `marine-admin/src/shared/lib/ime.ts` — useEnterSubmit (isComposing IME 가드)
- `marine-admin/src/shared/lib/date.ts` — formatDate/formatDateTime (dayjs)
- `marine-admin/src/shared/api/mocks/browser.ts` — MSW setupWorker
- `marine-admin/src/test/setup.ts` — @testing-library/jest-dom matchers
- `marine-admin/vite.config.ts` — @ 별칭 + Vitest jsdom 테스트 블록
- `marine-admin/tailwind.config.js` — preflight:false 설정
- `marine-admin/public/mockServiceWorker.js` — MSW Service Worker

## Decisions Made

- **antd@5.29.3 유지**: RESEARCH.md에서 antd 6.x 가능성 언급했으나, ProComponents 2.x와의 호환성과 안정성을 위해 5.x 유지. React 18 환경에서 패치 없이 정상 동작 확인.
- **Tailwind preflight:false**: antd가 자체 CSS 리셋을 포함하므로 Tailwind preflight 비활성화가 필수. Tailwind는 외부 레이아웃/간격 전용으로 사용.
- **MSW 비동기 초기화**: enableMocking().then() 패턴으로 Service Worker 등록 완료를 보장한 후 React 마운트. 이를 통해 초기 API 호출도 MSW가 인터셉트 가능.

## Deviations from Plan

None — 계획대로 정확히 실행.

## Issues Encountered

None.

## User Setup Required

None — 외부 서비스 설정 불필요.

## Next Phase Readiness

- Plan 02 (라우팅/인증 Mock/레이아웃)에서 `src/app/router.tsx` 구현 가능
- Plan 03 (공통 컴포넌트 라이브러리)에서 `shared/ui/` 컴포넌트 구현 가능
- 모든 서브시스템 pages 폴더가 placeholder로 준비됨
- FSD 타입 계약(PageRequest/PageResponse/ApiResult)이 확정되어 모든 Phase에서 import 가능

## Self-Check: PASSED

- FOUND: marine-admin/src/app/styles/antd-theme.ts
- FOUND: marine-admin/src/app/providers.tsx
- FOUND: marine-admin/src/shared/api/types.ts
- FOUND: marine-admin/src/shared/api/client.ts
- FOUND: marine-admin/src/shared/lib/ime.ts
- FOUND: marine-admin/src/test/setup.ts
- FOUND: marine-admin/public/mockServiceWorker.js
- FOUND: .planning/phases/00-project-foundation/00-01-SUMMARY.md
- FOUND commit: a50661b (Task 1)
- FOUND commit: 9809392 (Task 2)
- TypeScript noEmit: 0 errors
- Vitest: 9/9 tests passed

---
*Phase: 00-project-foundation*
*Completed: 2026-04-05*
